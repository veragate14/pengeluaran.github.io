import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  CreditCard, 
  Download,
  PlusCircle,
  Inbox
} from 'lucide-react';
import { Transaction, TransactionType, Category } from '../types/finance';
import { formatRupiah, getRelativeDateLabel } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'this_month'>('all');

  // Filtered transactions
  const filtered = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const currentMonthStr = today.slice(0, 7); // YYYY-MM

    return transactions.filter((tx) => {
      // Search
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today' && tx.date !== today) {
        return false;
      }
      if (dateFilter === '7days' && tx.date < sevenDaysAgoStr) {
        return false;
      }
      if (dateFilter === 'this_month' && !tx.date.startsWith(currentMonthStr)) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter, dateFilter]);

  // Group by date (descending)
  const groupedByDate = useMemo(() => {
    // Sort transactions by date desc, then createdAt desc
    const sorted = [...filtered].sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    const groups: { [date: string]: Transaction[] } = {};
    for (const tx of sorted) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    return groups;
  }, [filtered]);

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Tanggal', 'Waktu', 'Tipe', 'Kategori', 'Nominal', 'Dompet', 'Keterangan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category}"`,
      t.amount,
      `"${t.wallet}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CatatKas_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Riwayat Transaksi Harian
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length} dari {transactions.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar catatan uang masuk dan keluar setiap hari
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi / ket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'expense' ? 'bg-rose-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="this_month">Bulan Ini</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            title="Download Cadangan CSV"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="mt-4 space-y-6">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Mulai catat pemasukan atau pengeluaran harianmu untuk mengontrol keuangan bulan ini.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Transaksi Sekarang</span>
            </button>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, txs]) => {
            // Calculate daily net flow
            const dailyIncome = txs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);
            const dailyExpense = txs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);
            const dailyNet = dailyIncome - dailyExpense;

            return (
              <div key={date} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                {/* Date Header */}
                <div className="bg-slate-100/70 px-4 py-2.5 flex items-center justify-between border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">
                      {getRelativeDateLabel(date)}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">({date})</span>
                  </div>

                  {/* Daily Net Flow */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Arus Kas Hari Ini:</span>
                    <span
                      className={`font-bold ${
                        dailyNet > 0
                          ? 'text-emerald-700'
                          : dailyNet < 0
                          ? 'text-rose-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {dailyNet > 0 ? `+${formatRupiah(dailyNet)}` : formatRupiah(dailyNet)}
                    </span>
                  </div>
                </div>

                {/* Items in this date */}
                <div className="divide-y divide-slate-100 bg-white">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Left: Icon, Category, Description, Wallet */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {tx.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {tx.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                            {tx.description && (
                              <span className="truncate max-w-[200px] sm:max-w-xs text-slate-700 font-medium">
                                {tx.description}
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <CreditCard className="w-2.5 h-2.5" />
                              {tx.wallet}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-sm font-extrabold ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </span>

                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx)}
                            title="Hapus Transaksi"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
