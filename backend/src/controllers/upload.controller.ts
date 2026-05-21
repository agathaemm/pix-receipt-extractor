import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { OcrService } from '../services/ocr.service';
import { ParserService } from '../services/parser.service';
import { PixReceipt } from '../types';

export class UploadController {
  /**
   * Main upload handler that processes multiple files (Images / PDFs).
   */
  public static async uploadReceipts(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        return;
      }

      const results: PixReceipt[] = [];

      // Process files concurrently or sequentially
      // For reliable memory usage and logging, we will run them sequentially in a robust loop
      for (const file of files) {
        const filename = file.originalname;
        const mimeType = file.mimetype;
        const buffer = file.buffer;

        try {
          let extractedText = '';

          if (mimeType === 'application/pdf') {
            extractedText = await PdfService.extractTextFromPdf(buffer);
          } else if (mimeType.startsWith('image/')) {
            extractedText = await OcrService.extractTextFromImage(buffer);
          } else {
            throw new Error('Formato de arquivo não suportado. Envie apenas PDF, JPG, JPEG ou PNG.');
          }

          const parsedReceipt = ParserService.parse(extractedText, filename);
          results.push(parsedReceipt);
        } catch (error) {
          console.error(`Erro ao processar o arquivo ${filename}:`, error);
          
          // Return an error entry for this specific file, letting other uploads succeed
          results.push({
            id: Math.random().toString(36).substring(2, 11).toUpperCase(),
            filename,
            pagador: 'Dado não disponível no comprovante',
            recebedor: 'Dado não disponível no comprovante',
            cpf_pagador: 'Dado não disponível no comprovante',
            cpf_recebedor: 'Dado não disponível no comprovante',
            banco_origem: 'Dado não disponível no comprovante',
            banco_destino: 'Dado não disponível no comprovante',
            valor: 'Dado não disponível no comprovante',
            data: 'Dado não disponível no comprovante',
            hora: 'Dado não disponível no comprovante',
            transacao_id: 'Dado não disponível no comprovante',
            chave_pix: 'Dado não disponível no comprovante',
            tipo_chave: 'Dado não disponível no comprovante',
            instituicao: 'Dado não disponível no comprovante',
            status: 'Erro de Leitura',
            status_processamento: 'erro',
            mensagem_erro: (error as Error).message || 'Erro deconhecido',
            campos_ausentes: ['todos']
          });
        }
      }

      res.status(200).json(results);
    } catch (globalError) {
      console.error('Erro global na rota de upload:', globalError);
      res.status(500).json({ error: 'Erro interno ao processar arquivos.' });
    }
  }
}
