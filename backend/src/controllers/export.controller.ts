import { Request, Response } from 'express';
import { ExcelService } from '../services/excel.service';
import { PixReceipt } from '../types';

export class ExportController {
  /**
   * Generates and streams an Excel file containing the provided receipts.
   */
  public static async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const receipts = req.body as PixReceipt[];

      if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
        res.status(400).json({ error: 'Nenhum dado fornecido para exportação.' });
        return;
      }

      // Generate Workbook
      const workbook = await ExcelService.generateExcel(receipts);

      // Setup response headers for file download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=comprovantes_pix.xlsx'
      );

      // Write directly to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Erro ao gerar exportação de Excel:', error);
      res.status(500).json({ error: 'Erro ao gerar planilha Excel.' });
    }
  }
}
