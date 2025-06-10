import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../../../../../generated/prisma';
import { agentSchema } from '../schemas/agentSchema';

const prisma = new PrismaClient();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

// Login
router.post('/login', async (req, res: any) => {
  const { officialEmail, password } = req.body;

  const admin = await prisma.departmentMunicipalAdmin.findUnique({ where: { officialEmail } });

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
      accessLevel: admin.accessLevel,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.json({
    success: true,
    admin: {
      id: admin.id,
      officialEmail: admin.officialEmail,
      accessLevel: admin.accessLevel,
    },
  });
});


// Create Agent
router.post('/create/agent', async (req, res: any) => {
  const parse = agentSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ 
      message: 'Invalid input', 
      errors: parse.error.errors 
    });
  }

  const {
    email, fullName, password,
    phoneNumber, officialEmail, department,
    municipality
  } = parse.data;

  try {
    const existingAgent = await prisma.agent.findFirst({
      where: {
        OR: [
          { email },
          { officialEmail },
        ]
      }
    });

    if (existingAgent) {
      return res.status(409).json({ 
        message: 'Agent with this email, official email, or employee ID already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const agent = await prisma.agent.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        phoneNumber,
        officialEmail,
        department,
        municipality,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        employeeId: true,
        phoneNumber: true,
        officialEmail: true,
        department: true,
        municipality: true,
        accessLevel: true,
        dateOfCreation: true,
        status: true,
      }
    });

    res.status(201).json({ 
      message: 'Agent created successfully', 
      agent 
    });
  } catch (err: any) {
    console.error('Agent creation error:', err);
    
    if (err.code === 'P2002') {
      return res.status(409).json({ 
        message: 'Agent with this email, official email, or employee ID already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Agent registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ----- 9. Get All Complaints -----
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        category: true,
        complainant: true 
      },
      orderBy: {
        submissionDate: 'desc' 
      }
    });

    res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});


export default router;
