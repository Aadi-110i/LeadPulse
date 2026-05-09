import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🚀 LeadPulse Backend running on http://localhost:${PORT}`);
});
