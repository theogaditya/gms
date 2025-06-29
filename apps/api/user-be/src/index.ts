import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.prod' : '.env.local';

dotenv.config({ path: envFile });  
console.log('Loaded:', envFile, 'NODE_ENV=', process.env.NODE_ENV);

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import complatintRoutes from './routes/complaintRoutes';
import userRoutes from './routes/userRoutes';
import { jwtAuth } from './middleware/jwtAuth';
import { PrismaClient } from "@prisma/client";
import { initializeWebSocket } from './routes/complaintRoutes';
import http from 'http';
import WebSocket from 'ws';
import aigenRoutes from './routes/aigenRoutes';


const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);

// Middleware 
//'http://localhost:3000', 'http://localhost:3002', 'https://swarajnew.adityahota.online'
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3002','https://swarajnew.adityahota.online'],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complatintRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aigenRoutes);
app.get('/', (req,res)=>{ res.json('Hello World')})

// Protected route for testing jwtAuth
app.get('/api/protected', jwtAuth, async (req, res:any) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Protected route accessed', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


const PORT = process.env.PORT

// Initialize WebSocket after server creation but before listening
try {
  initializeWebSocket(server);
  console.log('WebSocket server initialized successfully');
} catch (error) {
  console.error('Failed to initialize WebSocket server:', error);
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`HTTP server listening on http://localhost:${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});
