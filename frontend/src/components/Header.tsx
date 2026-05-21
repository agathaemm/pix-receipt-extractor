import React from 'react';
import { FileSpreadsheet, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-borderDark/40 glass-panel sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-primary-600 to-emerald-500 rounded-xl shadow-lg shadow-primary-500/10">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              Pix Receipts <span className="text-primary-500 font-extrabold">XLS</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Leitor Inteligente & Gerador Excel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-borderDark/25 border border-borderDark/40 rounded-full text-xs font-semibold text-slate-300 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 pulse-glow" />
            <span>OCR & Heurística Local</span>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-400">Pronto</span>
        </div>
      </div>
    </header>
  );
};
export default Header;
