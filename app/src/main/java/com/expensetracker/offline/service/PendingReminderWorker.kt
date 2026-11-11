package com.expensetracker.offline.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.expensetracker.offline.ExpenseApplication

/**
 * Periodic background worker that checks for any PENDING expenses in Room,
 * ensuring notifications remain active and visible.
 */
class PendingReminderWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? ExpenseApplication ?: return Result.failure()
        val pendingList = app.repository.getPendingExpensesList()

        if (pendingList.isNotEmpty()) {
            pendingList.forEach { expense ->
                NotificationHelper.showPendingExpenseNotification(
                    context = applicationContext,
                    expenseId = expense.id,
                    amount = expense.amount,
                    sender = expense.sender,
                    pendingTotalCount = pendingList.size
                )
            }
        }

        return Result.success()
    }
}
