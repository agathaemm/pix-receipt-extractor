import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

export class OcrService {
  /**
   * Preprocesses an image buffer using sharp to maximize Tesseract OCR readability.
   */
  private static async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize({ width: 2000, fit: 'inside', withoutEnlargement: false })
        .greyscale()
        .normalize() // Enhances contrast
        .sharpen() // Sharpens edges
        .png() // Convert to lossless PNG for better OCR
        .toBuffer();
    } catch (error) {
      console.error('Erro no pré-processamento da imagem com Sharp:', error);
      return buffer; // Fallback to raw buffer if preprocessing fails
    }
  }

  /**
   * Runs OCR on an image buffer (supports png, jpeg, jpg).
   */
  public static async extractTextFromImage(buffer: Buffer): Promise<string> {
    let worker;
    try {
      // 1. Preprocess the image to improve text sharpness
      const processedBuffer = await this.preprocessImage(buffer);

      // 2. Initialize Tesseract worker with Portuguese and English fallback
      worker = await createWorker('por+eng');

      // 3. Recognize text
      const { data: { text } } = await worker.recognize(processedBuffer);
      
      return text;
    } catch (error) {
      console.error('Erro durante a execução do OCR com Tesseract:', error);
      throw new Error(`Falha no OCR: ${(error as Error).message}`);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }
}
