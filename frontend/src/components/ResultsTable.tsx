import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { FileSpreadsheet, Trash2, Edit2, AlertCircle, RefreshCw } from 'lucide-react';
import { PixReceipt } from '../types';

export const ResultsTable: React.FC = () => {
  const { receipts, updateReceipt, deleteReceipt, clearReceipts } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [activeEditCell, setActiveEditCell] = useState<{ id: string; field: keyof PixReceipt } | null>(null);

  if (receipts.length === 0) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await api.exportToExcel(receipts);
    } catch (err) {
      console.error('Falha ao exportar planilha:', err);
      alert('Ocorreu um erro ao gerar o arquivo Excel. Verifique a conexão com o servidor.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCellBlur = () => {
    setActiveEditCell(null);
  };

  const handleCellChange = (id: string, field: keyof PixReceipt, value: string) => {
    updateReceipt(id, { [field]: value });
  };

  // Safe check if a value is absent
  const isAbsent = (value: string) => {
    return !value || value === 'Dado não disponível no comprovante' || value === 'Não informado' || value.trim() === '';
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-fadeIn">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-borderDark/40">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Comprovantes Processados
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/25 border border-primary-500/35 text-primary-300">
              {receipts.length} itens
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dê dois cliques em qualquer célula para editar manualmente as informações.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={clearReceipts}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-borderDark transition-colors"
          >
            Limpar Resultados
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-700/15 disabled:opacity-50 transition-all duration-200"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warnings Bar */}
      {receipts.some(r => r.status_processamento === 'aviso' || r.status_processamento === 'erro') && (
        <div className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 backdrop-blur-md flex items-start gap-2.5 text-xs text-amber-300/95 leading-relaxed">
          <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Alguns dados estão ausentes:</span> Células em vermelho/itálico não foram identificadas pelo OCR ou extrator no comprovante. Você pode preenchê-las manualmente digitando diretamente no campo correspondente antes de exportar a planilha final.
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-borderDark/40 bg-bgSurface/50 backdrop-blur-md shadow-2xl relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bgDeep/60 border-b border-borderDark/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold text-center w-12">Status</th>
              <th className="py-3 px-4 font-semibold min-w-[150px]">Arquivo</th>
              <th className="py-3 px-4 font-semibold min-w-[180px]">Pagador</th>
              <th className="py-3 px-4 font-semibold min-w-[100px] text-center">Data</th>
              <th className="py-3 px-4 font-semibold min-w-[80px] text-center">Horário</th>
              <th className="py-3 px-4 font-semibold min-w-[110px]">Valor</th>
              <th className="py-3 px-4 font-semibold min-w-[220px]">ID Transação Pix</th>
              <th className="py-3 px-4 text-center w-12">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderDark/30">
            {receipts.map((row) => (
              <tr 
                key={row.id}
                className="hover:bg-slate-800/20 transition-colors text-xs text-slate-200 group"
              >
                {/* Status Indicator */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center">
                    {row.status_processamento === 'sucesso' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/20" title="Sucesso" />
                    )}
                    {row.status_processamento === 'aviso' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-md shadow-amber-500/20" title="Contém dados ausentes" />
                    )}
                    {row.status_processamento === 'erro' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-md shadow-red-500/20 animation-pulse" title="Falha crítica de leitura" />
                    )}
                  </div>
                </td>

                {/* Filename */}
                <td className="py-3 px-4 font-medium text-slate-300 truncate max-w-[160px]" title={row.filename}>
                  {row.filename}
                </td>

                {/* Pagador */}
                <td className="p-1">
                  <CellEdit
                    receiptId={row.id}
                    field="pagador"
                    value={row.pagador}
                    isActive={activeEditCell?.id === row.id && activeEditCell?.field === 'pagador'}
                    onDoubleClick={() => setActiveEditCell({ id: row.id, field: 'pagador' })}
                    onChange={handleCellChange}
                    onBlur={handleCellBlur}
                    isAbsent={isAbsent(row.pagador)}
                  />
                </td>

                {/* Data */}
                <td className="p-1">
                  <CellEdit
                    receiptId={row.id}
                    field="data"
                    value={row.data}
                    isActive={activeEditCell?.id === row.id && activeEditCell?.field === 'data'}
                    onDoubleClick={() => setActiveEditCell({ id: row.id, field: 'data' })}
                    onChange={handleCellChange}
                    onBlur={handleCellBlur}
                    isAbsent={isAbsent(row.data)}
                    extraStyles="text-center"
                  />
                </td>

                {/* Hora */}
                <td className="p-1">
                  <CellEdit
                    receiptId={row.id}
                    field="hora"
                    value={row.hora}
                    isActive={activeEditCell?.id === row.id && activeEditCell?.field === 'hora'}
                    onDoubleClick={() => setActiveEditCell({ id: row.id, field: 'hora' })}
                    onChange={handleCellChange}
                    onBlur={handleCellBlur}
                    isAbsent={isAbsent(row.hora)}
                    extraStyles="text-center text-slate-300"
                  />
                </td>

                {/* Valor */}
                <td className="p-1">
                  <CellEdit
                    receiptId={row.id}
                    field="valor"
                    value={row.valor}
                    isActive={activeEditCell?.id === row.id && activeEditCell?.field === 'valor'}
                    onDoubleClick={() => setActiveEditCell({ id: row.id, field: 'valor' })}
                    onChange={handleCellChange}
                    onBlur={handleCellBlur}
                    isAbsent={isAbsent(row.valor)}
                    extraStyles="font-bold text-slate-100"
                  />
                </td>

                {/* Transacao ID */}
                <td className="p-1">
                  <CellEdit
                    receiptId={row.id}
                    field="transacao_id"
                    value={row.transacao_id}
                    isActive={activeEditCell?.id === row.id && activeEditCell?.field === 'transacao_id'}
                    onDoubleClick={() => setActiveEditCell({ id: row.id, field: 'transacao_id' })}
                    onChange={handleCellChange}
                    onBlur={handleCellBlur}
                    isAbsent={isAbsent(row.transacao_id)}
                    extraStyles="font-mono text-[10px]"
                  />
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => deleteReceipt(row.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                    title="Excluir comprovante"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente utilitário para edição em tempo real das células da tabela
interface CellEditProps {
  receiptId: string;
  field: keyof PixReceipt;
  value: string;
  isActive: boolean;
  onDoubleClick: () => void;
  onChange: (id: string, field: keyof PixReceipt, value: string) => void;
  onBlur: () => void;
  isAbsent: boolean;
  extraStyles?: string;
}

const CellEdit: React.FC<CellEditProps> = ({
  receiptId,
  field,
  value,
  isActive,
  onDoubleClick,
  onChange,
  onBlur,
  isAbsent,
  extraStyles = '',
}) => {
  const [localVal, setLocalVal] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(receiptId, field, localVal);
      onBlur();
    }
    if (e.key === 'Escape') {
      setLocalVal(value); // Revert
      onBlur();
    }
  };

  const handleBlur = () => {
    onChange(receiptId, field, localVal);
    onBlur();
  };

  if (isActive) {
    return (
      <input
        type="text"
        autoFocus
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1 text-xs text-white bg-slate-900 border border-primary-500 focus:outline-none rounded"
      />
    );
  }

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between group/cell transition-colors min-h-[30px] hover:bg-slate-700/25 ${extraStyles} ${
        isAbsent ? 'text-red-400 bg-red-950/15 italic text-[11px]' : ''
      }`}
      title="Dê dois cliques para editar"
    >
      <span className="truncate max-w-[180px]">
        {value}
      </span>
      <Edit2 className="w-3 h-3 text-slate-600 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1.5" />
    </div>
  );
};
export default ResultsTable;
