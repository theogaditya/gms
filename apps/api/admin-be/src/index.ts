import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes';
import stateAdminRoutes from './routes/stateAdminRoutes';
import municipalAdminRoutes from './routes/municipalAdminRoutes';
import agentRoutes from './routes/agent';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// 🌐 Dynamic .env file loading
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.local';
dotenv.config({ path: envFile });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'https://admin-swarajdesk.adityahota.online'
    ],
    credentials: true,
  })
);

// Routes
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/state-admin', stateAdminRoutes);
app.use('/api/municipal-admin', municipalAdminRoutes);
app.use('/api/agent', agentRoutes);

// Start server
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


const PORT = process.env.ADMIN_BE_PORT

// Initialize WebSocket after server creation but before listening

app.listen(PORT, () => {
  console.log(`HTTP server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
