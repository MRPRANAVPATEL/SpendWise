import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  MessageSquare,
  FolderTree,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Search,
  Bell,
  Play,
  Share2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  X,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseBankSms, ParsedSms } from './utils/smsParser.ts';
import { ANDROID_PROJECT_FILES, AndroidFile } from './android_source/androidProjectFiles.ts';
import { downloadAndroidProjectZip } from './utils/zipExporter.ts';

const SAMPLE_BANK_MESSAGES = [
  {
    bank: "SBI (UPI Debit)",
    sender: "SBIUPI",
    sms: "Dear UPI user A/C X1234 debited by 899.00 on 10Nov24 by transfer to Vraj. Ref No 401234567890. Bal: Rs. 14,200.00 - SBI"
  },
  {
    bank: "HDFC Bank (Swiggy Debit)",
    sender: "HDFCBK",
    sms: "Alert: Your HDFC Bank A/c xx4921 has been debited for INR 1,250.50 on 10-NOV-24 towards Swiggy. UPI Ref: 331209847123. Avl bal: INR 28,400.00"
  },
  {
    bank: "ICICI Bank (Rupee Symbol ₹)",
    sender: "ICICIB",
    sms: "Dear Customer, Acct XX890 debited with ₹ 450.00 on 09-Nov-24. Info: UPI/merchant@okaxis. Ref no. 431092847192. Avl Bal INR 12,050.00."
  },
  {
    bank: "Axis Bank (Paid via UPI)",
    sender: "AXISBK",
    sms: "Rs.2,500.00 paid from Axis Bank A/c no. XX9912 on 10-11-24 via UPI. Txn ID: 490182746190. Avl balance Rs 54,120."
  },
  {
    bank: "Kotak Mahindra Bank",
    sender: "KOTAKB",
    sms: "Sent Rs. 350.00 from Kotak Bank AC XX331 to grocer@icici on 10-11-2024. UPI Ref 410982736192. Check bal: bit.ly/bal"
  },
  {
    bank: "PNB (UTR Ref)",
    sender: "PNBSMS",
    sms: "PNB Alert: Rs 1500 debited from A/c *4412 on 08-11-24 through UPI. UTR: 431100982173. Avl Bal: Rs 4,500"
  },
  {
    bank: "Salary Credit (Should be IGNORED)",
    sender: "HDFCBK",
    sms: "Dear Customer, INR 55,000.00 credited to your A/c *8891 on 01-Nov-24 by Salary NEFT. Avl Bal INR 85,200.00"
  },
  {
    bank: "Bank OTP (Should be IGNORED)",
    sender: "ICICIB",
    sms: "739201 is your OTP for purchase of Rs. 899.00 on Card ending 1234 at Amazon. Do not share OTP with anyone."
  }
];

interface ExpenseItem {
  id: number;
  amount: number;
  paidTo: string;
  sender: string;
  refNo: string;
  timestamp: string;
  isManual: boolean;
  status: 'PENDING' | 'SAVED';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'parser' | 'files' | 'build' | 'samsung'>('simulator');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<number | null>(null);

