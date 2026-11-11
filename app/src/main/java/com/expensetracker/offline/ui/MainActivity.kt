package com.expensetracker.offline.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.data.local.ExpenseEntity
import com.expensetracker.offline.ui.dashboard.DashboardScreen
import com.expensetracker.offline.ui.dashboard.DashboardViewModel
import com.expensetracker.offline.ui.navigation.Screen
import com.expensetracker.offline.ui.onboarding.OnboardingScreen
import com.expensetracker.offline.ui.popup.ExpensePopupActivity
import com.expensetracker.offline.ui.settings.SettingsScreen
import com.expensetracker.offline.ui.theme.CashTraceTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val app = application as ExpenseApplication
        val dashboardViewModel = DashboardViewModel(app.repository)

        setContent {
            CashTraceTheme {
                var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }
                var isInitialized by remember { mutableStateOf(false) }
                val scope = rememberCoroutineScope()

                LaunchedEffect(Unit) {
                    val name = app.repository.userName.first()
                    currentScreen = if (name.isBlank()) Screen.Onboarding else Screen.Dashboard
                    isInitialized = true
                }

                if (isInitialized) {
                    when (currentScreen) {
                        is Screen.Onboarding -> {
                            OnboardingScreen(
                                onContinue = { name ->
                                    scope.launch {
                                        app.repository.saveUserName(name)
                                        currentScreen = Screen.Dashboard
                                    }
                                }
                            )
                        }
                        is Screen.Dashboard -> {
                            DashboardScreen(
                                viewModel = dashboardViewModel,
                                onNavigateToSettings = { currentScreen = Screen.Settings },
                                onOpenPopupForPending = { pending ->
                                    openPopupForExpense(pending)
                                }
                            )
                        }
                        is Screen.Settings -> {
                            SettingsScreen(
                                onNavigateBack = { currentScreen = Screen.Dashboard }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun openPopupForExpense(expense: ExpenseEntity) {
        val intent = Intent(this, ExpensePopupActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(ExpensePopupActivity.EXTRA_EXPENSE_ID, expense.id)
            putExtra(ExpensePopupActivity.EXTRA_AMOUNT, expense.amount)
            putExtra(ExpensePopupActivity.EXTRA_SENDER, expense.sender)
            putExtra(ExpensePopupActivity.EXTRA_REF_NO, expense.upiReference)
        }
        startActivity(intent)
    }
}
