export interface PixReceipt {
  id: string;
  filename: string;
  pagador: string;
  recebedor: string;
  data: string;
  hora: string;
  valor: string;
  transacao_id: string;
  status_processamento: 'sucesso' | 'erro' | 'aviso';
  mensagem_erro?: string;
  campos_ausentes: string[];
}

export interface UploadFileState {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  errorMessage?: string;
  previewUrl?: string;
}
