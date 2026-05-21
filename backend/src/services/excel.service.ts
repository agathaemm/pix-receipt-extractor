import Workbook from 'exceljs';
import { PixReceipt } from '../types';

export class ExcelService {
  /**
   * Generates a stylized and formatted Excel Workbook from Pix receipts.
   */
  public static async generateExcel(receipts: PixReceipt[]): Promise<Workbook.Workbook> {
    const workbook = new Workbook.Workbook();
    workbook.creator = 'Pix Receipt Extractor';
    workbook.lastModifiedBy = 'Pix Receipt Extractor';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Comprovantes Pix');

    // Define table columns
    worksheet.columns = [
      { header: 'Arquivo', key: 'filename', width: 25 },
      { header: 'Pagador', key: 'pagador', width: 30 },
      { header: 'Data', key: 'data', width: 12 },
      { header: 'Horário', key: 'hora', width: 10 },
      { header: 'Valor', key: 'valor', width: 15 },
      { header: 'ID Transação Pix', key: 'transacao_id', width: 38 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' } // Premium slate-800 color
      };
      cell.font = {
        name: 'Segoe UI',
        bold: true,
        color: { argb: 'FFFFFF' },
        size: 11
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: false
      };
    });

    // Populate data rows
    receipts.forEach((receipt) => {
      // Clean and parse monetary value if possible for actual numerical format in Excel
      let rawVal = receipt.valor.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
      const valNum = parseFloat(rawVal);
      const isNum = !isNaN(valNum);

      const rowData = {
        filename: receipt.filename,
        pagador: receipt.pagador,
        data: receipt.data,
        hora: receipt.hora,
        valor: isNum ? valNum : receipt.valor,
        transacao_id: receipt.transacao_id
      };

      const row = worksheet.addRow(rowData);
      row.height = 22;

      // Formatting cells
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };

        // Borders
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };

        // Center specific columns
        if ([3, 4].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Apply currency format to 'Valor' column
        if (colNumber === 5) {
          if (isNum) {
            cell.numFmt = '"R$"#,##0.00';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          }
        }

        // Detect missing values and style them
        const cellValueStr = String(cell.value || '');
        if (
          cellValueStr.includes('Dado não disponível') ||
          cellValueStr === 'Não informado'
        ) {
          cell.font = {
            name: 'Segoe UI',
            italic: true,
            color: { argb: 'B91C1C' }, // Soft red-700
            size: 9
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FEF2F2' } // Light red-50
          };
        }
      });
    });

    // Auto-adjust column widths based on cell length (subject to minimums)
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const valLen = cell.value ? String(cell.value).length : 0;
        if (valLen > maxLen) {
          maxLen = valLen;
        }
      });
      // Set width to max length plus a buffer, capped at 40
      column.width = Math.min(Math.max(maxLen + 4, column.width || 12), 45);
    });

    return workbook;
  }
}
