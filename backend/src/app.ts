import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { UploadController } from './controllers/upload.controller';
import { ExportController } from './controllers/export.controller';

const app = express();

// Enable CORS for frontend communication
app.use(cors({
  origin: '*', // Allow all for convenience, restrict in direct prod setups if necessary
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set larger payload limits for bulk JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer memory storage configuration (keeps files in buffer for direct processing)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit per file
    files: 50 // Limit batch to 50 files
  }
});

// App Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
// Upload route - expects a key 'files' containing multiple files
app.post('/api/upload', upload.array('files', 50), UploadController.uploadReceipts);

// Export route - receives parsed receipts JSON and outputs .xlsx file download
app.post('/api/export', ExportController.exportToExcel);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro global não tratado:', err);
  res.status(500).json({
    error: 'Ocorreu um erro no servidor.',
    details: err.message || err
  });
});

export default app;
