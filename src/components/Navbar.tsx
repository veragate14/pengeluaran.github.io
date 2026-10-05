import React from 'react';
import { User } from 'firebase/auth';
import { 
  Wallet, 
  ExternalLink, 
  RefreshCw, 
  LogOut, 
  FileSpreadsheet, 
  CloudCheck, 
  AlertCircle
} from 'lucide-react';
import { GoogleSheetConfig } from '../types/finance';

interface NavbarProps {
  user: User | null;
  sheetConfig: GoogleSheetConfig;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenSheetModal: () => void;
  onTriggerSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  sheetConfig,
  isSyncing,
  onLogin,
  onLogout,
  onOpenSheetModal,
  onTriggerSync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">CatatKas</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Keuangan Pribadi
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Pencatatan Harian & Sinkronisasi Google Sheets
              </p>
            </div>
          </div>

          {/* Right Actions: Google Sheets status & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Status Button */}
            {user ? (
              <div className="flex items-center gap-2">
                {sheetConfig.spreadsheetId ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={onTriggerSync}
                      disabled={isSyncing}
                      title="Sinkronkan dengan Google Sheets sekarang"
                      className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span className="hidden md:inline">{isSyncing ? 'Sinkronisasi...' : 'Sinkron'}</span>
                    </button>

                    <button
                      onClick={onOpenSheetModal}
                      className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Google Sheets Aktif</span>
                    </button>

                    {sheetConfig.spreadsheetUrl && (
                      <a
                        href={sheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka Spreadsheet di Google Sheets"
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenSheetModal}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Hubungkan Google Sheets</span>
                  </button>
                )}

                {/* User Dropdown / Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <button
                    onClick={onLogout}
                    title="Keluar dari Google"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Google Sign In Official Styled Button */
              <button
                onClick={onLogin}
                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs active:bg-slate-100 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
