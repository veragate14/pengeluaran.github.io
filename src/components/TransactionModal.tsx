import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Clock, 
  Tag, 
  CreditCard, 
  FileText,
  Plus,
  HelpCircle,
  Smartphone,
  Banknote
} from 'lucide-react';
import { Transaction, TransactionType, Category, WalletType } from '../types/finance';
import { getTodayDateString, getCurrentTimeString, formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
}

const INCOME_CATEGORIES: Category[] = [
  'Gaji',
  'Bonus',
  'Freelance & Usaha',
  'Investasi',
  'Transfer Masuk',
  'Lainnya',
];

const EXPENSE_CATEGORIES: Category[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja Harian',
  'Tagihan & Utilitas',
  'Hiburan & Hobi',
  'Kesehatan',
  'Pendidikan',
  'Keluarga & Sedekah',
  'Lainnya',
];

const WALLET_OPTIONS: { value: WalletType; label: string; icon: string; desc: string }[] = [
  {
    value: 'E-Wallet (DANA / GoPay / OVO)',
    label: 'E-Wallet (DANA / GoPay / OVO)',
    icon: 'smartphone',
    desc: 'Saldo DANA, GoPay, OVO, ShopeePay',
  },
  {
    value: 'Cash (Uang Tunai)',
    label: 'Cash (Uang Tunai)',
    icon: 'cash',
    desc: 'Uang fisik di dompet / saku',
  },
  {
    value: 'Rekening Bank',
    label: 'Rekening Bank',
    icon: 'bank',
    desc: 'BCA, Mandiri, BRI, dsb.',
  },
];

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 250000, 500000, 1000000];

const COMMON_EXPENSE_REASONS = [
  'Makan siang / malam',
  'Beli bensin motor/mobil',
  'Jajan / Kopi',
  'Belanja kebutuhan dapur',
  'Bayar pulsa / kuota',
  'Bayar tagihan listrik/air',
  'Parkir & transportasi',
  'Keperluan pribadi',
];

const COMMON_INCOME_REASONS = [
  'Gaji bulanan',
  'Top up saldo DANA',
  'Transfer dari teman/keluarga',
  'Pendapatan jualan / freelance',
  'Bonus / Cashback',
  'Kembalian / Uang sisa',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType = 'expense',
  editingTransaction = null,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<Category>('Makanan & Minuman');
  const [wallet, setWallet] = useState<WalletType>('E-Wallet (DANA / GoPay / OVO)');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [description, setDescription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setWallet(editingTransaction.wallet);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setDescription(editingTransaction.description);
    } else {
      setType(initialType);
      setAmountStr('');
      setCategory(initialType === 'income' ? 'Gaji' : 'Makanan & Minuman');
      setWallet('E-Wallet (DANA / GoPay / OVO)');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setDescription('');
    }
    setErrorMessage('');
  }, [isOpen, initialType, editingTransaction]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (!editingTransaction) {
      setCategory(newType === 'income' ? 'Gaji' : 'Makanan & Minuman');
    }
  };

  const handleQuickAddAmount = (addAmount: number) => {
    const current = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;
    setAmountStr((current + addAmount).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(/[^0-9]/g, ''));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setErrorMessage('Nominal harus berupa angka lebih dari 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        type === 'expense'
          ? 'Mohon tulis alasan / keperluan mengeluarkan uang ini.'
          : 'Mohon tulis keterangan sumber pemasukan uang ini.'
      );
      return;
    }

    if (!date) {
      setErrorMessage('Pilih tanggal transaksi.');
      return;
    }

    onSubmit(
      {
        date,
        time: time || getCurrentTimeString(),
        type,
        category,
        amount: cleanAmount,
        wallet,
        description: description.trim(),
      },
      editingTransaction ? editingTransaction.id : undefined
    );
  };

  if (!isOpen) return null;

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const commonReasons = type === 'income' ? COMMON_INCOME_REASONS : COMMON_EXPENSE_REASONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingTransaction
                ? 'Edit Transaksi'
                : type === 'income'
                ? 'Catat Pemasukan ke Saldo Dana'
                : 'Catat Pengeluaran Dana'}
            </h3>
            <p className="text-xs text-slate-500">
              {type === 'income'
                ? 'Tambah dana masuk ke e-wallet, cash, atau bank'
                : 'Catat berapa uang keluar beserta alasannya'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle: Pemasukan / Pengeluaran */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Pemasukan (Tambah Saldo)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Pengeluaran (Uang Keluar)</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                {type === 'income' ? 'Berapa Nominal Masuk? (Rp)' : 'Berapa Pengeluarannya? (Rp)'}
              </label>
              {amountStr && (
                <span className="text-xs font-bold text-slate-700">
                  {formatRupiah(parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0)}
                </span>
              )}
            </div>
            <div className="relative rounded-xl shadow-2xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                autoFocus
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickAddAmount(amt)}
                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  +{amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000}k`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md transition-colors cursor-pointer"
              >
                Reset ke 0
              </button>
            </div>
          </div>

          {/* Wallet Choice: E-Wallet vs Cash vs Bank */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              {type === 'income' ? 'Masuk ke Saldo Mana?' : 'Keluar dari Mana? (E-Wallet / Cash)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {WALLET_OPTIONS.map((opt) => {
                const isSelected = wallet === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setWallet(opt.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {opt.icon === 'smartphone' ? (
                        <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : opt.icon === 'cash' ? (
                        <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold truncate">
                        {opt.value.includes('E-Wallet')
                          ? 'E-Wallet'
                          : opt.value.includes('Cash')
                          ? 'Cash (Tunai)'
                          : 'Rekening Bank'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alasan / Catatan Pengeluaran & Pemasukan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              {type === 'expense' ? 'Alasan Mengeluarkan Uang (Untuk Apa?)' : 'Catatan Sumber Pemasukan'}
              <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'expense'
                  ? 'Contoh: Makan siang warteg, bensin motor, beli kopi...'
                  : 'Contoh: Gaji, transfer dari teman, hasil freelance...'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 self-center">Pilihan cepat:</span>
              {commonReasons.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  onClick={() => setDescription(reason)}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <Tag className="w-3.5 h-3.5 inline mr-1" />
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {activeCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors cursor-pointer ${
                    category === cat
                      ? type === 'income'
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'bg-rose-600 text-white shadow-2xs font-semibold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {editingTransaction
                  ? 'Simpan Perubahan'
                  : type === 'income'
                  ? 'Simpan ke Saldo Dana'
                  : 'Catat Pengeluaran'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
