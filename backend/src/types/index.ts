export interface PixReceipt {
  id?: string;
  filename?: string;
  pagador: string;
  recebedor?: string;
  cpf_pagador?: string;
  cpf_recebedor?: string;
  banco_origem?: string;
  banco_destino?: string;
  chave_pix?: string;
  tipo_chave?: string;
  instituicao?: string;
  status?: string;
  data: string;
  hora: string;
  valor: string;
  transacao_id: string;
  status_processamento?: 'sucesso' | 'erro' | 'aviso';
  mensagem_erro?: string;
  campos_ausentes?: string[];
}
