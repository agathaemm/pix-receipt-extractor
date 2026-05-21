import pdfParse from 'pdf-parse';

export class PdfService {
  /**
   * Extracts raw text from a PDF buffer.
   */
  public static async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      
      if (!data || !data.text || data.text.trim().length === 0) {
        throw new Error('O PDF está vazio ou é um PDF escaneado (sem camada de texto digital).');
      }

      return data.text;
    } catch (error) {
      console.error('Erro na extração de texto do PDF:', error);
      throw new Error(`Falha na extração do PDF: ${(error as Error).message}`);
    }
  }
}
