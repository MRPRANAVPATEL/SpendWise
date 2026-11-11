package com.expensetracker.offline

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.expensetracker.offline.data.local.AppDatabase
import com.expensetracker.offline.data.preferences.UserPreferencesRepository
import com.expensetracker.offline.data.repository.ExpenseRepository
import com.expensetracker.offline.service.PendingReminderWorker
import java.util.concurrent.TimeUnit

class ExpenseApplication : Application() {

    lateinit var database: AppDatabase
        private set

    lateinit var preferencesRepository: UserPreferencesRepository
        private set

    lateinit var repository: ExpenseRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = AppDatabase.getDatabase(this)
        preferencesRepository = UserPreferencesRepository(this)
        repository = ExpenseRepository(database.expenseDao(), preferencesRepository)

        createNotificationChannels()
        schedulePendingReminderWorker(30) // default 30 minutes
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID_PENDING_EXPENSE,
                getString(R.string.channel_pending_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_pending_desc)
                enableVibration(true)
                setShowBadge(true)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun schedulePendingReminderWorker(intervalMinutes: Long) {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(false)
            .build()

        // Minimum WorkManager periodic interval is 15 minutes
        val effectiveMinutes = intervalMinutes.coerceAtLeast(15)

        val workRequest = PeriodicWorkRequestBuilder<PendingReminderWorker>(
            effectiveMinutes, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            WORK_NAME_PENDING_REMINDER,
            ExistingPeriodicWorkPolicy.UPDATE,
            workRequest
        )
    }

    companion object {
        const val CHANNEL_ID_PENDING_EXPENSE = "cashtrace_pending_channel"
        const val WORK_NAME_PENDING_REMINDER = "cashtrace_pending_reminder_work"

        lateinit var instance: ExpenseApplication
            private set
    }
}
