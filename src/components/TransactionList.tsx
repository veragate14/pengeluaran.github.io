import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Download, 
  PlusCircle, 
  Inbox,
  Smartphone,
  Banknote,
  Building2,
  FileText
} from 'lucide-react';
import { Transaction } from '../types/finance';
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
  const [walletFilter, setWalletFilter] = useState<'all' | 'ewallet' | 'cash' | 'bank'>('all');
  const [dateFilter, setDateFilter] = useState<'this_month' | 'today' | '7days' | 'all'>('this_month');

  // Filtered transactions
  const filtered = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonthStr = today.slice(0, 7); // YYYY-MM
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // Search by description (alasan), category, wallet, or amount
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

      // Wallet filter (E-Wallet vs Cash vs Bank)
      if (walletFilter === 'ewallet' && !tx.wallet.includes('E-Wallet')) {
        return false;
      }
      if (walletFilter === 'cash' && !tx.wallet.includes('Cash')) {
        return false;
      }
      if (walletFilter === 'bank' && !tx.wallet.includes('Bank')) {
        return false;
      }

      // Date filter
      if (dateFilter === 'this_month' && !tx.date.startsWith(currentMonthStr)) {
        return false;
      }
      if (dateFilter === 'today' && tx.date !== today) {
        return false;
      }
      if (dateFilter === '7days' && tx.date < sevenDaysAgoStr) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter, walletFilter, dateFilter]);

  // Group by date (descending)
  const groupedByDate = useMemo(() => {
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
    const headers = [
      'ID',
      'Tanggal',
      'Waktu',
      'Tipe',
      'Nominal (Rp)',
      'Sumber/Metode (E-Wallet/Cash/Bank)',
      'Alasan/Keperluan Pengeluaran/Pemasukan',
      'Kategori',
    ];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
      `"${t.wallet}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CatatKas_Rekap_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Riwayat Catatan Transaksi
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} catatan
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkap dengan catatan alasan, berapa nominalnya, dan sumber e-wallet atau cash
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari alasan / keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
          </div>

          {/* Wallet Filter (E-Wallet vs Cash) */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setWalletFilter('all')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                walletFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Dompet
            </button>
            <button
              onClick={() => setWalletFilter('ewallet')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                walletFilter === 'ewallet'
                  ? 'bg-emerald-100 text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>E-Wallet</span>
            </button>
            <button
              onClick={() => setWalletFilter('cash')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                walletFilter === 'cash'
                  ? 'bg-amber-100 text-amber-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="w-3 h-3" />
              <span>Cash</span>
            </button>
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="this_month">Bulan Ini</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            title="Download CSV"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-5">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Belum ada catatan transaksi</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Catat uang masuk atau pengeluaran pertamamu lengkap dengan nominal dan alasannya.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi Sekarang</span>
            </button>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, txs]) => {
            const dailyIncome = txs
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0);
            const dailyExpense = txs
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);
            const dailyNet = dailyIncome - dailyExpense;

            return (
              <div key={date} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {/* Date Header */}
                <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-900">
                      {getRelativeDateLabel(date)}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">({date})</span>
                  </div>

                  {/* Daily Net Flow */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Arus Kas:</span>
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
                <div className="divide-y divide-slate-100">
                  {txs.map((tx) => {
                    const isEwallet = tx.wallet.includes('E-Wallet');
                    const isCash = tx.wallet.includes('Cash');

                    return (
                      <div
                        key={tx.id}
                        className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Left: Icon, Alasan Pengeluaran/Pemasukan, Category, Wallet Badge */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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
                            {/* Alasan / Keperluan (Prominently displayed) */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 leading-snug">
                                {tx.description || tx.category}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {tx.time}
                              </span>
                            </div>

                            {/* Badges: E-Wallet vs Cash + Kategori */}
                            <div className="flex items-center gap-2 text-[11px] mt-1 flex-wrap">
                              {/* Wallet Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isEwallet
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isCash
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {isEwallet ? (
                                  <Smartphone className="w-2.5 h-2.5" />
                                ) : isCash ? (
                                  <Banknote className="w-2.5 h-2.5" />
                                ) : (
                                  <Building2 className="w-2.5 h-2.5" />
                                )}
                                <span>{isEwallet ? 'E-Wallet' : isCash ? 'Cash (Tunai)' : 'Bank'}</span>
                              </span>

                              {/* Kategori Badge */}
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                                {tx.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Nominal (Berapa Pengeluarannya) & Edit/Delete Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span
                              className={`text-sm sm:text-base font-extrabold ${
                                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '-'}
                              {formatRupiah(tx.amount)}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {tx.type === 'income' ? 'Masuk ke saldo' : 'Pengeluaran'}
                            </div>
                          </div>

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
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
