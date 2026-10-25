// FinPredict.js - Institutional FP&A MongoDB & Express API Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import forecastRoutes from './routes/forecast.routes.js';
import simplexRoutes from './routes/simplex.routes.js';
import reportRoutes from './routes/reports.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 2. Health & Telemetry Probe
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'FinPredict FP&A MongoDB Server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    features: ['MongoDB Mongoose v8', 'Role-Based Access Control', 'SOX 404 / FINRA 4511 Audit Trail']
  });
});

// 3. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/simplex', simplexRoutes);
app.use('/api/reports', reportRoutes);

// 4. Global 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// 5. Connect Database and Start Server
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 [FinPredict Server] Running on http://localhost:${PORT}`);
    console.log(`📡 [FinPredict Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 [FinPredict Server] Client CORS authorized for: ${CLIENT_URL}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup failure:', err);
  process.exit(1);
});

export default app;
