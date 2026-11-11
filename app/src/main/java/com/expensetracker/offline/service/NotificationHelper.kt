package com.expensetracker.offline.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.R
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import java.text.NumberFormat
import java.util.Locale

object NotificationHelper {

    private const val NOTIFICATION_ID_BASE = 1000
    private const val SUMMARY_NOTIFICATION_ID = 999
    private const val GROUP_KEY_PENDING = "com.expensetracker.offline.PENDING_GROUP"

    fun showPendingExpenseNotification(
        context: Context,
        expenseId: Long,
        amount: Double,
        sender: String,
        pendingTotalCount: Int = 1
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val formattedAmount = formatCurrency(amount)
        val title = "$formattedAmount spent – tap to add details"
        val content = if (sender.isNotBlank()) "Via $sender • Tap to save type/label" else "Tap to add payment type or label"

        // Intent to launch the instant popup
        val popupIntent = Intent(context, ExpensePopupActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expenseId)
            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, amount)
            putExtra(ExpensePopupActivity.EXTRA_SENDER, sender)
        }

        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val contentPendingIntent = PendingIntent.getActivity(
            context,
            expenseId.toInt(),
            popupIntent,
            flags
        )

        // Android 14+ swipe-away guard: deleteIntent immediately re-posts if entry is still pending
        val deleteIntent = Intent(context, NotificationDismissReceiver::class.java).apply {
            putExtra(NotificationDismissReceiver.EXTRA_EXPENSE_ID, expenseId)
            putExtra(NotificationDismissReceiver.EXTRA_AMOUNT, amount)
            putExtra(NotificationDismissReceiver.EXTRA_SENDER, sender)
        }
        val deletePendingIntent = PendingIntent.getBroadcast(
            context,
            (expenseId + 50000).toInt(),
            deleteIntent,
            flags
        )

        val builder = NotificationCompat.Builder(context, ExpenseApplication.CHANNEL_ID_PENDING_EXPENSE)
            .setSmallIcon(R.drawable.ic_stat_expense)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true) // Persistent reminder
            .setAutoCancel(false)
            .setContentIntent(contentPendingIntent)
            .setDeleteIntent(deletePendingIntent)
            .setFullScreenIntent(contentPendingIntent, true) // Heads-up instant popup on payment
            .setGroup(GROUP_KEY_PENDING)
            .addAction(
                R.drawable.ic_stat_expense,
                context.getString(R.string.add_details),
                contentPendingIntent
            )

        notificationManager.notify((NOTIFICATION_ID_BASE + expenseId).toInt(), builder.build())

        // Summary notification when multiple expenses are pending
        if (pendingTotalCount > 1) {
            val summaryNotification = NotificationCompat.Builder(context, ExpenseApplication.CHANNEL_ID_PENDING_EXPENSE)
                .setSmallIcon(R.drawable.ic_stat_expense)
                .setContentTitle("$pendingTotalCount expenses need details")
                .setContentText("Tap to view and label all pending expenses")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setGroup(GROUP_KEY_PENDING)
                .setGroupSummary(true)
                .setAutoCancel(false)
                .setOngoing(true)
                .setContentIntent(contentPendingIntent)
                .build()

            notificationManager.notify(SUMMARY_NOTIFICATION_ID, summaryNotification)
        }
    }

    fun cancelNotification(context: Context, expenseId: Long) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel((NOTIFICATION_ID_BASE + expenseId).toInt())
    }

    fun cancelSummaryNotification(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(SUMMARY_NOTIFICATION_ID)
    }

    private fun formatCurrency(amount: Double): String {
        return try {
            val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
            format.format(amount)
        } catch (e: Exception) {
            "₹%.2f".format(amount)
        }
    }
}
