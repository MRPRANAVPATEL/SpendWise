package com.expensetracker.offline.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

enum class ExpenseStatus {
    PENDING,
    SAVED
}

@Entity(
    tableName = "expenses",
    indices = [
        Index(value = ["upiReference"], unique = false),
        Index(value = ["timestamp"]),
        Index(value = ["status"])
    ]
)
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0L,
    val amount: Double,
    val paidTo: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val sender: String = "",
    val upiReference: String? = null,
    val userName: String = "",
    val status: ExpenseStatus = ExpenseStatus.PENDING,
    val isManual: Boolean = false,
    val rawMessage: String? = null
)
