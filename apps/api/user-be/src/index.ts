import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import { jwtAuth } from './middleware/jwtAuth';
import { PrismaClient } from '../../../../generated/prisma';

const app = express();
const prisma = new PrismaClient();

// Middleware 
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'], 
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});