  // File explorer state
  const [selectedFilePath, setSelectedFilePath] = useState<string>("app/src/main/AndroidManifest.xml");
  const [fileFilter, setFileFilter] = useState<'all' | 'kotlin' | 'gradle' | 'manifest' | 'res' | 'workflow'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedFile, setCopiedFile] = useState(false);

  // Live SMS parser state
  const [inputSms, setInputSms] = useState(SAMPLE_BANK_MESSAGES[0].sms);
  const [inputSender, setInputSender] = useState(SAMPLE_BANK_MESSAGES[0].sender);
  const [parsedResult, setParsedResult] = useState<ParsedSms>(parseBankSms(SAMPLE_BANK_MESSAGES[0].sms, SAMPLE_BANK_MESSAGES[0].sender));

  // Simulator state
  const [simName, setSimName] = useState("Rahul");
  const [simExpenses, setSimExpenses] = useState<ExpenseItem[]>([
    {
      id: 1,
      amount: 899.00,
      paidTo: "Vraj - recharge",
      sender: "SBIUPI",
      refNo: "401234567890",
      timestamp: "Today, 10:14 AM",
      isManual: false,
      status: "SAVED"
    },
    {
      id: 2,
      amount: 1250.50,
      paidTo: "Swiggy dinner",
      sender: "HDFCBK",
      refNo: "331209847123",
      timestamp: "Yesterday, 08:30 PM",
      isManual: false,
      status: "SAVED"
    },
    {
      id: 3,
      amount: 350.00,
      paidTo: "Grocery & Milk",
      sender: "KOTAKB",
      refNo: "410982736192",
      timestamp: "09 Nov, 09:12 AM",
      isManual: false,
      status: "SAVED"
    }
  ]);
  const [simPopup, setSimPopup] = useState<{
    visible: boolean;
    expenseId: number;
    amount: number;
    sender: string;
    refNo: string;
    labelInput: string;
  } | null>(null);
  const [simNotification, setSimNotification] = useState<{
    visible: boolean;
    expenseId: number;
    amount: number;
    sender: string;
  } | null>(null);

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadAndroidProjectZip((p) => setZipProgress(p));
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error("ZIP download failed", e);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleTestSmsInjection = (smsText: string, sender: string) => {
    const res = parseBankSms(smsText, sender);
    setParsedResult(res);

    if (res.isDebit && res.amount) {
      const newId = Date.now();
      const newPending: ExpenseItem = {
        id: newId,
        amount: res.amount,
        paidTo: "",
        sender: res.sender,
        refNo: res.upiReference || "TXN" + Math.floor(100000 + Math.random() * 900000),
        timestamp: "Just now",
        isManual: false,
        status: "PENDING"
      };

      setSimExpenses(prev => [newPending, ...prev]);

      // Trigger instant overlay popup
      setSimPopup({
        visible: true,
        expenseId: newId,
        amount: res.amount,
        sender: res.sender,
        refNo: res.upiReference || "",
        labelInput: ""
      });

      // Post persistent notification
      setSimNotification({
        visible: true,
        expenseId: newId,
        amount: res.amount,
        sender: res.sender
      });
    }
  };

  const handleSavePopupExpense = (label: string) => {
    if (!simPopup) return;
    setSimExpenses(prev =>
      prev.map(e => e.id === simPopup.expenseId ? { ...e, paidTo: label || "Expense", status: "SAVED" } : e)
    );
    // Hide popup and dismiss persistent notification once details are saved
    setSimPopup(null);
    setSimNotification(null);
  };

  const handleLaterPopup = () => {
    // Popup closes, but notification remains persistent
    setSimPopup(null);
  };

  const handleDismissNotification = () => {
    // Android 14 swipe-away test: re-alert immediately because entry is still pending
    if (simNotification) {
      const current = simNotification;
      setSimNotification(null);
      setTimeout(() => {
        setSimNotification(current);
      }, 700);
    }
  };

  const selectedFile = ANDROID_PROJECT_FILES.find(f => f.path === selectedFilePath) || ANDROID_PROJECT_FILES[0];

  const filteredFiles = ANDROID_PROJECT_FILES.filter(f => {
    if (fileFilter !== 'all' && f.category !== fileFilter) return false;
    if (searchQuery.trim() && !f.path.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalMonthlySpent = simExpenses
    .filter(e => e.status === 'SAVED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingExpenses = simExpenses.filter(e => e.status === 'PENDING');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-xl shadow-lg shadow-teal-500/10">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">CashTrace Native Android Project</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  100% Offline • Room DB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kotlin • Jetpack Compose • Real-Time SMS Receiver • Persistent Reminder • Overlay Popup • One UI Ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm rounded-lg shadow-lg shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isZipping ? `Generating ZIP (${zipProgress || 0}%)...` : "Download Android Studio Project (.ZIP)"}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-900/40 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Android Interactive Simulator
          </button>

          <button
            onClick={() => setActiveTab('parser')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'parser'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            SMS Regex Sandbox ({SAMPLE_BANK_MESSAGES.length} Banks)
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Complete Project Files ({ANDROID_PROJECT_FILES.length})
          </button>

          <button
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'build'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            APK Build & GitHub Actions CI
          </button>

          <button
            onClick={() => setActiveTab('samsung')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'samsung'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Samsung One UI Setup Checklist
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Quick Fix Alert for GitHub Actions Build */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-teal-950/30 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">GitHub Build Fix: 2 Escaping Errors Resolved</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Fix Ready
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  The Build #4 screenshot shows Gradle failed on <code className="text-amber-300">kspDebugKotlin</code> at <code className="text-teal-300">CsvExporter.kt:87</code> (unescaped quotes) and <code className="text-teal-300">SettingsScreen.kt:194</code> (unescaped multi-line text). Both files are completely fixed below.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="https://github.com/MRPRANAVPATEL/SpendWise/edit/main/app/src/main/java/com/expensetracker/offline/ui/export/CsvExporter.kt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                Edit CsvExporter.kt
              </a>
              <a
                href="https://github.com/MRPRANAVPATEL/SpendWise/edit/main/app/src/main/java/com/expensetracker/offline/ui/settings/SettingsScreen.kt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-400" />
                Edit SettingsScreen.kt
              </a>
              <a
                href="https://github.com/MRPRANAVPATEL/SpendWise/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                GitHub Actions
              </a>
            </div>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & SMS Injector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Simulate Live Bank SMS
                  </h3>
                  <span className="text-xs text-slate-400">Trigger Real-Time Flow</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Click any bank SMS below. It will run through the exact regex parser, insert a <strong className="text-teal-400">PENDING</strong> entry into Room DB, show the <strong className="text-amber-400">floating overlay popup</strong> over whatever app is open, and trigger the persistent ongoing notification!
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {SAMPLE_BANK_MESSAGES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTestSmsInjection(item.sms, item.sender)}
                      className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-teal-950/30 hover:border-teal-700/50 transition-all text-xs group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-teal-300 group-hover:text-teal-200">{item.bank}</span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">{item.sender}</span>
                      </div>
                      <p className="text-slate-400 line-clamp-2 font-mono text-[11px] leading-tight">{item.sms}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Samsung & App State Tips */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Native Architecture Guarantees:
                </div>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Zero Internet:</strong> No `android.permission.INTERNET` declared in manifest.</li>
                  <li><strong>Instant Popup:</strong> Full-Screen Intent + `SYSTEM_ALERT_WINDOW` over PhonePe/GPay.</li>
                  <li><strong>Android 14+ Protection:</strong> Swiping the notification re-alerts immediately if still pending.</li>
                  <li><strong>WorkManager:</strong> Periodic check every 30m ensures unlabelled debits aren't forgotten.</li>
                </ul>
              </div>
            </div>

            {/* Right: Phone Frame Simulator */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-[360px] h-[720px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-slate-700/50">
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700"></div>
                </div>

                {/* Android Status Bar */}
                <div className="pt-7 px-5 pb-2 flex justify-between items-center text-[11px] text-slate-400 select-none z-30">
                  <span className="font-semibold text-slate-200">10:14</span>
                  <div className="flex items-center gap-1.5">
                    {simNotification && (
                      <span className="text-amber-400 flex items-center gap-1 font-bold animate-pulse">
                        <Bell className="w-3 h-3" />
                      </span>
                    )}
                    <span>VoLTE</span>
                    <span>94%</span>
                  </div>
                </div>

                {/* Persistent Android Heads-Up Notification if Active */}
                {simNotification && (
                  <div className="mx-3 mt-1 mb-2 bg-slate-900 border border-amber-500/40 rounded-xl p-2.5 shadow-xl shadow-amber-500/10 z-40 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ₹
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            ₹ {simNotification.amount.toFixed(2)} spent – tap to add details
                          </p>
                          <p className="text-[10px] text-slate-400">
                            CashTrace • Ongoing reminder • Via {simNotification.sender}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDismissNotification}
                        title="Simulate Android 14 swipe away"
                        className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-[9px] text-amber-400/80">Swipe-away protected</span>
                      <button
                        onClick={() => {
                          setSimPopup({
                            visible: true,
                            expenseId: simNotification.expenseId,
                            amount: simNotification.amount,
                            sender: simNotification.sender,
                            refNo: "",
                            labelInput: ""
                          });
                        }}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded cursor-pointer"
                      >
                        Add details
                      </button>
                    </div>
                  </div>
                )}

                {/* Native App UI (Jetpack Compose simulation) */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-8 text-slate-100">
                  {/* Greeting Header */}
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <h2 className="text-base font-bold text-white">Hi, {simName}</h2>
                      <p className="text-[10px] text-teal-400 font-medium">CashTrace • 100% Offline</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert("CSV Export created in UTF-8 with BOM! Ready to share via FileProvider.")}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Export CSV"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                      </button>
                      <button
                        onClick={() => setActiveTab('samsung')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Settings"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Monthly Summary Card */}
                  <div className="bg-gradient-to-br from-teal-900/60 to-slate-900 border border-teal-500/30 rounded-2xl p-4 shadow-md">
                    <div className="flex justify-between items-center text-xs text-teal-200 mb-2">
                      <span className="font-semibold">November 2024</span>
                      <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded-full text-teal-300">Local SQLite</span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tight">
                      ₹ {totalMonthlySpent.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">Total spent this month</p>
                    <div className="pt-2 border-t border-teal-500/20 flex justify-between text-xs text-slate-300">
                      <span>Today's Total:</span>
                      <span className="font-bold text-white">
                        ₹ {simExpenses.filter(e => e.status === 'SAVED' && e.timestamp.includes('Today')).reduce((a, c) => a + c.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Pending Expenses Section if any */}
                  {pendingExpenses.length > 0 && (
                    <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Needs Details ({pendingExpenses.length})
                      </div>
                      <p className="text-[10px] text-amber-200/80 leading-tight">
                        Persistent reminder active until labelled.
                      </p>
                      {pendingExpenses.map(p => (
                        <div key={p.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">₹ {p.amount.toFixed(2)}</div>
                            <div className="text-[9px] text-slate-400">Via {p.sender} • {p.refNo}</div>
                          </div>
                          <button
                            onClick={() => {
                              setSimPopup({
                                visible: true,
                                expenseId: p.id,
                                amount: p.amount,
                                sender: p.sender,
                                refNo: p.refNo,
                                labelInput: ""
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Add Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Saved Expenses List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-slate-300">Saved Expenses</h4>
                      <span className="text-[10px] text-slate-500">
                        {simExpenses.filter(e => e.status === 'SAVED').length} items
                      </span>
                    </div>

                    <div className="space-y-2">
                      {simExpenses.filter(e => e.status === 'SAVED').map(item => (
                        <div key={item.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-white leading-tight">{item.paidTo}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span>{item.timestamp}</span>
                              <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-slate-400">{item.isManual ? 'Manual' : 'SMS'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-teal-400 text-sm">₹ {item.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Add Button in Simulator */}
                <div className="absolute bottom-5 right-5 z-20">
                  <button
                    onClick={() => {
                      const amount = 250;
                      const label = prompt("Enter manual expense label:", "Chai & Snacks");
                      if (label) {
                        setSimExpenses(prev => [
                          {
                            id: Date.now(),
                            amount,
                            paidTo: label,
                            sender: "MANUAL",
                            refNo: "-",
                            timestamp: "Today, Just now",
                            isManual: true,
                            status: "SAVED"
                          },
                          ...prev
                        ]);
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-lg font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Instant Floating Dialog Overlay Modal (Simulating SYSTEM_ALERT_WINDOW) */}
                {simPopup && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="w-full bg-slate-900 border border-teal-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Debit Detected</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            From {simPopup.sender} {simPopup.refNo && `• Ref: ${simPopup.refNo}`}
                          </p>
                        </div>
                        <button
                          onClick={handleLaterPopup}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Amount Field */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          value={simPopup.amount}
                          onChange={(e) => setSimPopup({ ...simPopup, amount: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-teal-400"
                        />
                      </div>

                      {/* Paid To / Type Field */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Paid to / Type of payment</label>
                        <input
                          type="text"
                          placeholder="e.g. Vraj - recharge, Groceries, Swiggy"
                          value={simPopup.labelInput}
                          onChange={(e) => setSimPopup({ ...simPopup, labelInput: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                          autoFocus
                        />
                      </div>

                      {/* Suggestion Chips */}
                      <div>
                        <span className="text-[9px] text-slate-400 block mb-1">Quick suggestions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["Groceries", "Swiggy", "Vraj - recharge", "Fuel", "Chai", "Amazon"].map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSimPopup({ ...simPopup, labelInput: chip })}
                              className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-teal-900/60 hover:text-teal-300 text-slate-300 rounded border border-slate-700 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={handleLaterPopup}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Later
                        </button>
                        <button
                          onClick={() => handleSavePopupExpense(simPopup.labelInput)}
                          className="flex-1 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-teal-500/20 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SMS REGEX SANDBOX */}
        {activeTab === 'parser' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                Real-Time Bank SMS Regex Engine Sandbox
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Test how the on-device regex parses incoming SMS messages from any Indian bank. Extracts amount (Rs, INR, ₹, Indian comma formatting), reference number, account number, and automatically rejects credits, OTPs, and balance inquiries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">Bank SMS Message Body:</label>
                    <span className="text-[11px] text-slate-500">Sender: {inputSender}</span>
                  </div>
                  <textarea
                    rows={4}
                    value={inputSms}
                    onChange={(e) => {
                      setInputSms(e.target.value);
                      setParsedResult(parseBankSms(e.target.value, inputSender));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:border-teal-500 focus:outline-hidden"
                  />

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-slate-400 self-center">Presets:</span>
                    {SAMPLE_BANK_MESSAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputSms(sample.sms);
                          setInputSender(sample.sender);
                          setParsedResult(parseBankSms(sample.sms, sample.sender));
                        }}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                      >
                        {sample.bank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parsing Results Breakdown */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Parsed Extraction Result</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      parsedResult.isDebit ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {parsedResult.isDebit ? 'VALID DEBIT / EXPENSE' : 'IGNORED / NOT A DEBIT'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Detected Amount:</span>
                      <span className="font-mono font-bold text-teal-400">
                        {parsedResult.amount !== null ? `₹ ${parsedResult.amount.toFixed(2)}` : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">UPI / Txn Reference No:</span>
                      <span className="font-mono text-slate-200">
                        {parsedResult.upiReference || 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Bank Sender Code:</span>
                      <span className="font-mono text-slate-200">{parsedResult.sender}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Account Ending:</span>
                      <span className="font-mono text-slate-200">{parsedResult.account || 'Not found'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    {parsedResult.isDebit ? (
                      <p className="text-teal-400">✓ Matches debit regex pattern. Triggers overlay popup and creates Room DB entry.</p>
                    ) : (
                      <p className="text-amber-400">✕ Filtered out: Credit, OTP, or non-transaction message. No popup will appear.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLETE PROJECT FILE EXPLORER */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <FolderTree className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">CashTrace Android Studio Project Source Tree</h3>
                  <p className="text-xs text-slate-400">Browse all {ANDROID_PROJECT_FILES.length} native files in full</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 w-48"
                  />
                </div>

                <select
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                >
                  <option value="all">All Files ({ANDROID_PROJECT_FILES.length})</option>
                  <option value="kotlin">Kotlin Files</option>
                  <option value="gradle">Gradle & Config</option>
                  <option value="manifest">Manifest & XML</option>
                  <option value="workflow">GitHub Actions</option>
                  <option value="test">Unit Tests</option>
                </select>

                <button
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 px-3 py-1 bg-teal-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-teal-400 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .ZIP
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* File List Navigation */}
              <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-2 max-h-[620px] overflow-y-auto space-y-1">
                {filteredFiles.map((f) => (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFilePath(f.path)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                      selectedFilePath === f.path
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="truncate">{f.path}</span>
                    <span className="text-[10px] text-slate-500 uppercase ml-1 shrink-0">{f.category}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-teal-300 font-semibold">{selectedFile.path}</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                      {selectedFile.content.split('\n').length} lines
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(selectedFile.content)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    {copiedFile ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFile ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <div className="p-4 bg-slate-950 overflow-auto max-h-[560px]">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APK BUILD & GITHUB ACTIONS CI */}
        {activeTab === 'build' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Android Studio Steps */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-teal-400" />
                  Option A: Android Studio Click-by-Click
                </h3>
                <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li>Download the project zip using the button above and extract it.</li>
                  <li>Open <strong>Android Studio (Hedgehog or newer)</strong>.</li>
                  <li>Click <strong>File &gt; Open</strong> and choose the extracted <code className="text-teal-300">CashTrace</code> folder.</li>
                  <li>Wait 1-2 minutes for Gradle Sync to finish automatically.</li>
                  <li>From the top menu bar, click:
                    <div className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-teal-300 font-bold">
                      Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)
                    </div>
                  </li>
                  <li>Android Studio compiles the APK in seconds and shows a popup notification: <em>"APK(s) generated successfully for 1 module"</em> with a <strong>locate</strong> link.</li>
                  <li>The APK file is generated at:
                    <div className="mt-1 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-slate-300 text-[11px] select-all">
                      app/build/outputs/apk/debug/app-debug.apk
                    </div>
                  </li>
                </ol>
              </div>

              {/* Command Line Steps */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-teal-400" />
                  Option B: Command Line (Gradle Wrapper)
                </h3>
                <p className="text-xs text-slate-300">
                  Run this single command from the project root in terminal or command prompt:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-teal-300 flex justify-between items-center">
                  <span>./gradlew assembleDebug</span>
                  <button
                    onClick={() => copyToClipboard("./gradlew assembleDebug")}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  To build both Debug and Release unsigned APKs:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-teal-300 flex justify-between items-center">
                  <span>./gradlew assembleRelease</span>
                  <button
                    onClick={() => copyToClipboard("./gradlew assembleRelease")}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Outputs:
                </p>
                <ul className="text-xs font-mono text-slate-300 list-disc list-inside space-y-1">
                  <li><code>app/build/outputs/apk/debug/app-debug.apk</code></li>
                  <li><code>app/build/outputs/apk/release/app-release-unsigned.apk</code></li>
                </ul>
              </div>
            </div>

            {/* GitHub Actions Cloud Workflow */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-teal-400" />
                  Option C: Cloud Build via GitHub Actions (.github/workflows/build-apk.yml)
                </h3>
                <button
                  onClick={() => copyToClipboard(ANDROID_PROJECT_FILES.find(f => f.path.includes("build-apk.yml"))?.content || "")}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Workflow YAML
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you don't have Android Studio installed, push this repository to GitHub. The included GitHub Actions workflow will automatically compile both <strong>app-debug.apk</strong> and <strong>app-release-apk</strong> on Ubuntu runners and upload them under the <strong>Actions &gt; Artifacts</strong> tab for direct 1-click download!
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: SAMSUNG ONE UI SETUP CHECKLIST */}
        {activeTab === 'samsung' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Samsung One UI Sideload & Battery Optimization Guide</h3>
                  <p className="text-xs text-slate-400">Essential settings for Android 10, 11, 12, 13, 14 & 15 (One UI 2.0 to 6.1)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-teal-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    1. Allow Restricted Settings (Android 13/14+)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Because the app is sideloaded (not from Google Play), Android protects SMS & Accessibility:
                  </p>
                  <p className="text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    Open <strong>Settings &gt; Apps &gt; CashTrace</strong> &gt; tap the <strong>three dots (⋮)</strong> in the top-right corner &gt; tap <strong>"Allow restricted settings"</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-teal-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    2. Set Battery to "Unrestricted"
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Prevents Samsung's aggressive memory cleaner from killing the app:
                  </p>
                  <p className="text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    Open <strong>App info &gt; Battery</strong> &gt; choose <strong>"Unrestricted"</strong> (default is "Optimized").
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-teal-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    3. Remove from Sleeping & Deep Sleeping Apps
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Samsung One UI puts unused apps into deep sleep, blocking SMS receivers:
                  </p>
                  <p className="text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    Go to <strong>Settings &gt; Battery &gt; Background usage limits</strong> &gt; ensure CashTrace is NOT in <em>Sleeping apps</em> or <em>Deep sleeping apps</em>. Add it to <strong>"Never sleeping apps"</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-teal-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    4. Grant "Display Over Other Apps" (Appear on Top)
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Allows CashTrace to pop up right over Google Pay, PhonePe, or Paytm when you pay:
                  </p>
                  <p className="text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                    Go to <strong>Settings &gt; Apps &gt; Special access &gt; Appear on top</strong> &gt; Toggle <strong>CashTrace</strong> to <strong>ON</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        CashTrace Native Android Project • 100% Offline (No Internet Permission) • Built with Kotlin & Jetpack Compose
      </footer>
    </div>
  );
}
