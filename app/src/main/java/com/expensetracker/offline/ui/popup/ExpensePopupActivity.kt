package com.expensetracker.offline.ui.popup

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.service.NotificationHelper
import com.expensetracker.offline.ui.theme.CashTraceTheme
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class ExpensePopupActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val expenseId = intent.getLongExtra(EXTRA_EXPENSE_ID, -1L)
        val initialAmount = intent.getDoubleExtra(EXTRA_AMOUNT, 0.0)
        val sender = intent.getStringExtra(EXTRA_SENDER) ?: ""
        val refNo = intent.getStringExtra(EXTRA_REF_NO)

        setContent {
            CashTraceTheme {
                ExpensePopupContent(
                    initialAmount = initialAmount,
                    sender = sender,
                    refNo = refNo,
                    onSave = { updatedAmount, label ->
                        saveAndDismiss(expenseId, updatedAmount, label)
                    },
                    onLater = {
                        // Dismiss popup, notification remains ongoing
                        finish()
                    }
                )
            }
        }
    }

    private fun saveAndDismiss(expenseId: Long, amount: Double, label: String) {
        val app = application as ExpenseApplication
        val scope = (application as ExpenseApplication)
        kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
            if (expenseId > 0L) {
                app.repository.updateExpenseDetails(expenseId, amount, label)
                NotificationHelper.cancelNotification(this@ExpensePopupActivity, expenseId)

                // Check remaining pending count to update or clear summary badge
                val remaining = app.repository.getPendingExpensesList().size
                if (remaining <= 1) {
                    NotificationHelper.cancelSummaryNotification(this@ExpensePopupActivity)
                }
            } else {
                app.repository.insertManualExpense(amount, label)
            }
            finish()
        }
    }

    companion object {
        const val EXTRA_EXPENSE_ID = "extra_expense_id"
        const val EXTRA_AMOUNT = "extra_amount"
        const val EXTRA_SENDER = "extra_sender"
        const val EXTRA_REF_NO = "extra_ref_no"
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ExpensePopupContent(
    initialAmount: Double,
    sender: String,
    refNo: String?,
    onSave: (amount: Double, label: String) -> Unit,
    onLater: () -> Unit
) {
    var amountText by remember { mutableStateOf(if (initialAmount > 0) "%.2f".format(initialAmount) else "") }
    var labelText by remember { mutableStateOf("") }
    var suggestions by remember { mutableStateOf<List<String>>(emptyList()) }

    val app = ExpenseApplication.instance
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            suggestions = app.repository.quickSuggestions.first()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp)),
            elevation = CardDefaults.cardElevation(defaultElevation = 12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Debit Detected",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        if (sender.isNotBlank()) {
                            Text(
                                text = "From $sender" + if (!refNo.isNullOrBlank()) " • Ref $refNo" else "",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    IconButton(onClick = onLater) {
                        Icon(Icons.Default.Close, contentDescription = "Later")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Amount Field
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    prefix = { Text("₹ ", fontWeight = FontWeight.Bold) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Paid To / Type Field
                OutlinedTextField(
                    value = labelText,
                    onValueChange = { labelText = it },
                    label = { Text("Paid to / Type of payment") },
                    placeholder = { Text("e.g. Vraj - recharge, Groceries, Swiggy") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                // Quick Suggestion Chips
                if (suggestions.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Quick suggestions:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        suggestions.take(6).forEach { chip ->
                            SuggestionChip(
                                onClick = { labelText = chip },
                                label = { Text(chip) },
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onLater,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Later")
                    }

                    Button(
                        onClick = {
                            val parsedAmount = amountText.toDoubleOrNull() ?: initialAmount
                            if (parsedAmount > 0) {
                                onSave(parsedAmount, labelText)
                            }
                        },
                        modifier = Modifier.weight(1.5f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save")
                    }
                }
            }
        }
    }
}
