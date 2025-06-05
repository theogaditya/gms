import express from 'express';
import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes';
import stateAdminRoutes from './routes/stateAdminRoutes';
import municipalAdminRoutes from './routes/municipalAdminRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3003','http://localhost:3002','http://localhost:3001'  ], 
    credentials: true,
  })
);

app.use('/api/super-admin', superAdminRoutes);
app.use('/api/state-admin', stateAdminRoutes);
app.use('/api/municipal-admin', municipalAdminRoutes);

//Testing Endpoints

const PORT = process.env.ADMIN_BE_PORT || 5000;
app.listen(PORT, () => console.log(`Server Running http://localhost:${PORT}`));
