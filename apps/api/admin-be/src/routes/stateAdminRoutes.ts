import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

router.post('/login', async (req, res:any) => {
  const { officialEmail, password } = req.body;

  const admin = await prisma.departmentStateAdmin.findUnique({ where: { officialEmail } });

  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.officialEmail,
      accessLevel: admin.accessLevel
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set cookie options
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // secure only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in 
  });

  return res.json({ success: true, message: 'Logged in successfully' });
});

export default router;
