package com.expensetracker.offline.data.local

import androidx.room.TypeConverter

class Converters {

    @TypeConverter
    fun fromStatus(status: ExpenseStatus?): String {
        return status?.name ?: ExpenseStatus.PENDING.name
    }

    @TypeConverter
    fun toStatus(value: String?): ExpenseStatus {
        return try {
            if (value != null) ExpenseStatus.valueOf(value) else ExpenseStatus.PENDING
        } catch (e: Exception) {
            ExpenseStatus.PENDING
        }
    }
}
