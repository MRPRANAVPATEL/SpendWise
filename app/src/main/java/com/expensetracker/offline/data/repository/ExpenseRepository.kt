package com.expensetracker.offline.data.repository

import com.expensetracker.offline.data.local.ExpenseDao
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.data.local.ExpenseStatus
import com.expensetracker.offline.data.preferences.UserPreferencesRepository
import kotlinx.coroutines.flow.Flow

class ExpenseRepository(
    private val expenseDao: ExpenseDao,
    private val preferencesRepository: UserPreferencesRepository
) {
    val userName: Flow<String> = preferencesRepository.userNameFlow
    val reminderIntervalMinutes: Flow<Int> = preferencesRepository.reminderIntervalFlow
    val customBankKeywords: Flow<String> = preferencesRepository.customBankKeywordsFlow
    val pendingExpenses: Flow<List<ExpenseEntity>> = expenseDao.getPendingExpensesFlow()
    val quickSuggestions: Flow<List<String>> = expenseDao.getFrequentlyUsedLabels()
    val pendingCount: Flow<Int> = expenseDao.getPendingCountFlow()

    fun getSavedExpensesForMonth(startMillis: Long, endMillis: Long): Flow<List<ExpenseEntity>> {
        return expenseDao.getSavedExpensesByMonthFlow(startMillis, endMillis)
    }

    fun getAllSavedExpenses(): Flow<List<ExpenseEntity>> {
        return expenseDao.getAllSavedExpensesFlow()
    }

    suspend fun getAllSavedExpensesList(): List<ExpenseEntity> {
        return expenseDao.getAllSavedExpensesList()
    }

    suspend fun getExpenseById(id: Long): ExpenseEntity? {
        return expenseDao.getExpenseById(id)
    }

    suspend fun insertPendingExpense(
        amount: Double,
        sender: String,
        upiReference: String?,
        rawMessage: String,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        // Prevent duplicate using UPI reference
        if (!upiReference.isNullOrBlank()) {
            val existing = expenseDao.getExpenseByUpiRef(upiReference)
            if (existing != null) return -1L
        }

        // Prevent duplicate using amount + timestamp (within 2 min) + sender
        val similar = expenseDao.findRecentSimilar(amount, sender, timestamp)
        if (similar != null) return -1L

        val entity = ExpenseEntity(
            amount = amount,
            paidTo = "",
            timestamp = timestamp,
            sender = sender,
            upiReference = upiReference,
            status = ExpenseStatus.PENDING,
            isManual = false,
            rawMessage = rawMessage
        )
        return expenseDao.insertExpense(entity)
    }

    suspend fun insertManualExpense(
        amount: Double,
        paidTo: String,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        val entity = ExpenseEntity(
            amount = amount,
            paidTo = paidTo.trim(),
            timestamp = timestamp,
            sender = "MANUAL",
            upiReference = null,
            status = ExpenseStatus.SAVED,
            isManual = true
        )
        return expenseDao.insertExpense(entity)
    }

    suspend fun updateExpenseDetails(id: Long, amount: Double, paidTo: String) {
        val existing = expenseDao.getExpenseById(id) ?: return
        val updated = existing.copy(
            amount = amount,
            paidTo = paidTo.trim(),
            status = ExpenseStatus.SAVED
        )
        expenseDao.updateExpense(updated)
    }

    suspend fun deleteExpense(id: Long) {
        expenseDao.deleteById(id)
    }

    suspend fun getPendingExpensesList(): List<ExpenseEntity> {
        return expenseDao.getPendingExpensesList()
    }

    suspend fun saveUserName(name: String) {
        preferencesRepository.setUserName(name)
    }

    suspend fun saveReminderInterval(minutes: Int) {
        preferencesRepository.setReminderInterval(minutes)
    }

    suspend fun saveCustomBankKeywords(keywords: String) {
        preferencesRepository.setCustomBankKeywords(keywords)
    }
}
