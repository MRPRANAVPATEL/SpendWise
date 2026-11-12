package com.expensetracker.offline.ui.settings

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.expensetracker.offline.ExpenseApplication
import com.expensetracker.offline.service.NotificationHelper
import com.expensetracker.offline.service.SmsReceiver
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = ExpenseApplication.instance
    val scope = rememberCoroutineScope()

    var userName by remember { mutableStateOf("") }
    var reminderInterval by remember { mutableStateOf(30) }
    var customKeywords by remember { mutableStateOf("") }

    // Live permission states
    var hasSmsPermission by remember { mutableStateOf(checkSmsPermission(context)) }
    var hasNotificationPermission by remember { mutableStateOf(checkNotificationPermission(context)) }
    var hasOverlayPermission by remember { mutableStateOf(checkOverlayPermission(context)) }
    var isBatteryUnrestricted by remember { mutableStateOf(checkBatteryUnrestricted(context)) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) {
        hasSmsPermission = checkSmsPermission(context)
        hasNotificationPermission = checkNotificationPermission(context)
    }

    LaunchedEffect(Unit) {
        userName = app.repository.userName.first()
        reminderInterval = app.repository.reminderIntervalMinutes.first()
        customKeywords = app.repository.customBankKeywords.first()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Samsung Setup") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Profile", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = userName,
                            onValueChange = {
                                userName = it
                                scope.launch { app.repository.saveUserName(it) }
                            },
                            label = { Text("Your Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }

            // Permissions Checklist
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("System Permissions Checklist", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))

                        PermissionStatusRow(
                            title = "SMS Detection (RECEIVE_SMS)",
                            isGranted = hasSmsPermission,
                            actionLabel = "Grant",
                            onAction = {
                                permissionLauncher.launch(
                                    arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
                                )
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Notifications (Android 13+)",
                            isGranted = hasNotificationPermission,
                            actionLabel = "Grant",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                    permissionLauncher.launch(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
                                }
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Display over other apps (Overlay)",
                            isGranted = hasOverlayPermission,
                            actionLabel = "Enable in Settings",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    val intent = Intent(
                                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                                        Uri.parse("package:${context.packageName}")
                                    )
                                    context.startActivity(intent)
                                }
                            }
                        )

                        Divider(modifier = Modifier.padding(vertical = 8.dp))

                        PermissionStatusRow(
                            title = "Battery Unrestricted (No Killing)",
                            isGranted = isBatteryUnrestricted,
                            actionLabel = "Ignore Optimization",
                            onAction = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                        data = Uri.parse("package:${context.packageName}")
                                    }
                                    context.startActivity(intent)
                                }
                            }
                        )
                    }
                }
            }

            // Samsung One UI Specific Guidance Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Settings, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Samsung One UI Setup Guide", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "To prevent Samsung One UI from killing CashTrace in the background:\n\n" +
                                    "1. Allow restricted settings: App info > Three dots (top right) > Tap 'Allow restricted settings'.\n" +
                                    "2. Battery: App info > Battery > Select 'Unrestricted'.\n" +
                                    "3. Deep sleeping apps: Settings > Battery > Background usage limits > Ensure CashTrace is NOT in 'Sleeping apps' or 'Deep sleeping apps'. Add it to 'Never sleeping apps'.\n" +
                                    "4. Auto-launch: Ensure 'Auto start' or 'Run in background' is permitted.",
                            style = MaterialTheme.typography.bodySmall,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                    data = Uri.parse("package:${context.packageName}")
                                }
                                context.startActivity(intent)
                            },
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Open App Info")
                        }
                    }
                }
            }

            // Reminder Interval Setting
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Pending Reminder Frequency", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = "WorkManager re-alerts for unlabelled expenses",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(15, 30, 60, 120).forEach { minutes ->
                                val label = if (minutes < 60) "${minutes}m" else "${minutes / 60}h"
                                FilterChip(
                                    selected = reminderInterval == minutes,
                                    onClick = {
                                        reminderInterval = minutes
                                        scope.launch {
                                            app.repository.saveReminderInterval(minutes)
                                            app.schedulePendingReminderWorker(minutes.toLong())
                                        }
                                    },
                                    label = { Text(label) }
                                )
                            }
                        }
                    }
                }
            }

            // Test Popup Button
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Simulate Bank Debit SMS", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(
                            text = "Inject a fake bank SMS to verify the instant popup, persistent notification, and swipe-away protection without spending real money.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Button(
                            onClick = {
                                val fakeAmount = 899.00
                                val fakeSender = "SBIUPI"
                                val fakeRef = "4012" + (10000000..99999999).random()

                                scope.launch {
                                    val id = app.repository.insertPendingExpense(
                                        amount = fakeAmount,
                                        sender = fakeSender,
                                        upiReference = fakeRef,
                                        rawMessage = "A/C *1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No $fakeRef."
                                    )
                                    if (id > 0) {
                                        NotificationHelper.showPendingExpenseNotification(
                                            context = context,
                                            expenseId = id,
                                            amount = fakeAmount,
                                            sender = fakeSender
                                        )
                                        // Also launch popup activity
                                        val popupIntent = Intent(context, com.expensetracker.offline.ui.popup.ExpensePopupActivity::class.java).apply {
                                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_EXPENSE_ID, id)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_AMOUNT, fakeAmount)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_SENDER, fakeSender)
                                            putExtra(com.expensetracker.offline.ui.popup.ExpensePopupActivity.EXTRA_REF_NO, fakeRef)
                                        }
                                        context.startActivity(popupIntent)
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Test Popup with Fake ₹899 SMS")
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun PermissionStatusRow(
    title: String,
    isGranted: Boolean,
    actionLabel: String,
    onAction: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(
                text = if (isGranted) "Granted" else "Missing / Denied",
                style = MaterialTheme.typography.labelSmall,
                color = if (isGranted) Color(0xFF10B981) else Color(0xFFEF4444),
                fontWeight = FontWeight.Bold
            )
        }

        if (!isGranted) {
            TextButton(onClick = onAction) {
                Text(actionLabel)
            }
        } else {
            Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF10B981))
        }
    }
}

private fun checkSmsPermission(context: Context): Boolean {
    return ContextCompat.checkSelfPermission(context, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED
}

private fun checkNotificationPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    } else {
        true
    }
}

private fun checkOverlayPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
    } else {
        true
    }
}

private fun checkBatteryUnrestricted(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        powerManager.isIgnoringBatteryOptimizations(context.packageName)
    } else {
        true
    }
}
