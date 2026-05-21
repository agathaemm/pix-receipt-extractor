import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import ResultsTable from './components/ResultsTable';
import { useAppStore } from './store/useAppStore';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const queryClient = new QueryClient();

export const AppContent: React.FC = () => {
  const { receipts } = useAppStore();

  // Statistics calculations
  const totalFiles = receipts.length;
  const processedSuccess = receipts.filter(r => r.status_processamento === 'sucesso').length;
  const processedWarnings = receipts.filter(r => r.status_processamento === 'aviso').length;
  const processedErrors = receipts.filter(r => r.status_processamento === 'erro').length;

  return (
    <div className="min-h-screen flex flex-col pb-10">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 animate-fadeIn">
        
        {/* Intro Branding Section */}
        <div className="flex flex-col gap-1.5 md:max-w-2xl">
          <span className="text-primary-500 text-xs font-bold uppercase tracking-wider">
            Automação Financeira
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Extração Inteligente de Comprovantes Pix
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mt-1">
            Faça upload de múltiplos comprovantes (fotos, PDFs ou prints) e converta-os instantaneamente em uma tabela estruturada. Revise, edite se necessário, e exporte tudo para uma planilha Excel perfeitamente formatada.
          </p>
        </div>

        {/* Stats Section */}
        {totalFiles > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* Total */}
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Enviado</p>
                <h4 className="text-2xl font-bold mt-1 text-white">{totalFiles}</h4>
              </div>
              <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Sucesso */}
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sucesso OCR</p>
                <h4 className="text-2xl font-bold mt-1 text-emerald-400">{processedSuccess}</h4>
              </div>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Avisos */}
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avisos/Faltantes</p>
                <h4 className="text-2xl font-bold mt-1 text-amber-400">{processedWarnings}</h4>
              </div>
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Erros */}
            <div className="p-4 rounded-2xl glass-card flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Falhas OCR</p>
                <h4 className="text-2xl font-bold mt-1 text-red-400">{processedErrors}</h4>
              </div>
              <div className="p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        <div className="w-full">
          <Dropzone />
        </div>

        {/* Results Data Table */}
        <div className="w-full">
          <ResultsTable />
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t border-borderDark/20 mt-auto">
        <p className="text-xs text-slate-500 font-medium">
          Pix Receipts XLS © {new Date().getFullYear()} — Plataforma Segura e Privada. Processamento local.
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
