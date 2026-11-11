package com.expensetracker.offline.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Calendar

data class DashboardUiState(
    val userName: String = "",
    val currentMonthCalendar: Calendar = Calendar.getInstance(),
    val monthlyTotal: Double = 0.0,
    val todayTotal: Double = 0.0,
    val pendingExpenses: List<ExpenseEntity> = emptyList(),
    val savedExpenses: List<ExpenseEntity> = emptyList(),
    val searchQuery: String = "",
    val filteredExpenses: List<ExpenseEntity> = emptyList(),
    val quickSuggestions: List<String> = emptyList()
)

class DashboardViewModel(
    private val repository: ExpenseRepository
) : ViewModel() {

    private val _currentCalendar = MutableStateFlow(Calendar.getInstance())
    private val _searchQuery = MutableStateFlow("")

    val uiState: StateFlow<DashboardUiState> = combine(
        repository.userName,
        _currentCalendar,
        repository.pendingExpenses,
        repository.quickSuggestions,
        _searchQuery
    ) { name, cal, pending, suggestions, query ->
        val (startMillis, endMillis) = getMonthRange(cal)
        val saved = repository.getSavedExpensesForMonth(startMillis, endMillis).first()

        val monthlySum = saved.sumOf { it.amount }

        val todayCal = Calendar.getInstance()
        val todayStart = todayCal.apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis

        val todayEnd = todayCal.apply {
            set(Calendar.HOUR_OF_DAY, 23)
            set(Calendar.MINUTE, 59)
            set(Calendar.SECOND, 59)
            set(Calendar.MILLISECOND, 999)
        }.timeInMillis

        val todaySum = saved.filter { it.timestamp in todayStart..todayEnd }.sumOf { it.amount }

        val filtered = if (query.isBlank()) {
            saved
        } else {
            saved.filter {
                it.paidTo.contains(query, ignoreCase = true) ||
                it.amount.toString().contains(query) ||
                it.sender.contains(query, ignoreCase = true)
            }
        }

        DashboardUiState(
            userName = name,
            currentMonthCalendar = cal,
            monthlyTotal = monthlySum,
            todayTotal = todaySum,
            pendingExpenses = pending,
            savedExpenses = saved,
            searchQuery = query,
            filteredExpenses = filtered,
            quickSuggestions = suggestions
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = DashboardUiState()
    )

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
    }

    fun previousMonth() {
        val cal = (_currentCalendar.value.clone() as Calendar).apply {
            add(Calendar.MONTH, -1)
        }
        _currentCalendar.value = cal
    }

    fun nextMonth() {
        val cal = (_currentCalendar.value.clone() as Calendar).apply {
            add(Calendar.MONTH, 1)
        }
        _currentCalendar.value = cal
    }

    fun addManualExpense(amount: Double, paidTo: String, timestamp: Long) {
        viewModelScope.launch {
            repository.insertManualExpense(amount, paidTo, timestamp)
        }
    }

    fun updateExpense(id: Long, amount: Double, paidTo: String) {
        viewModelScope.launch {
            repository.updateExpenseDetails(id, amount, paidTo)
        }
    }

    fun deleteExpense(id: Long) {
        viewModelScope.launch {
            repository.deleteExpense(id)
        }
    }

    private fun getMonthRange(calendar: Calendar): Pair<Long, Long> {
        val cal = calendar.clone() as Calendar
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis

        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH))
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        val end = cal.timeInMillis

        return Pair(start, end)
    }
}
