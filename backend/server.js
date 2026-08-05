import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { connectDB, seedMockReportsIfEmpty } from './services/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Job Shield Backend' });
});

// Main startup block
const startServer = async () => {
  await connectDB(process.env.MONGODB_URI);
  await seedMockReportsIfEmpty();
  
  app.listen(PORT, () => {
    console.log(`🚀 AI Job Shield server running on port ${PORT}`);
  });
};

startServer();
