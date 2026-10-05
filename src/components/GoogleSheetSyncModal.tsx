import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Link as LinkIcon, 
  CheckCircle2, 
  Unlink, 
  HelpCircle,
  DownloadCloud,
  UploadCloud
} from 'lucide-react';
import { GoogleSheetConfig, Transaction } from '../types/finance';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  sheetConfig: GoogleSheetConfig;
  isSyncing: boolean;
  transactionsCount: number;
  onClose: () => void;
  onCreateNewSheet: () => Promise<void>;
  onConnectExistingSheet: (idOrUrl: string) => Promise<void>;
  onSyncPushToSheet: () => Promise<void>;
  onSyncPullFromSheet: () => Promise<void>;
  onDisconnectSheet: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  userEmail,
  sheetConfig,
  isSyncing,
  transactionsCount,
  onClose,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncPushToSheet,
  onSyncPullFromSheet,
  onDisconnectSheet,
}) => {
  const [existingInput, setExistingInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'link'>('create');

  if (!isOpen) return null;

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInput.trim()) {
      setErrorMessage('Masukkan ID atau URL Google Sheet yang valid.');
      return;
    }
    setErrorMessage('');
    try {
      await onConnectExistingSheet(existingInput.trim());
      setExistingInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghubungkan Google Sheet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Integrasi Google Sheets</h3>
              <p className="text-xs text-slate-500">
                {userEmail ? `Akun: ${userEmail}` : 'Sinkronkan catatan transaksi harian'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {sheetConfig.spreadsheetId ? (
            /* Connected state */
            <div className="space-y-5">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Terhubung ke Google Sheets</span>
                  </div>
                  {sheetConfig.spreadsheetUrl && (
                    <a
                      href={sheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span>Buka Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">{sheetConfig.spreadsheetName}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">
                    ID: {sheetConfig.spreadsheetId}
                  </div>
                  {sheetConfig.lastSyncedAt && (
                    <div className="text-[11px] text-emerald-700 mt-1">
                      Terakhir sinkron: {new Date(sheetConfig.lastSyncedAt).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              </div>

              {/* Sync Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSyncPushToSheet}
                  disabled={isSyncing}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Kirim Data ke Sheet</span>
                  <span className="text-[10px] font-normal opacity-80">
                    ({transactionsCount} transaksi lokal)
                  </span>
                </button>

                <button
                  onClick={onSyncPullFromSheet}
                  disabled={isSyncing}
                  className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <DownloadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>Tarik Data dari Sheet</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Muat transaksi dari spreadsheet
                  </span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={onDisconnectSheet}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>Putuskan Tautan Spreadsheet</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Not connected state */
            <div className="space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Hubungkan dengan Google Sheets untuk menyimpan dan mencadangkan setiap transaksi harian Anda langsung ke Google Drive secara terstruktur dan aman.
              </p>

              {/* Method Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'create'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buat Spreadsheet Otomatis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'link'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gunakan Sheet Yang Ada
                </button>
              </div>

              {activeTab === 'create' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">
                      Format Otomatis CatatKas
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sistem akan membuat file spreadsheet baru berjudul &quot;CatatKas - Catatan Keuangan Pribadi&quot; di akun Google Drive Anda lengkap dengan tab Transaksi &amp; Ringkasan Bulanan.
                    </p>
                  </div>

                  <button
                    onClick={onCreateNewSheet}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSyncing ? 'Sedang Membuat Sheet...' : 'Buat Spreadsheet Baru Sekarang'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLinkExisting} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      ID atau Link Google Sheet
                    </label>
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/1A2B3C.../edit"
                      value={existingInput}
                      onChange={(e) => setExistingInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pastikan akun Google Anda memiliki hak akses edit pada sheet tersebut.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Tautkan Spreadsheet</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
