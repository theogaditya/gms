import express from 'express';
import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3003'], 
    credentials: true,
  })
);

app.use('/api/super-admin', superAdminRoutes);

const PORT = process.env.ADMIN_BE_PORT || 5000;
app.listen(PORT, () => console.log(`Server Running http://localhost:${PORT}`));
