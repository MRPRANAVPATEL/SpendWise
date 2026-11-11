import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBankSms } from './smsParser.ts';

test('SMS Parser: SBI UPI Debit', () => {
  const sms = "Dear UPI user A/C X1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No 401234567890. Bal: Rs. 14,200.00 - SBI";
  const result = parseBankSms(sms, "SBIUPI");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 899.00);
  assert.equal(result.upiReference, "401234567890");
});

test('SMS Parser: HDFC Bank Debit with INR and commas', () => {
  const sms = "Alert: Your HDFC Bank A/c xx4921 has been debited for INR 1,250.50 on 10-NOV-24 towards Swiggy. UPI Ref: 331209847123. Avl bal: INR 28,400.00";
  const result = parseBankSms(sms, "HDFCBK");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 1250.50);
  assert.equal(result.upiReference, "331209847123");
});

test('SMS Parser: ICICI Bank Rupee symbol and VPA', () => {
  const sms = "Dear Customer, Acct XX890 debited with ₹ 450.00 on 09-Nov-24. Info: UPI/merchant@okaxis. Ref no. 431092847192. Avl Bal INR 12,050.00.";
  const result = parseBankSms(sms, "ICICIB");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 450.00);
  assert.equal(result.upiReference, "431092847192");
});

test('SMS Parser: Axis Bank Paid phrasing', () => {
  const sms = "Rs.2,500.00 paid from Axis Bank A/c no. XX9912 on 10-11-24 via UPI. Txn ID: 490182746190. Avl balance Rs 54,120.";
  const result = parseBankSms(sms, "AXISBK");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 2500.00);
  assert.equal(result.upiReference, "490182746190");
});

test('SMS Parser: Kotak Mahindra Sent via UPI', () => {
  const sms = "Sent Rs. 350.00 from Kotak Bank AC XX331 to grocer@icici on 10-11-2024. UPI Ref 410982736192. Check bal: bit.ly/bal";
  const result = parseBankSms(sms, "KOTAKB");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 350.00);
  assert.equal(result.upiReference, "410982736192");
});

test('SMS Parser: PNB Debit with UTR', () => {
  const sms = "PNB Alert: Rs 1500 debited from A/c *4412 on 08-11-24 through UPI. UTR: 431100982173. Avl Bal: Rs 4,500";
  const result = parseBankSms(sms, "PNBSMS");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 1500);
  assert.equal(result.upiReference, "431100982173");
});

test('SMS Parser: Bank of Baroda payment of Rs', () => {
  const sms = "BoB Alert: Payment of Rs. 899 done from A/C *7721 on 10-Nov. Ref: 489102837461. Total Avl Bal: INR 19,800.";
  const result = parseBankSms(sms, "BOBTXN");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 899);
  assert.equal(result.upiReference, "489102837461");
});

test('SMS Parser: Large amount with multiple commas', () => {
  const sms = "A/c *1234 debited by INR 1,50,000.00 on 10-Nov-24 by UPI transfer to car dealer. Ref No 401298471625.";
  const result = parseBankSms(sms, "HDFCBK");
  assert.equal(result.isDebit, true);
  assert.equal(result.amount, 150000.00);
  assert.equal(result.upiReference, "401298471625");
});

test('SMS Parser Negative: Credit / Salary SMS ignored', () => {
  const sms = "Dear Customer, INR 55,000.00 credited to your A/c *8891 on 01-Nov-24 by Salary NEFT. Avl Bal INR 85,200.00";
  const result = parseBankSms(sms, "HDFCBK");
  assert.equal(result.isDebit, false);
  assert.equal(result.amount, null);
});

test('SMS Parser Negative: UPI Money Received ignored', () => {
  const sms = "You have received Rs. 500.00 in your A/c *3321 from Rahul via UPI. Ref: 412093847192. Balance Rs. 2,500.";
  const result = parseBankSms(sms, "SBIUPI");
  assert.equal(result.isDebit, false);
  assert.equal(result.amount, null);
});

test('SMS Parser Negative: Bank OTP message ignored', () => {
  const sms = "739201 is your OTP for purchase of Rs. 899.00 on Card ending 1234 at Amazon. Do not share OTP with anyone.";
  const result = parseBankSms(sms, "HDFCBK");
  assert.equal(result.isDebit, false);
  assert.equal(result.amount, null);
});

test('SMS Parser Negative: Balance inquiry message without debit ignored', () => {
  const sms = "Your available balance in A/c *9921 as of 10-Nov-24 is Rs. 14,230.50. Thank you for banking with us.";
  const result = parseBankSms(sms, "AXISBK");
  assert.equal(result.isDebit, false);
  assert.equal(result.amount, null);
});
