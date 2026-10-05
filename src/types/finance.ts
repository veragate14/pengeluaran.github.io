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

export type WalletType = 'Rekening Bank' | 'Uang Tunai' | 'E-Wallet (GoPay/OVO/Dana)' | 'Lainnya';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  category: Category;
  amount: number;
  wallet: WalletType;
  description: string;
  sheetRowIndex?: number; // for sync reference
  createdAt: number;
}

export interface FinanceSummary {
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactionCount: number;
}

export interface GoogleSheetConfig {
  spreadsheetId: string | null;
  spreadsheetName: string;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSync: boolean;
}
