package com.expensetracker.offline.service

import java.util.regex.Pattern

data class ParsedSmsResult(
    val isDebit: Boolean,
    val amount: Double? = null,
    val upiReference: String? = null,
    val sender: String = "",
    val account: String? = null,
    val rawMessage: String = ""
)

object SmsParser {

    private val DEBIT_KEYWORDS = listOf(
        Pattern.compile("\bdebited\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bdebit\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bspent\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bpaid\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bsent\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\btransferred\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\btransfer to\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bpayment of\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bwithdrawn\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bpurchased\b", Pattern.CASE_INSENSITIVE)
    )

    private val CREDIT_KEYWORDS = listOf(
        Pattern.compile("\bcredited\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bcredit\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\breceived\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bdeposited\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\brefunded\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\breversed\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bcashback\b", Pattern.CASE_INSENSITIVE)
    )

    private val OTP_KEYWORDS = listOf(
        Pattern.compile("\botp\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bone time password\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bverification code\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\bdo not share\b", Pattern.CASE_INSENSITIVE),
        Pattern.compile("\blogin code\b", Pattern.CASE_INSENSITIVE)
    )

    // Regex directly capturing debit-context amounts: "debited by 899.00", "paid Rs. 2,500", etc.
    // Supports Indian numbering system: 1,50,000.00 and standard 1,000,000.00
    private val DEBIT_SPECIFIC_AMOUNT_PATTERN = Pattern.compile(
        "(?:debited\s*(?:by|for|with)?|paid|spent|sent|payment\s*of)\s*(?:Rs\.?|INR|₹)?\s*([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val GENERAL_CURRENCY_AMOUNT_PATTERN = Pattern.compile(
        "(?:(?:Rs\.?|INR|₹)\s*)([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val BALANCE_PATTERN = Pattern.compile(
        "(?:bal(?:ance)?|avl\s*bal(?:ance)?)\s*(?:is|:)?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)",
        Pattern.CASE_INSENSITIVE
    )

    private val REF_PATTERN = Pattern.compile(
        "(?:ref(?:erence)?\s*(?:no\.?|num\.?)?|upi\s*ref(?:erence)?(?:\s*no\.?)?|txn\s*(?:id|no\.?)?|rrn[:\s]|utr[:\s])\s*[:#-]?\s*([A-Za-z0-9]{6,22})",
        Pattern.CASE_INSENSITIVE
    )

    private val ACCOUNT_PATTERN = Pattern.compile(
        "(?:a/c|acct|account)\s*(?:no\.?)?\s*[*Xx]*([0-9]{3,6})",
        Pattern.CASE_INSENSITIVE
    )

    fun parse(message: String, sender: String = "BANK"): ParsedSmsResult {
        // 1. Filter out OTPs
        for (pattern in OTP_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
            }
        }

        // 2. Filter out Credits
        for (pattern in CREDIT_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
            }
        }

        // 3. Must have explicit debit indicator
        var hasDebitKeyword = false
        for (pattern in DEBIT_KEYWORDS) {
            if (pattern.matcher(message).find()) {
                hasDebitKeyword = true
                break
            }
        }
        if (!hasDebitKeyword) {
            return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
        }

        // 4. Extract Amount
        var amount: Double? = null

        // Try debit-context amount first
        val debitMatcher = DEBIT_SPECIFIC_AMOUNT_PATTERN.matcher(message)
        if (debitMatcher.find()) {
            val rawAmt = debitMatcher.group(1)?.replace(",", "")
            amount = rawAmt?.toDoubleOrNull()
        }

        // If not found, look for currency symbols and disambiguate from balance
        if (amount == null || amount <= 0.0) {
            var balAmount: Double? = null
            val balMatcher = BALANCE_PATTERN.matcher(message)
            if (balMatcher.find()) {
                balAmount = balMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
            }

            val curMatcher = GENERAL_CURRENCY_AMOUNT_PATTERN.matcher(message)
            while (curMatcher.find()) {
                val candidate = curMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
                if (candidate != null && candidate > 0.0) {
                    if (balAmount == null || Math.abs(candidate - balAmount) > 0.001) {
                        amount = candidate
                        break
                    }
                }
            }
        }

        if (amount == null || amount <= 0.0) {
            return ParsedSmsResult(isDebit = false, rawMessage = message, sender = sender)
        }

        // 5. Extract Reference No
        var upiRef: String? = null
        val refMatcher = REF_PATTERN.matcher(message)
        if (refMatcher.find()) {
            upiRef = refMatcher.group(1)?.trim()
        }

        // 6. Extract Account
        var account: String? = null
        val accMatcher = ACCOUNT_PATTERN.matcher(message)
        if (accMatcher.find()) {
            account = accMatcher.group(1)?.trim()
        }

        return ParsedSmsResult(
            isDebit = true,
            amount = amount,
            upiReference = upiRef,
            sender = sender,
            account = account,
            rawMessage = message
        )
    }
}
