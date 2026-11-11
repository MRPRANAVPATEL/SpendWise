package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.expensetracker.offline.ExpenseApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Restores persistent notifications for all PENDING expenses upon device restart,
 * and ensures the WorkManager reminder is running.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            val app = context.applicationContext as ExpenseApplication

            CoroutineScope(Dispatchers.IO).launch {
                // Reschedule WorkManager
                val interval = app.repository.reminderIntervalMinutes.first()
                app.schedulePendingReminderWorker(interval.toLong())

                // Re-post all pending expense notifications
                val pendingList = app.repository.getPendingExpensesList()
                pendingList.forEach { expense ->
                    NotificationHelper.showPendingExpenseNotification(
                        context = context,
                        expenseId = expense.id,
                        amount = expense.amount,
                        sender = expense.sender,
                        pendingTotalCount = pendingList.size
                    )
                }
            }
        }
    }
}
