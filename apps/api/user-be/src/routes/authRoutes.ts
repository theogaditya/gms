import { Router, Request, Response } from 'express';
import { PrismaClient } from '../../../../../generated/prisma'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signupSchema, signinSchema } from '../schemas/authSchema';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Signup route
router.post('/signup', async (req, res: any) => {
  try {
    const { email, phoneNumber, name, password } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone number already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        name,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign(
        { id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(201).json({ message: 'User created', user: { id: user.id, email, name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// Signin route
router.post('/signin', async (req, res:any) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: 'Signed in', user: { id: user.id, email, name: user.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;