import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../../../../generated/prisma';
import { loginSchema } from '../schemas/agentSchema';
import { authenticateAgent } from '../middleware/adminAuth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET= process.env.JWT_SECRET!;

// Agent Login
router.post('/login', async (req, res: any) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ 
      message: 'Invalid input', 
      errors: parse.error.errors 
    });
  }

  const { officialEmail, password } = parse.data;

  try {
    const agent = await prisma.agent.findFirst({
      where: {
        officialEmail,
        status: 'ACTIVE' 
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        employeeId: true,
        password: true,
        phoneNumber: true,
        officialEmail: true,
        department: true,
        municipality: true,
        accessLevel: true,
        status: true,
        workloadLimit: true,
        currentWorkload: true,
        availabilityStatus: true,
        dateOfCreation: true,
        lastLogin: true,
      }
    });

    if (!agent) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    await prisma.agent.update({
      where: { id: agent.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: agent.id, 
        officialEmail: agent.officialEmail,
        accessLevel: agent.accessLevel,
        department: agent.department,
        type: 'AGENT'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...agentData } = agent;

    // Set HTTP-only cookie
    res.cookie('agentToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({
      message: 'Login successful',
      agent: agentData,
      token // Also send token in response body if needed
    });

  } catch (err: any) {
    console.error('Agent login error:', err);
    res.status(500).json({ 
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Verify Token / Get Current Agent
router.get('/me', async (req, res: any) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (decoded.type !== 'AGENT') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agent = await prisma.agent.findUnique({
      where: { 
        id: decoded.id,
        status: 'ACTIVE'
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
        status: true,
        workloadLimit: true,
        currentWorkload: true,
        availabilityStatus: true,
        dateOfCreation: true,
        lastLogin: true,
        resolutionRate: true,
        avgResolutionTime: true,
        collaborationMetric: true,
      }
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({ agent });

  } catch (err: any) {
    console.error('Token verification error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Token verification failed' });
  }
});

// ----- 3. Get All Complaints -----
router.get('/complaints',authenticateAgent, async (req, res:any) => {
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

    return res.json({ success: true, complaints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
  }
});

export default router;