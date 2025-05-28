import express from 'express';
import dotenv from 'dotenv';
import superAdminRoutes from './routes/superAdminRoutes';
import cookieParser from 'cookie-parser';



dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/super-admin', superAdminRoutes);

const PORT = process.env.ADMIN_BE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
