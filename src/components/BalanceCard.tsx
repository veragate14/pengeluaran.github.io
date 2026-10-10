import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Edit3, 
  Check, 
  RotateCcw,
  Sparkles,
  Smartphone,
  Banknote,
  Building2,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { FinanceSummary } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface BalanceCardProps {
  summary: FinanceSummary;
  onUpdateStartingBalance: (newBalance: number) => void;
  onResetAllToZero: () => void;
  onOpenAddModal: (type: 'income' | 'expense') => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  summary,
  onUpdateStartingBalance,
  onResetAllToZero,
  onOpenAddModal,
}) => {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(summary.startingBalance.toString());

  const handleSaveBalance = () => {
    const val = parseFloat(tempBalance.replace(/[^0-9]/g, ''));
    if (!isNaN(val) && val >= 0) {
      onUpdateStartingBalance(val);
    }
    setIsEditingBalance(false);
  };

  const handleSetZero = () => {
    onUpdateStartingBalance(0);
    setTempBalance('0');
    setIsEditingBalance(false);
  };

  const now = new Date();
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rekap Bulan Sekarang
            </span>
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {currentMonthName}
            </h2>
          </div>
        </div>

        {/* Starting Balance & Reset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs">
            <span className="text-slate-500 font-medium">Saldo Awal:</span>
            {isEditingBalance ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                  className="w-24 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-emerald-400 rounded focus:outline-none"
                  placeholder="0"
                  autoFocus
                />
                <button
                  onClick={handleSaveBalance}
                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                  title="Simpan"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSetZero}
                  className="p-1 text-rose-500 hover:bg-rose-100 rounded"
                  title="Set ke 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">
                  {formatRupiah(summary.startingBalance)}
                </span>
                <button
                  onClick={() => {
                    setTempBalance(summary.startingBalance.toString());
                    setIsEditingBalance(true);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                  title="Ubah Saldo Awal"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onResetAllToZero}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            title="Reset saldo awal dan seluruh catatan menjadi 0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Semua ke 0</span>
          </button>
        </div>
      </div>

      {/* Main Saldo Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Card: Saldo Dana Sekarang */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-1">
              <span>SALDO DANA SEKARANG</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Total Tersedia
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              {formatRupiah(summary.currentBalance)}
            </div>
            <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Otomatis bertambah saat catat pemasukan baru</span>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Transaksi</span>
            <span className="font-bold text-slate-200">{summary.transactionCount} catatan</span>
          </div>
        </div>

        {/* E-Wallet & Cash Balances Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* E-Wallet Balance Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Saldo E-Wallet</h3>
                    <p className="text-[10px] text-slate-400">DANA, GoPay, OVO, ShopeePay</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatRupiah(summary.eWalletBalance)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
              <button
                onClick={() => onOpenAddModal('income')}
                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
              >
                + Masuk E-Wallet
              </button>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
              >
                - Keluar E-Wallet
              </button>
            </div>
          </div>

          {/* Cash Balance Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Saldo Cash (Tunai)</h3>
                    <p className="text-[10px] text-slate-400">Uang fisik di dompet / saku</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatRupiah(summary.cashBalance)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
              <button
                onClick={() => onOpenAddModal('income')}
                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
              >
                + Masuk Cash
              </button>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
              >
                - Keluar Cash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recap Bulan Sekarang: Pemasukan & Pengeluaran Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Pemasukan Bulan Ini */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Pemasukan Bulan Ini</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-950 mt-1">
            +{formatRupiah(summary.thisMonthIncome)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Menambah saldo dana sekarang
          </p>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/70">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
            <span>Pengeluaran Bulan Ini</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-extrabold text-rose-950 mt-1">
            -{formatRupiah(summary.thisMonthExpense)}
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            Total biaya dan belanja keluar
          </p>
        </div>

        {/* Sisa Arus Kas Bulan Ini */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Arus Kas Bersih Bulan Ini</span>
            <Wallet className="w-4 h-4 text-slate-500" />
          </div>
          <div
            className={`text-xl font-extrabold mt-1 ${
              summary.thisMonthNet >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.thisMonthNet >= 0
              ? `+${formatRupiah(summary.thisMonthNet)}`
              : formatRupiah(summary.thisMonthNet)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pemasukan dikurangi pengeluaran
          </p>
        </div>
      </div>
    </div>
  );
};
