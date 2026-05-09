import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './src/middleware/error-handler.js';
import authRoutes from './src/routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Optimization
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock Routes Placeholder
app.get('/api/leads', (req, res) => {
  res.json([
    { id: 1, name: "Rahul Sharma", status: "contacted", sentiment: "positive" }
  ]);
});

app.post('/api/calls', (req, res) => {
  console.log('Logging call:', req.body);
  res.status(202).json({ message: 'Call queued for AI summarization', job_id: 'job_492' });
});

// Error Handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 LeadPulse Backend running on http://localhost:${PORT}`);
});
