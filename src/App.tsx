import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  ListFilter,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Transaction, TransactionType, FinanceSummary, GoogleSheetConfig } from './types/finance';
import { formatRupiah, getTodayDateString, getCurrentTimeString } from './utils/formatters';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/firebase';
import { 
  createFinanceSpreadsheet, 
  appendTransactionToSheet, 
  readTransactionsFromSheet, 
  syncAllTransactionsToSheet 
} from './services/sheets';

import { Navbar } from './components/Navbar';
import { BalanceCard } from './components/BalanceCard';
import { TransactionModal } from './components/TransactionModal';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { ConfirmModal } from './components/ConfirmModal';

// Storage Keys
const STORAGE_KEY_TRANSACTIONS = 'catatkas_transactions_v1';
const STORAGE_KEY_STARTING_BALANCE = 'catatkas_starting_balance_v1';
const STORAGE_KEY_SHEET_CONFIG = 'catatkas_sheet_config_v1';

// Initial default state with 7 Million Rupiah fund as requested
const DEFAULT_STARTING_BALANCE = 7000000;

const DEFAULT_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-sample-1',
    date: getTodayDateString(),
    time: '08:30',
    type: 'expense',
    category: 'Makanan & Minuman',
    amount: 35000,
    wallet: 'Uang Tunai',
    description: 'Sarapan lontong sayur & teh manis',
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'tx-sample-2',
    date: getTodayDateString(),
    time: '11:15',
    type: 'expense',
    category: 'Transportasi',
    amount: 25000,
    wallet: 'E-Wallet (GoPay/OVO/Dana)',
    description: 'Bensin & parkir motor',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'tx-sample-3',
    date: getTodayDateString(),
    time: '13:00',
    type: 'income',
    category: 'Freelance & Usaha',
    amount: 250000,
    wallet: 'Rekening Bank',
    description: 'DP project desain grafis klien',
    createdAt: Date.now() - 1000 * 60 * 45,
  }
];

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Financial Data State
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STARTING_BALANCE);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      return !isNaN(parsed) ? parsed : DEFAULT_STARTING_BALANCE;
    }
    return DEFAULT_STARTING_BALANCE;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions:', e);
      }
    }
    return DEFAULT_SAMPLE_TRANSACTIONS;
  });

  // Google Sheets Config
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHEET_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sheet config:', e);
      }
    }
    return {
      spreadsheetId: null,
      spreadsheetName: 'CatatKas - Catatan Keuangan Pribadi',
      spreadsheetUrl: null,
      lastSyncedAt: null,
      autoSync: true,
    };
  });

  // UI States
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [modalTxType, setModalTxType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Confirmation Modal (strictly required for destructive Workspace operations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  // Save to localStorage when states change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STARTING_BALANCE, startingBalance.toString());
  }, [startingBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHEET_CONFIG, JSON.stringify(sheetConfig));
  }, [sheetConfig]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        showToast(`Selamat datang, ${result.user.displayName || result.user.email}!`, 'success');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Gagal masuk dengan Google. Pastikan popup tidak diblokir.', 'error');
    }
  };

  // Handle Google Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    showToast('Berhasil keluar dari akun Google.', 'info');
  };

  // Finance Summary Calculation
  const summary: FinanceSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = startingBalance + totalIncome - totalExpense;

    return {
      startingBalance,
      totalIncome,
      totalExpense,
      currentBalance,
      transactionCount: transactions.length,
    };
  }, [transactions, startingBalance]);

  // Add / Edit Transaction Handler
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    setIsTxModalOpen(false);

    let updatedTransactions: Transaction[];

    if (editingId) {
      // Edit existing
      updatedTransactions = transactions.map((t) => {
        if (t.id === editingId) {
          return {
            ...t,
            ...data,
          };
        }
        return t;
      });
      showToast('Transaksi berhasil diperbarui.', 'success');
    } else {
      // Create new
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        createdAt: Date.now(),
      };
      updatedTransactions = [newTx, ...transactions];
      showToast(
        `${data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(data.amount)} berhasil dicatat!`,
        'success'
      );

      // If connected to Google Sheets, append directly to sheet
      if (accessToken && sheetConfig.spreadsheetId) {
        try {
          setIsSyncing(true);
          await appendTransactionToSheet(accessToken, sheetConfig.spreadsheetId, newTx);
          setSheetConfig((prev) => ({
            ...prev,
            lastSyncedAt: new Date().toISOString(),
          }));
        } catch (err: any) {
          console.error('Sheet append error:', err);
          showToast('Data disimpan lokal, namun gagal sync ke Google Sheets.', 'error');
        } finally {
          setIsSyncing(false);
        }
      }
    }

    setTransactions(updatedTransactions);
    setEditingTransaction(null);
  };

  // Delete transaction with user confirmation (MANDATORY per Workspace integration skill)
  const handleDeleteTransaction = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Catatan Transaksi?',
      message: `Apakah Anda yakin ingin menghapus catatan "${tx.category}" sebesar ${formatRupiah(tx.amount)} pada tanggal ${tx.date}?\n\nJika Google Sheets terhubung, perubahan ini juga akan disinkronkan ke spreadsheet Anda.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const updated = transactions.filter((t) => t.id !== tx.id);
        setTransactions(updated);
        showToast('Transaksi berhasil dihapus.', 'info');

        // Sync with Google Sheets if connected
        if (accessToken && sheetConfig.spreadsheetId) {
          try {
            setIsSyncing(true);
            await syncAllTransactionsToSheet(
              accessToken,
              sheetConfig.spreadsheetId,
              updated,
              startingBalance
            );
            setSheetConfig((prev) => ({
              ...prev,
              lastSyncedAt: new Date().toISOString(),
            }));
          } catch (err) {
            console.error('Failed to sync deletion to sheet:', err);
          } finally {
            setIsSyncing(false);
          }
        }
      },
    });
  };

  // Edit transaction handler
  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalTxType(tx.type);
    setIsTxModalOpen(true);
  };

  // Open Add modal
  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalTxType(type);
    setIsTxModalOpen(true);
  };

  // Google Sheets: Create New Spreadsheet
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      await handleLogin();
      return;
    }

    try {
      setIsSyncing(true);
      const result = await createFinanceSpreadsheet(
        accessToken,
        `CatatKas - Keuangan Pribadi (${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})`
      );

      // Sync existing transactions right away into the new sheet
      await syncAllTransactionsToSheet(
        accessToken,
        result.spreadsheetId,
        transactions,
        startingBalance
      );

      setSheetConfig({
        spreadsheetId: result.spreadsheetId,
        spreadsheetName: 'CatatKas - Catatan Keuangan Pribadi',
        spreadsheetUrl: result.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      });

      setIsSheetModalOpen(false);
      showToast('Google Sheet berhasil dibuat & seluruh transaksi telah disinkronkan!', 'success');
    } catch (err: any) {
      console.error('Create sheet error:', err);
      showToast(err.message || 'Gagal membuat Google Sheet.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Sheets: Connect Existing Sheet
  const handleConnectExistingSheet = async (idOrUrl: string) => {
    let sheetId = idOrUrl.trim();
    // Extract ID from URL if user pasted a link
    const match = idOrUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    if (!accessToken) {
      await handleLogin();
      return;
    }

    try {
      setIsSyncing(true);
      // Attempt reading to verify accessibility
      const fetchedTxs = await readTransactionsFromSheet(accessToken, sheetId);
      
      setSheetConfig({
        spreadsheetId: sheetId,
        spreadsheetName: 'Google Spreadsheet Terhubung',
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      });

      if (fetchedTxs.length > 0) {
        setTransactions(fetchedTxs);
        showToast(`Berhasil terhubung! Memuat ${fetchedTxs.length} transaksi dari sheet.`, 'success');
      } else {
        // Sync local to sheet
        await syncAllTransactionsToSheet(accessToken, sheetId, transactions, startingBalance);
        showToast('Berhasil terhubung ke spreadsheet!', 'success');
      }
      setIsSheetModalOpen(false);
    } catch (err: any) {
      console.error('Link sheet error:', err);
      throw new Error('Tidak dapat mengakses Google Sheet. Pastikan ID benar dan sheet telah dibagikan akses.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Sheets: Push Local Data to Sheet (Overwrite with confirmation)
  const handleSyncPushToSheet = async () => {
    if (!accessToken || !sheetConfig.spreadsheetId) return;

    setConfirmModal({
      isOpen: true,
      title: 'Sinkronkan Data ke Google Sheet?',
      message: `Tindakan ini akan memperbarui isi Google Sheet dengan ${transactions.length} transaksi lokal saat ini beserta saldo awal ${formatRupiah(startingBalance)}.\n\nLanjutkan?`,
      confirmText: 'Kirim Data ke Sheet',
      cancelText: 'Batal',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          setIsSyncing(true);
          await syncAllTransactionsToSheet(
            accessToken,
            sheetConfig.spreadsheetId!,
            transactions,
            startingBalance
          );
          setSheetConfig((prev) => ({
            ...prev,
            lastSyncedAt: new Date().toISOString(),
          }));
          showToast('Data berhasil dikirim dan disinkronkan ke Google Sheet!', 'success');
        } catch (err: any) {
          console.error('Push sync error:', err);
          showToast('Gagal mengirim data ke Google Sheet.', 'error');
        } finally {
          setIsSyncing(false);
        }
      },
    });
  };

  // Google Sheets: Pull Data from Sheet (Import)
  const handleSyncPullFromSheet = async () => {
    if (!accessToken || !sheetConfig.spreadsheetId) return;

    setConfirmModal({
      isOpen: true,
      title: 'Tarik Data dari Google Sheet?',
      message: `Tindakan ini akan membaca data transaksi dari tab "Transaksi" di Google Sheet dan mengganti daftar transaksi lokal di aplikasi.\n\nPastikan data di spreadsheet sudah sesuai. Lanjutkan?`,
      confirmText: 'Muat Data Sheet',
      cancelText: 'Batal',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          setIsSyncing(true);
          const sheetTxs = await readTransactionsFromSheet(accessToken, sheetConfig.spreadsheetId!);
          if (sheetTxs.length > 0) {
            setTransactions(sheetTxs);
            setSheetConfig((prev) => ({
              ...prev,
              lastSyncedAt: new Date().toISOString(),
            }));
            showToast(`Berhasil memuat ${sheetTxs.length} transaksi dari Google Sheet!`, 'success');
          } else {
            showToast('Tidak ada data transaksi yang ditemukan di Google Sheet.', 'info');
          }
        } catch (err: any) {
          console.error('Pull sync error:', err);
          showToast('Gagal menarik data dari Google Sheet.', 'error');
        } finally {
          setIsSyncing(false);
        }
      },
    });
  };

  // Google Sheets: Disconnect
  const handleDisconnectSheet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Putuskan Tautan Google Sheets?',
      message: 'Aplikasi tidak lagi terhubung ke file spreadsheet ini. Data yang sudah tersimpan di Google Drive Anda tetap aman dan tidak akan terhapus.',
      confirmText: 'Putuskan Tautan',
      cancelText: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setSheetConfig({
          spreadsheetId: null,
          spreadsheetName: 'CatatKas - Catatan Keuangan Pribadi',
          spreadsheetUrl: null,
          lastSyncedAt: null,
          autoSync: true,
        });
        setIsSheetModalOpen(false);
        showToast('Tautan Google Sheet diputuskan.', 'info');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        sheetConfig={sheetConfig}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onTriggerSync={handleSyncPushToSheet}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-current opacity-60 hover:opacity-100 p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Financial Balance Overview */}
        <BalanceCard
          summary={summary}
          onUpdateStartingBalance={(newBalance) => {
            setStartingBalance(newBalance);
            showToast(`Dana / Saldo awal bulan ini diatur ke ${formatRupiah(newBalance)}`, 'success');
          }}
          onOpenAddModal={(type) => handleOpenAddModal(type)}
        />

        {/* View Switcher Tabs: Riwayat vs Analisis */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-emerald-600" />
              <span>Daftar Transaksi Harian</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Statistik &amp; Analisis Belanja</span>
            </button>
          </div>

          {/* Quick Floating/Header Add Button */}
          <button
            onClick={() => handleOpenAddModal('expense')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Catat Pengeluaran / Pemasukan</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'transactions' ? (
          <TransactionList
            transactions={transactions}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTransaction}
            onOpenAddModal={() => handleOpenAddModal('expense')}
          />
        ) : (
          <AnalyticsView
            transactions={transactions}
            startingBalance={startingBalance}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>CatatKas — Aplikasi Keuangan Pribadi &amp; Sinkronisasi Google Sheets</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Dana Awal: {formatRupiah(startingBalance)}</span>
            <span>•</span>
            <span>{transactions.length} Transaksi Tercatat</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        initialType={modalTxType}
        editingTransaction={editingTransaction}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
      />

      <GoogleSheetSyncModal
        isOpen={isSheetModalOpen}
        userEmail={user?.email}
        sheetConfig={sheetConfig}
        isSyncing={isSyncing}
        transactionsCount={transactions.length}
        onClose={() => setIsSheetModalOpen(false)}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncPushToSheet={handleSyncPushToSheet}
        onSyncPullFromSheet={handleSyncPullFromSheet}
        onDisconnectSheet={handleDisconnectSheet}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
