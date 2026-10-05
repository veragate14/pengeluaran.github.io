import React, { useMemo } from 'react';
import { 
  PieChart, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  CalendarDays,
  Target
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
  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
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
  }, [transactions]);

  // Last 7 days spending
  const past7DaysData = useMemo(() => {
    const days: { dateStr: string; label: string; expense: number; income: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      const dateNum = d.getDate();

      const dayTxs = transactions.filter((t) => t.date === dateStr);
      const exp = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const inc = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

      days.push({
        dateStr,
        label: `${dayName} ${dateNum}`,
        expense: exp,
        income: inc,
      });
    }

    const maxExp = Math.max(...days.map((d) => d.expense), 100000);
    return { days, maxExp };
  }, [transactions]);

  // Daily budget pacing
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay + 1);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = startingBalance + totalIncome - totalExpense;

  const avgDailyExpense = currentDay > 0 ? Math.round(totalExpense / currentDay) : 0;
  const safeDailyAllocation = currentBalance > 0 ? Math.round(currentBalance / remainingDays) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Expense Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Alokasi Pengeluaran per Kategori</h3>
              <p className="text-[11px] text-slate-500">Kategori dengan pengeluaran terbesar</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3.5">
          {expenseByCategory.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Belum ada data pengeluaran untuk dianalisis.
            </p>
          ) : (
            expenseByCategory.map((item, idx) => {
              const colors = [
                'bg-rose-500',
                'bg-amber-500',
                'bg-indigo-500',
                'bg-emerald-500',
                'bg-cyan-500',
                'bg-purple-500',
                'bg-pink-500',
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
                      <span className="text-slate-400 text-[11px] font-medium">
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

      {/* 7-Day Trend & Budget Pacing */}
      <div className="space-y-6">
        {/* Trend Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tren Pengeluaran 7 Hari</h3>
                <p className="text-[11px] text-slate-500">Pola belanja harian sepekan terakhir</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 items-end h-32 pt-4">
            {past7DaysData.days.map((d) => {
              const heightPercent = Math.min(
                100,
                Math.round((d.expense / past7DaysData.maxExp) * 100)
              );

              return (
                <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="text-[9px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                    {d.expense > 0 ? `${Math.round(d.expense / 1000)}k` : '0'}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-md relative flex items-end justify-center h-20 overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        d.expense > 0 ? 'bg-rose-500 group-hover:bg-rose-600' : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(d.expense > 0 ? 10 : 0, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] font-medium text-slate-500 mt-2 truncate">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Pacing & Budget Health */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Rekomendasi Alokasi Harian
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-slate-400 block">Rata-rata Belanja / Hari</span>
              <span className="text-base font-bold text-white mt-1 block">
                {formatRupiah(avgDailyExpense)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Sejauh ini ({currentDay} hari bulan ini)
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[11px] text-emerald-300 block">Batas Aman Belanja / Hari</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {formatRupiah(safeDailyAllocation)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Untuk sisa {remainingDays} hari ke depan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
