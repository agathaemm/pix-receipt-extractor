import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, RefreshCw, Layers } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export const Dropzone: React.FC = () => {
  const { files, addFiles, updateFileProgress, updateFileStatus, removeFile, addReceipts, clearFiles } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      // 1. Register files in store
      addFiles(acceptedFiles);

      // 2. Start bulk upload process
      setIsUploading(true);

      // We will upload them in batches or all together.
      // The API supports multiple files at once under the 'files' field.
      // To give a highly interactive UX, we will upload the whole batch
      // and show global progress, updating file statuses appropriately.
      try {
        // Since Zustand store updates are immediate, let's run upload
        const responseReceipts = await api.uploadReceipts(
          acceptedFiles,
          (percent) => {
            // Track global upload progress and distribute it visually
            acceptedFiles.forEach((_, idx) => {
              // Distribute progress across files
              const fileId = useAppStore.getState().files.find(f => f.name === acceptedFiles[idx].name && f.status === 'idle')?.id;
              if (fileId) {
                updateFileProgress(fileId, percent);
                if (percent === 100) {
                  updateFileStatus(fileId, 'processing');
                } else {
                  updateFileStatus(fileId, 'uploading');
                }
              }
            });
          }
        );

        // 3. Mark everything as success or error in the store based on response
        acceptedFiles.forEach((file) => {
          const fileInStore = useAppStore.getState().files.find(f => f.name === file.name);
          if (fileInStore) {
            const correspondingResult = responseReceipts.find(r => r.filename === file.name);
            if (correspondingResult && correspondingResult.status_processamento !== 'erro') {
              updateFileStatus(fileInStore.id, 'success');
            } else {
              const errMsg = correspondingResult?.mensagem_erro || 'Erro ao extrair dados';
              updateFileStatus(fileInStore.id, 'error', { errorMessage: errMsg });
            }
          }
        });

        // 4. Feed successfully extracted receipts into Results Table
        addReceipts(responseReceipts);

      } catch (error) {
        console.error('Erro geral durante o upload:', error);
        // Mark all active files as error
        useAppStore.getState().files.forEach((f) => {
          if (f.status === 'uploading' || f.status === 'processing' || f.status === 'idle') {
            updateFileStatus(f.id, 'error', { errorMessage: (error as Error).message || 'Falha na conexão com o servidor' });
          }
        });
      } finally {
        setIsUploading(false);
      }
    },
    [addFiles, files, updateFileProgress, updateFileStatus, addReceipts]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    disabled: isUploading,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />;
      case 'processing':
        return <Layers className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Enviando arquivo...';
      case 'processing':
        return 'Processando OCR/IA...';
      case 'success':
        return 'Processado com sucesso';
      case 'error':
        return 'Falha no processamento';
      default:
        return 'Aguardando...';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Drag and drop panel */}
      <div
        {...getRootProps()}
        className={`w-full py-10 px-6 rounded-2xl border-2 border-dashed glass-panel cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
          isDragActive
            ? 'border-primary-500 bg-primary-500/5 shadow-inner scale-[1.01]'
            : 'border-borderDark hover:border-slate-500 hover:bg-slate-800/10'
        } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="p-4 bg-borderDark/30 rounded-full border border-borderDark/40 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary-500 pulse-glow" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-100">
            {isDragActive ? 'Solte os arquivos aqui!' : 'Arraste seus comprovantes Pix para cá'}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Suporta múltiplos arquivos simultâneos (PDF, JPG, JPEG, PNG)
          </p>
        </div>
        <button
          type="button"
          disabled={isUploading}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-semibold rounded-lg shadow-lg shadow-primary-600/15 transition-all duration-200"
        >
          Selecionar arquivos do computador
        </button>
      </div>

      {/* Uploading queue previews */}
      {files.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
              Fila de Upload ({files.length})
            </h3>
            <button
              onClick={clearFiles}
              disabled={isUploading}
              className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              Limpar Fila
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl border border-borderDark/40 bg-bgSurface/60 backdrop-blur-md flex items-center gap-3 relative overflow-hidden group shadow-md"
              >
                {/* Thumbnail Preview */}
                <div className="w-11 h-11 rounded-lg border border-borderDark/40 bg-slate-800/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary-500" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                  {/* Individual Status */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {getStatusIcon(file.status)}
                    <span className="text-[10px] font-semibold text-slate-300">
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </div>

                {/* Delete icon */}
                {!isUploading && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* File-specific Progress Bar at the bottom */}
                {(file.status === 'uploading' || file.status === 'processing') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-borderDark/50">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        file.status === 'processing' ? 'from-amber-500 to-primary-500 animate-pulse' : 'from-primary-500 to-emerald-500'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Dropzone;
