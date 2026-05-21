import { create } from 'zustand';
import { PixReceipt, UploadFileState } from '../types';

interface AppState {
  files: UploadFileState[];
  receipts: PixReceipt[];
  // File upload state actions
  addFiles: (rawFiles: File[]) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadFileState['status'], extra?: { errorMessage?: string }) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  // Receipt actions
  addReceipts: (newReceipts: PixReceipt[]) => void;
  updateReceipt: (id: string, updatedReceipt: Partial<PixReceipt>) => void;
  deleteReceipt: (id: string) => void;
  clearReceipts: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  receipts: [],

  addFiles: (rawFiles) => {
    const newFiles = rawFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      return {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'idle' as const,
        previewUrl,
      };
    });

    set((state) => ({ files: [...state.files, ...newFiles] }));
  },

  updateFileProgress: (id, progress) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    }));
  },

  updateFileStatus: (id, status, extra) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              progress: status === 'success' ? 100 : f.progress,
              errorMessage: extra?.errorMessage,
            }
          : f
      ),
    }));
  },

  removeFile: (id) => {
    set((state) => {
      const fileToRemove = state.files.find((f) => f.id === id);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return { files: state.files.filter((f) => f.id !== id) };
    });
  },

  clearFiles: () => {
    set((state) => {
      state.files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return { files: [] };
    });
  },

  addReceipts: (newReceipts) => {
    set((state) => {
      // Avoid duplicates based on receipt transaction ID if present and valid,
      // or simple fallback. Here, we just append them.
      return { receipts: [...state.receipts, ...newReceipts] };
    });
  },

  updateReceipt: (id, updatedReceipt) => {
    set((state) => ({
      receipts: state.receipts.map((r) => {
        if (r.id === id) {
          const merged = { ...r, ...updatedReceipt };
          // Re-evaluate missing fields
          const fieldsToCheck = { ...merged };
          const DADO_AUSENTE = 'Dado não disponível no comprovante';
          const campos_ausentes: string[] = [];

          Object.entries(fieldsToCheck).forEach(([key, val]) => {
            // Exclude status_processamento, id, filename, etc.
            if (
              ['id', 'filename', 'status_processamento', 'campos_ausentes', 'mensagem_erro'].includes(key)
            ) {
              return;
            }
            if (val === DADO_AUSENTE || val === 'Não informado' || val === '') {
              campos_ausentes.push(key);
            }
          });

          // Re-evaluate processing status
          let status_processamento: PixReceipt['status_processamento'] = 'sucesso';
          if (merged.valor === DADO_AUSENTE || merged.valor === '' || (merged.pagador === DADO_AUSENTE && merged.recebedor === DADO_AUSENTE)) {
            status_processamento = 'erro';
          } else if (campos_ausentes.length > 0) {
            status_processamento = 'aviso';
          }

          return {
            ...merged,
            campos_ausentes,
            status_processamento,
          };
        }
        return r;
      }),
    }));
  },

  deleteReceipt: (id) => {
    set((state) => ({
      receipts: state.receipts.filter((r) => r.id !== id),
    }));
  },

  clearReceipts: () => set({ receipts: [] }),
}));
