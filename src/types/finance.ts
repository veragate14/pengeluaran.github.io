export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'Gaji'
  | 'Bonus'
  | 'Freelance & Usaha'
  | 'Investasi'
  | 'Transfer Masuk'
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja Harian'
  | 'Tagihan & Utilitas'
  | 'Hiburan & Hobi'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Keluarga & Sedekah'
  | 'Lainnya';

export type WalletType = 
  | 'E-Wallet (DANA / GoPay / OVO)' 
  | 'Cash (Uang Tunai)' 
  | 'Rekening Bank';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  category: Category;
  amount: number;
  wallet: WalletType;
  description: string; // Alasan / keperluan pengeluaran atau sumber pemasukan
  sheetRowIndex?: number;
  createdAt: number;
}

export interface FinanceSummary {
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactionCount: number;
  // Wallet breakdown
  eWalletBalance: number;
  cashBalance: number;
  bankBalance: number;
  // This month recap
  thisMonthIncome: number;
  thisMonthExpense: number;
  thisMonthNet: number;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetName: string;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSync: boolean;
}
