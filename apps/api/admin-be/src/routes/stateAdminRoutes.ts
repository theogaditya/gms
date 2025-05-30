import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

router.post('/signin', async (req, res:any) => {
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

  return res.json({ success: true, token });
});

export default router;
