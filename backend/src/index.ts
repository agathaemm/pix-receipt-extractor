import * as dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 SERVIDOR PIX RECEIPT EXTRACTOR RODANDO NA PORTA ${PORT}`);
  console.log(`   Healthcheck: http://localhost:${PORT}/health`);
  console.log(`===================================================`);
});
