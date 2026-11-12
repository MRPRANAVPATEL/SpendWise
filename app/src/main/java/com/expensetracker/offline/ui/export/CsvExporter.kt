package com.expensetracker.offline.ui.export

import android.content.Context
import android.content.Intent
import androidx.core.content.FileProvider
import com.expensetracker.offline.data.local.ExpenseEntity
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CsvExporter {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    private val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    private val monthFormat = SimpleDateFormat("yyyy-MM", Locale.getDefault())

    fun generateCsvContent(expenses: List<ExpenseEntity>): String {
        val sb = StringBuilder()
        // UTF-8 BOM so Excel and Google Sheets open ₹ and accents properly
        sb.append("\uFEFF")

        // Headers
        sb.append("Date,Time,Amount,Paid To / Type,Reference No,Month,Source\n")

        var totalAmount = 0.0

        for (expense in expenses) {
            val dateStr = dateFormat.format(Date(expense.timestamp))
            val timeStr = timeFormat.format(Date(expense.timestamp))
            val monthStr = monthFormat.format(Date(expense.timestamp))
            val amountStr = "%.2f".format(expense.amount)
            val paidToEscaped = escapeCsv(expense.paidTo)
            val refNoEscaped = escapeCsv(expense.upiReference ?: "")
            val source = if (expense.isManual) "Manual" else "SMS (${expense.sender})"

            totalAmount += expense.amount

            sb.append("$dateStr,$timeStr,$amountStr,$paidToEscaped,$refNoEscaped,$monthStr,$source\n")
        }

        // Summary row
        sb.append("\nTotal,,${"%.2f".format(totalAmount)},,,,\n")

        return sb.toString()
    }

    fun exportAndShare(context: Context, expenses: List<ExpenseEntity>, rangeTitle: String) {
        try {
            val csvData = generateCsvContent(expenses)

            val exportDir = File(context.cacheDir, "exports")
            if (!exportDir.exists()) exportDir.mkdirs()

            val fileName = "CashTrace_Expenses_${rangeTitle.replace(" ", "_")}.csv"
            val file = File(exportDir, fileName)

            OutputStreamWriter(FileOutputStream(file), StandardCharsets.UTF_8).use { writer ->
                writer.write(csvData)
            }

            val uri = FileProvider.getUriForFile(
                context,
                "com.expensetracker.offline.fileprovider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, "CashTrace Expense Export - $rangeTitle")
                putExtra(Intent.EXTRA_TEXT, "Here is your expense report for $rangeTitle.")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(Intent.createChooser(shareIntent, "Share or Save Expense CSV"))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun escapeCsv(value: String): String {
        var str = value.replace("\"", "\"\"")
        if (str.contains(",") || str.contains("\n") || str.contains("\r") || str.contains("\"")) {
            str = "\"$str\""
        }
        return str
    }
}
