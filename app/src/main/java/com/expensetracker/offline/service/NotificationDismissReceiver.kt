package com.expensetracker.offline.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.data.local.ExpenseStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Android 14 allows users to dismiss ongoing notifications.
 * This receiver catches dismiss actions and immediately re-posts the notification
 * if the expense entry is still PENDING in the Room database.
 */
class NotificationDismissReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val expenseId = intent.getLongExtra(EXTRA_EXPENSE_ID, -1L)
        val amount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        val sender = intent.getStringExtra(EXTRA_SENDER) ?: ""

        if (expenseId <= 0L) return

        val app = context.applicationContext as ExpenseApplication
        CoroutineScope(Dispatchers.IO).launch {
            val expense = app.repository.getExpenseById(expenseId)
            if (expense != null && expense.status == ExpenseStatus.PENDING) {
                // Re-post persistent notification
                NotificationHelper.showPendingExpenseNotification(
                    context = context,
                    expenseId = expense.id,
                    amount = expense.amount,
                    sender = expense.sender
                )
            }
        }
    }

    companion object {
        const val EXTRA_EXPENSE_ID = "extra_expense_id"
        const val EXTRA_AMOUNT = "extra_amount"
        const val EXTRA_SENDER = "extra_sender"
    }
}
