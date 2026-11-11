package com.expensetracker.offline.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity): Long

    @Update
    suspend fun updateExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)

    @Query("DELETE FROM expenses WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT * FROM expenses WHERE id = :id LIMIT 1")
    suspend fun getExpenseById(id: Long): ExpenseEntity?

    @Query("SELECT * FROM expenses WHERE upiReference = :upiRef LIMIT 1")
    suspend fun getExpenseByUpiRef(upiRef: String): ExpenseEntity?

    @Query("""
        SELECT * FROM expenses 
        WHERE amount = :amount 
          AND sender = :sender 
          AND abs(timestamp - :timestamp) < 120000 
        LIMIT 1
    """)
    suspend fun findRecentSimilar(amount: Double, sender: String, timestamp: Long): ExpenseEntity?

    @Query("SELECT * FROM expenses WHERE status = 'PENDING' ORDER BY timestamp DESC")
    fun getPendingExpensesFlow(): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'PENDING' ORDER BY timestamp DESC")
    suspend fun getPendingExpensesList(): List<ExpenseEntity>

    @Query("""
        SELECT * FROM expenses 
        WHERE status = 'SAVED' 
          AND timestamp >= :startMillis 
          AND timestamp <= :endMillis 
        ORDER BY timestamp DESC
    """)
    fun getSavedExpensesByMonthFlow(startMillis: Long, endMillis: Long): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'SAVED' ORDER BY timestamp DESC")
    fun getAllSavedExpensesFlow(): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses WHERE status = 'SAVED' ORDER BY timestamp ASC")
    suspend fun getAllSavedExpensesList(): List<ExpenseEntity>

    @Query("""
        SELECT DISTINCT paidTo FROM expenses 
        WHERE status = 'SAVED' AND paidTo != '' 
        GROUP BY paidTo 
        ORDER BY COUNT(paidTo) DESC 
        LIMIT 15
    """)
    fun getFrequentlyUsedLabels(): Flow<List<String>>

    @Query("SELECT COUNT(*) FROM expenses WHERE status = 'PENDING'")
    fun getPendingCountFlow(): Flow<Int>
}
