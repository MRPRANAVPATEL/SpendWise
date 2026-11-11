/**
 * SMS Parser logic matching the Android Kotlin implementation.
 * Extracts debit/UPI transaction details from bank SMS text.
 */

export interface ParsedSms {
  isDebit: boolean;
  amount: number | null;
  upiReference: string | null;
  sender: string;
  account: string | null;
  rawMessage: string;
}

// Explicit Debit indicators
const DEBIT_KEYWORDS = [
  /\bdebited\b/i,
  /\bdebit\b/i,
  /\bspent\b/i,
  /\bpaid\b/i,
  /\bsent\b/i,
  /\btransferred\b/i,
  /\btransfer to\b/i,
  /\bpayment of\b/i,
  /\bwithdrawn\b/i,
  /\bpurchased\b/i
];

// Explicit Credit indicators
const CREDIT_KEYWORDS = [
  /\bcredited\b/i,
  /\bcredit\b/i,
  /\breceived\b/i,
  /\bdeposited\b/i,
  /\brefunded\b/i,
  /\breversed\b/i,
  /\bcashback\b/i
];

const OTP_KEYWORDS = [
  /\botp\b/i,
  /\bone time password\b/i,
  /\bverification code\b/i,
  /\bdo not share\b/i,
  /\blogin code\b/i
];

// Regex for Amount preceded by debit context, currency symbol, or 'debited by/with/for'
// Supports international (1,000,000) and Indian numbering system (1,50,000.00)
const DEBIT_SPECIFIC_AMOUNT_REGEX = /(?:debited\s*(?:by|for|with)?|paid|spent|sent|payment\s*of)\s*(?:Rs\.?|INR|₹)?\s*([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;

const GENERAL_CURRENCY_AMOUNT_REGEX = /(?:(?:Rs\.?|INR|₹)\s*)([0-9]{1,2}(?:,[0-9]{2})*,[0-9]{3}(?:\.[0-9]{1,2})?|[0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;

// Balance regex to identify balance figures and avoid confusing them with spent amount
const BALANCE_REGEX = /(?:bal(?:ance)?|avl\s*bal(?:ance)?)\s*(?:is|:)?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;

// Regex to capture UPI Ref / Txn Ref / RRN / UTR
const REF_REGEX = /(?:ref(?:erence)?\s*(?:no\.?|num\.?)?|upi\s*ref(?:erence)?(?:\s*no\.?)?|txn\s*(?:id|no\.?)?|rrn[:\s]|utr[:\s])\s*[:#-]?\s*([A-Za-z0-9]{6,22})/i;

// Regex to capture account number like a/c ending XX1234 or a/c XX1234
const ACCOUNT_REGEX = /(?:a\/c|acct|account)\s*(?:no\.?)?\s*[*Xx]*([0-9]{3,6})/i;

export function parseBankSms(message: string, sender: string = "BANK"): ParsedSms {
  // 1. Filter out OTPs immediately
  for (const pattern of OTP_KEYWORDS) {
    if (pattern.test(message)) {
      return {
        isDebit: false,
        amount: null,
        upiReference: null,
        sender,
        account: null,
        rawMessage: message
      };
    }
  }

  // 2. Reject if it has credit keywords
  const isCredit = CREDIT_KEYWORDS.some(pattern => pattern.test(message));
  if (isCredit) {
    return {
      isDebit: false,
      amount: null,
      upiReference: null,
      sender,
      account: null,
      rawMessage: message
    };
  }

  // 3. Must match at least one debit keyword
  const isDebit = DEBIT_KEYWORDS.some(pattern => pattern.test(message));
  if (!isDebit) {
    return {
      isDebit: false,
      amount: null,
      upiReference: null,
      sender,
      account: null,
      rawMessage: message
    };
  }

  // 4. Extract Amount
  let amount: number | null = null;

  // Try direct debit-context amount first (e.g., "debited by 899.00" or "paid Rs. 2,500")
  const debitAmountMatch = message.match(DEBIT_SPECIFIC_AMOUNT_REGEX);
  if (debitAmountMatch && debitAmountMatch[1]) {
    const cleaned = debitAmountMatch[1].replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
    }
  }

  // If not found via debit context, find all currency-prefixed amounts and pick the one that is NOT the balance
  if (amount === null) {
    let balAmount: number | null = null;
    const balMatch = message.match(BALANCE_REGEX);
    if (balMatch && balMatch[1]) {
      balAmount = parseFloat(balMatch[1].replace(/,/g, ''));
    }

    const currencyMatches = [...message.matchAll(GENERAL_CURRENCY_AMOUNT_REGEX)];
    for (const match of currencyMatches) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0 && (balAmount === null || Math.abs(val - balAmount) > 0.001)) {
        amount = val;
        break;
      }
    }

    // Fallback: if all matched balance, use first match
    if (amount === null && currencyMatches.length > 0) {
      amount = parseFloat(currencyMatches[0][1].replace(/,/g, ''));
    }
  }

  // If no amount was parsed, this isn't a valid transaction SMS
  if (amount === null || isNaN(amount)) {
    return {
      isDebit: false,
      amount: null,
      upiReference: null,
      sender,
      account: null,
      rawMessage: message
    };
  }

  // 5. Extract UPI / Txn Reference
  const refMatch = message.match(REF_REGEX);
  const upiReference = refMatch && refMatch[1] ? refMatch[1].trim() : null;

  // 6. Extract Account
  const accountMatch = message.match(ACCOUNT_REGEX);
  const account = accountMatch && accountMatch[1] ? accountMatch[1] : null;

  return {
    isDebit: true,
    amount,
    upiReference,
    sender,
    account,
    rawMessage: message
  };
}
