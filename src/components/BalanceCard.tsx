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
  Info
} from 'lucide-react';
import { FinanceSummary } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface BalanceCardProps {
  summary: FinanceSummary;
  onUpdateStartingBalance: (newBalance: number) => void;
  onOpenAddModal: (type: 'income' | 'expense') => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  summary,
  onUpdateStartingBalance,
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

  const handleResetDefault = () => {
    onUpdateStartingBalance(7000000);
    setTempBalance('7000000');
    setIsEditingBalance(false);
  };

  // Expense ratio compared to (starting balance + income)
  const availableFunds = summary.startingBalance + summary.totalIncome;
  const spentRatio = availableFunds > 0 
    ? Math.min(100, Math.round((summary.totalExpense / availableFunds) * 100)) 
    : 0;

  // Health indicator
  const isHealthy = summary.currentBalance > 0 && spentRatio < 80;
  const isWarning = spentRatio >= 80 && summary.currentBalance > 0;
  const isDanger = summary.currentBalance <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 transition-all">
      {/* Top Banner / Month context */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Periode Keuangan</span>
            <h2 className="text-sm font-bold text-slate-800">Bulan Ini (Oktober 2026)</h2>
          </div>
        </div>

        {/* Starting Balance Editor */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 text-xs">
          <span className="text-slate-500 font-medium">Dana / Saldo Awal:</span>
          {isEditingBalance ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempBalance}
                onChange={(e) => setTempBalance(e.target.value)}
                className="w-28 px-2 py-0.5 text-xs font-bold text-slate-800 bg-white border border-emerald-400 rounded focus:outline-none"
                placeholder="7000000"
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
                onClick={handleResetDefault}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                title="Reset ke Rp 7 Juta"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">
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
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Total Available / Current Balance */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between text-slate-300 text-xs font-medium mb-1">
              <span>Dana Sekarang (Saldo Sisa)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-emerald-300 border border-white/10">
                Aktif
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {formatRupiah(summary.currentBalance)}
            </div>
            <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {summary.startingBalance === 7000000 
                ? 'Termasuk dana awal Rp 7 Juta bulan ini' 
                : `Dana awal diset ${formatRupiah(summary.startingBalance)}`}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Transaksi</span>
            <span className="font-semibold text-slate-200">{summary.transactionCount} catatan</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Total Pemasukan
              </span>
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-950 mt-2">
              +{formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">
              Tambahan dana tercatat bulan ini
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal('income')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200/90 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ Catat Pemasukan</span>
          </button>
        </div>

        {/* Expense Card */}
        <div className="bg-rose-50/60 border border-rose-100/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Total Pengeluaran
              </span>
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-950 mt-2">
              -{formatRupiah(summary.totalExpense)}
            </div>
            <p className="text-xs text-rose-700/80 mt-1">
              {spentRatio}% dari total dana tersedia terpakai
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-rose-800 bg-rose-100/90 hover:bg-rose-200/90 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>- Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Expense Progress Bar / Health Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-slate-600 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Penggunaan Dana Bulan Ini ({spentRatio}%)
          </span>
          <span className={`font-semibold ${
            isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {isDanger 
              ? 'Saldo Habis / Defisit!' 
              : isWarning 
              ? 'Mendekati Batas Dana (>80%)' 
              : 'Kondisi Keuangan Sehat'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDanger 
                ? 'bg-rose-500' 
                : isWarning 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, spentRatio))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
