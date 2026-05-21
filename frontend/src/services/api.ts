import axios from 'axios';
import { PixReceipt } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for processing large batches
});

export const api = {
  /**
   * Uploads files to the backend and tracks upload progress.
   */
  uploadReceipts: async (
    files: File[],
    onProgress: (percent: number) => void
  ): Promise<PixReceipt[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<PixReceipt[]>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Sends the (possibly edited) receipts to be compiled into an Excel spreadsheet,
   * then triggers a browser download.
   */
  exportToExcel: async (receipts: PixReceipt[]): Promise<void> => {
    const response = await apiClient.post('/api/export', receipts, {
      responseType: 'blob', // Expect binary file response
    });

    // Create a client-side URL for the downloaded blob and trigger a download click
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `comprovantes_pix_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
export default api;
