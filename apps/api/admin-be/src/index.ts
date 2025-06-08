import express from 'express';
import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes';
import stateAdminRoutes from './routes/stateAdminRoutes';
import municipalAdminRoutes from './routes/municipalAdminRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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
    ],
    credentials: true,
  })
);

// Routes
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/state-admin', stateAdminRoutes);
app.use('/api/municipal-admin', municipalAdminRoutes);

// Start server
const PORT = process.env.ADMIN_BE_PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
