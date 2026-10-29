import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import farmsRouter from './routes/farms';
import sensorsRouter from './routes/sensors';
import cropHealthRouter from './routes/cropHealth';
import cropAdvisorRouter from './routes/cropAdvisor';
import cropComparisonRouter from './routes/cropComparison';
import weatherRouter from './routes/weather';
import calculatorRouter from './routes/calculator';
import assistantRouter from './routes/assistant';
import imageAnalysisRouter from './routes/imageAnalysis';
import devicesRouter from './routes/devices';
import adminRouter from './routes/admin';
import reportsRouter from './routes/reports';
import { simulationService } from './services/simulationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded crop images
const uploadsPath = path.resolve(process.cwd(), 'server', 'data', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'KisanRakshak AI Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mvp',
  });
});

// Mount API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/farms', farmsRouter);
app.use('/api/v1/sensors', sensorsRouter);
app.use('/api/v1/crop-health', cropHealthRouter);
app.use('/api/v1/crop-advisor', cropAdvisorRouter);
app.use('/api/v1/crop-comparison', cropComparisonRouter);
app.use('/api/v1/weather', weatherRouter);
app.use('/api/v1/calculator', calculatorRouter);
app.use('/api/v1/assistant', assistantRouter);
app.use('/api/v1/image-analysis', imageAnalysisRouter);
app.use('/api/v1/devices', devicesRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/reports', reportsRouter);

// Serve frontend static build if available
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback for client routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start IoT Simulation Service background worker
simulationService.tickSimulation();

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 KisanRakshak AI Full-Stack Server running on port ${PORT}`);
  console.log(`🌾 Frontend & API: http://localhost:${PORT}`);
  console.log(`🌾 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌾 Ingestion API: http://localhost:${PORT}/api/v1/sensors/ingest`);
  console.log(`=======================================================`);
});

export default app;
