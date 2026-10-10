import React, { useMemo } from 'react';
import { 
  PieChart, 
  BarChart3, 
  Smartphone, 
  Banknote, 
  Building2,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  startingBalance: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  startingBalance,
}) => {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

  // Filter only transactions in current month
  const thisMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  const thisMonthIncome = useMemo(() => {
    return thisMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [thisMonthTransactions]);

  const thisMonthExpense = useMemo(() => {
    return thisMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [thisMonthTransactions]);

  // Breakdown by Wallet in current month (E-Wallet vs Cash vs Bank)
  const walletBreakdown = useMemo(() => {
    let ewalletIn = 0;
    let ewalletOut = 0;
    let cashIn = 0;
    let cashOut = 0;
    let bankIn = 0;
    let bankOut = 0;

    for (const t of thisMonthTransactions) {
      if (t.wallet.includes('E-Wallet')) {
        if (t.type === 'income') ewalletIn += t.amount;
        else ewalletOut += t.amount;
      } else if (t.wallet.includes('Cash')) {
        if (t.type === 'income') cashIn += t.amount;
        else cashOut += t.amount;
      } else {
        if (t.type === 'income') bankIn += t.amount;
        else bankOut += t.amount;
      }
    }

    return {
      ewalletIn,
      ewalletOut,
      cashIn,
      cashOut,
      bankIn,
      bankOut,
    };
  }, [thisMonthTransactions]);

  // Top Expense Reasons in current month
  const topExpenseReasons = useMemo(() => {
    const expenses = thisMonthTransactions.filter((t) => t.type === 'expense');
    return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [thisMonthTransactions]);

  // Category Expense Distribution in current month
  const expenseByCategory = useMemo(() => {
    const expenses = thisMonthTransactions.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map: { [cat: string]: number } = {};
    for (const exp of expenses) {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    }

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthTransactions]);

  return (
    <div className="space-y-6">
      {/* Monthly Recap Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                Rekap Keuangan Bulan {currentMonthName}
              </h3>
              <p className="text-xs text-slate-500">
                Ringkasan menyeluruh pemasukan, pengeluaran, dan sumber e-wallet vs cash
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            {thisMonthTransactions.length} Transaksi Bulan Ini
          </span>
        </div>

        {/* 3 Top Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Total Pemasukan Bulan Ini</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              +{formatRupiah(thisMonthIncome)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Uang masuk ke saldo dana
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Total Pengeluaran Bulan Ini</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
              -{formatRupiah(thisMonthExpense)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Total biaya dan belanja keluar
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold block">Selisih Arus Kas Bulan Ini</span>
            <span
              className={`text-2xl font-extrabold mt-1 block ${
                thisMonthIncome - thisMonthExpense >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {thisMonthIncome - thisMonthExpense >= 0 ? '+' : ''}
              {formatRupiah(thisMonthIncome - thisMonthExpense)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {thisMonthIncome - thisMonthExpense >= 0 ? 'Surplus anggaran' : 'Defisit anggaran'}
            </span>
          </div>
        </div>
      </div>

      {/* Rekap E-Wallet vs Cash */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>Rekap Sumber Dana: E-Wallet vs Cash Bulan Ini</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* E-Wallet Recap */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>E-Wallet (DANA / GoPay / OVO)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-semibold block">Masuk ke E-Wallet</span>
                <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                  +{formatRupiah(walletBreakdown.ewalletIn)}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-semibold block">Keluar via E-Wallet</span>
                <span className="text-sm font-bold text-rose-600 block mt-0.5">
                  -{formatRupiah(walletBreakdown.ewalletOut)}
                </span>
              </div>
            </div>
          </div>

          {/* Cash Recap */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Banknote className="w-4 h-4 text-amber-600" />
              <span>Cash (Uang Tunai)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <span className="text-[10px] text-slate-500 font-semibold block">Masuk ke Cash</span>
                <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                  +{formatRupiah(walletBreakdown.cashIn)}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                <span className="text-[10px] text-slate-500 font-semibold block">Keluar via Cash</span>
                <span className="text-sm font-bold text-rose-600 block mt-0.5">
                  -{formatRupiah(walletBreakdown.cashOut)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Expense Reasons & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catatan Alasan Pengeluaran Terbesar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alasan Pengeluaran Terbesar Bulan Ini
              </h3>
              <p className="text-[11px] text-slate-500">
                Catatan berapa keluar dan alasan penggunaannya
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {topExpenseReasons.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada catatan pengeluaran di bulan ini.
              </p>
            ) : (
              topExpenseReasons.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3 border border-slate-100"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {t.description}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 ml-7 block">
                      {t.wallet.includes('E-Wallet') ? 'E-Wallet' : 'Cash'} • {t.date}
                    </span>
                  </div>

                  <span className="text-xs font-extrabold text-rose-600 shrink-0">
                    -{formatRupiah(t.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Expense Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kategori Pengeluaran Bulan Ini
              </h3>
              <p className="text-[11px] text-slate-500">
                Persentase pos pengeluaran
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {expenseByCategory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada data pengeluaran bulan ini.
              </p>
            ) : (
              expenseByCategory.map((item, idx) => {
                const colors = [
                  'bg-rose-500',
                  'bg-amber-500',
                  'bg-indigo-500',
                  'bg-emerald-500',
                  'bg-cyan-500',
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${barColor}`} />
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">
                          {item.percentage}%
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatRupiah(item.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${Math.max(4, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
