package com.expensetracker.offline

import com.expensetracker.offline.service.SmsParser
import org.junit.Assert.*
import org.junit.Test

class SmsParserTest {

    @Test
    fun testSbiUpiDebit() {
        val sms = "Dear UPI user A/C X1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No 401234567890. Bal: Rs. 14,200.00 - SBI"
        val result = SmsParser.parse(sms, "SBIUPI")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(899.00, result.amount!!, 0.001)
        assertEquals("401234567890", result.upiReference)
    }

    @Test
    fun testHdfcBankDebitWithInr() {
        val sms = "Alert: Your HDFC Bank A/c xx4921 has been debited for INR 1,250.50 on 10-NOV-24 towards Swiggy. UPI Ref: 331209847123. Avl bal: INR 28,400.00"
        val result = SmsParser.parse(sms, "HDFCBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(1250.50, result.amount!!, 0.001)
        assertEquals("331209847123", result.upiReference)
    }

    @Test
    fun testIciciBankRupeeSymbol() {
        val sms = "Dear Customer, Acct XX890 debited with ₹ 450.00 on 09-Nov-24. Info: UPI/merchant@okaxis. Ref no. 431092847192. Avl Bal INR 12,050.00."
        val result = SmsParser.parse(sms, "ICICIB")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(450.00, result.amount!!, 0.001)
        assertEquals("431092847192", result.upiReference)
    }

    @Test
    fun testAxisBankPaidPhrasing() {
        val sms = "Rs.2,500.00 paid from Axis Bank A/c no. XX9912 on 10-11-24 via UPI. Txn ID: 490182746190. Avl balance Rs 54,120."
        val result = SmsParser.parse(sms, "AXISBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(2500.00, result.amount!!, 0.001)
        assertEquals("490182746190", result.upiReference)
    }

    @Test
    fun testKotakMahindraSentViaUpi() {
        val sms = "Sent Rs. 350.00 from Kotak Bank AC XX331 to grocer@icici on 10-11-2024. UPI Ref 410982736192. Check bal: bit.ly/bal"
        val result = SmsParser.parse(sms, "KOTAKB")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(350.00, result.amount!!, 0.001)
        assertEquals("410982736192", result.upiReference)
    }

    @Test
    fun testPnbDebitWithUtr() {
        val sms = "PNB Alert: Rs 1500 debited from A/c *4412 on 08-11-24 through UPI. UTR: 431100982173. Avl Bal: Rs 4,500"
        val result = SmsParser.parse(sms, "PNBSMS")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(1500.00, result.amount!!, 0.001)
        assertEquals("431100982173", result.upiReference)
    }

    @Test
    fun testBankOfBarodaPaymentOfRs() {
        val sms = "BoB Alert: Payment of Rs. 899 done from A/C *7721 on 10-Nov. Ref: 489102837461. Total Avl Bal: INR 19,800."
        val result = SmsParser.parse(sms, "BOBTXN")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(899.00, result.amount!!, 0.001)
        assertEquals("489102837461", result.upiReference)
    }

    @Test
    fun testIndianNumberingLargeAmount() {
        val sms = "A/c *1234 debited by INR 1,50,000.00 on 10-Nov-24 by UPI transfer to car dealer. Ref No 401298471625."
        val result = SmsParser.parse(sms, "HDFCBK")
        assertTrue("Should detect as debit", result.isDebit)
        assertEquals(150000.00, result.amount!!, 0.001)
        assertEquals("401298471625", result.upiReference)
    }

    // Negative Tests
    @Test
    fun testIgnoreSalaryCredit() {
        val sms = "Dear Customer, INR 55,000.00 credited to your A/c *8891 on 01-Nov-24 by Salary NEFT. Avl Bal INR 85,200.00"
        val result = SmsParser.parse(sms, "HDFCBK")
        assertFalse("Credit SMS should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreUpiMoneyReceived() {
        val sms = "You have received Rs. 500.00 in your A/c *3321 from Rahul via UPI. Ref: 412093847192. Balance Rs. 2,500."
        val result = SmsParser.parse(sms, "SBIUPI")
        assertFalse("Received money should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreBankOtp() {
        val sms = "739201 is your OTP for purchase of Rs. 899.00 on Card ending 1234 at Amazon. Do not share OTP with anyone."
        val result = SmsParser.parse(sms, "HDFCBK")
        assertFalse("OTP SMS should be ignored", result.isDebit)
        assertNull(result.amount)
    }

    @Test
    fun testIgnoreBalanceInquiry() {
        val sms = "Your available balance in A/c *9921 as of 10-Nov-24 is Rs. 14,230.50. Thank you for banking with us."
        val result = SmsParser.parse(sms, "AXISBK")
        assertFalse("Balance inquiry without debit should be ignored", result.isDebit)
        assertNull(result.amount)
    }
}
