package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.provider.Telephony
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Manifest-registered BroadcastReceiver for SMS_RECEIVED.
 * Triggers even when the app is closed.
 */
class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        if (messages.isEmpty()) return

        val fullBodyBuilder = StringBuilder()
        var sender = ""

        for (sms in messages) {
            fullBodyBuilder.append(sms.displayMessageBody)
            if (sender.isBlank()) {
                sender = sms.displayOriginatingAddress ?: ""
            }
        }

        val fullBody = fullBodyBuilder.toString()
        val parsed = SmsParser.parse(fullBody, sender)

        if (parsed.isDebit && parsed.amount != null) {
            val app = context.applicationContext as ExpenseApplication

            CoroutineScope(Dispatchers.IO).launch {
                val expenseId = app.repository.insertPendingExpense(
                    amount = parsed.amount,
                    sender = parsed.sender,
                    upiReference = parsed.upiReference,
                    rawMessage = parsed.rawMessage
                )

                if (expenseId != -1L) {
                    val pendingCount = app.repository.getPendingExpensesList().size

                    // 1. Post High-Priority Persistent Notification (Heads-Up & Full-Screen Intent)
                    NotificationHelper.showPendingExpenseNotification(
                        context = context,
                        expenseId = expenseId,
                        amount = parsed.amount,
                        sender = parsed.sender,
                        pendingTotalCount = pendingCount
                    )

                    // 2. Launch Instant Dialog Popup over current app if overlay permission is granted
                    if (canDrawOverlays(context)) {
                        val popupIntent = Intent(context, ExpensePopupActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                                    Intent.FLAG_ACTIVITY_CLEAR_TOP or 
                                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expenseId)
                            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, parsed.amount)
                            putExtra(ExpensePopupActivity.EXTRA_SENDER, parsed.sender)
                            putExtra(ExpensePopupActivity.EXTRA_REF_NO, parsed.upiReference)
                        }
                        context.startActivity(popupIntent)
                    }
                }
            }
        }
    }

    private fun canDrawOverlays(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true
        }
    }
}
