import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateSuperAdmin } from '../middleware/superAdminAuth';
import {
  createSuperAdminSchema,
  superAdminLoginSchema,
  createStateAdminSchema,
  createMunicipalAdminSchema
} from '../schemas/superAdminSchema';
import { PrismaClient } from '../../../../../generated/prisma';

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// ----- 1. Super Admin Login -----
router.post('/login', async (req, res: any) => {
  const parseResult = superAdminLoginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.flatten() });
  }

  const { officialEmail, password } = parseResult.data;

  try {
    const admin = await prisma.superAdmin.findUnique({
      where: { officialEmail }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.superAdmin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { id: admin.id, email: admin.officialEmail }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Set secure cookie for NextJS
    res.cookie('superAdminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return res.json({ 
      success: true, 
      message: 'Login successful',
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        officialEmail: admin.officialEmail,
        accessLevel: admin.accessLevel
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 2. Super Admin Logout -----
router.post('/logout', (req, res: any) => {
  res.clearCookie('superAdminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ----- 3. Create Super Admin -----
router.post('/create', async (req, res: any) => {
  const parseResult = createSuperAdminSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    // Check if super admin already exists
    const existing = await prisma.superAdmin.findFirst({
      where: {
        OR: [
          { officialEmail: data.officialEmail },
        ]
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Super Admin with given email or ID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newSuperAdmin = await prisma.superAdmin.create({
      data: {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Super Admin created successfully',
      data: {
        id: newSuperAdmin.id,
        fullName: newSuperAdmin.fullName,
        adminId: newSuperAdmin.adminId,
        officialEmail: newSuperAdmin.officialEmail,
        accessLevel: newSuperAdmin.accessLevel,
        dateOfCreation: newSuperAdmin.dateOfCreation
      }
    });

  } catch (error) {
    console.error('Create Super Admin Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 4. Get Current Super Admin Profile -----
router.get('/profile', authenticateSuperAdmin, async (req, res: any) => {
  try {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: req.superAdmin!.id },
      select: {
        id: true,
        fullName: true,
        adminId: true,
        officialEmail: true,
        phoneNumber: true,
        accessLevel: true,
        dateOfCreation: true,
        lastUpdated: true,
        status: true,
        lastLogin: true
      }
    });

    if (!superAdmin) {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }

    return res.json({ success: true, superAdmin });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 5. Create State Admin -----
router.post('/create/state-admins', authenticateSuperAdmin, async (req, res: any) => {
  const parseResult = createStateAdminSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    const existing = await prisma.departmentStateAdmin.findFirst({
      where: {
        OR: [
          { officialEmail: data.officialEmail },
        ]
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Admin with given email or ID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newAdmin = await prisma.departmentStateAdmin.create({
      data: {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        department: data.department,
        state: data.state,
        managedMunicipalities: data.managedMunicipalities || []
      }
    });

    return res.status(201).json({
      success: true,
      message: 'State Department Admin created successfully',
      data: {
        id: newAdmin.id,
        fullName: newAdmin.fullName,
        officialEmail: newAdmin.officialEmail,
        state: newAdmin.state,
        department: newAdmin.department,
        managedMunicipalities: newAdmin.managedMunicipalities
      }
    });

  } catch (error) {
    console.error('Create State Admin Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 6. Create Municipal Admin -----
router.post('/create/municipal-admins', authenticateSuperAdmin, async (req, res: any) => {
  const parseResult = createMunicipalAdminSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    const existing = await prisma.departmentMunicipalAdmin.findFirst({
      where: {
        OR: [
          { officialEmail: data.officialEmail },
        ]
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Admin with given email or ID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newAdmin = await prisma.departmentMunicipalAdmin.create({
      data: {
        fullName: data.fullName,
        officialEmail: data.officialEmail,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        department: data.department,
        municipality: data.municipality,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Municipal Department Admin created successfully',
      data: {
        id: newAdmin.id,
        fullName: newAdmin.fullName,
        officialEmail: newAdmin.officialEmail,
        department: newAdmin.department,
        municipality: newAdmin.municipality
      }
    });
  } catch (error) {
    console.error('Create Municipal Admin Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 7. Get All State Admins -----
router.get('/state-admins', authenticateSuperAdmin, async (req, res: any) => {
  try {
    const stateAdmins = await prisma.departmentStateAdmin.findMany({
      select: {
        id: true,
        fullName: true,
        adminId: true,
        officialEmail: true,
        department: true,
        state: true,
        status: true,
        dateOfCreation: true,
        lastLogin: true,
        managedMunicipalities: true
      },
      orderBy: { dateOfCreation: 'desc' }
    });

    return res.json({ success: true, data: stateAdmins });
  } catch (error) {
    console.error('Get State Admins Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ----- 8. Get All Municipal Admins -----
router.get('/municipal-admins', authenticateSuperAdmin, async (req, res: any) => {
  try {
    const municipalAdmins = await prisma.departmentMunicipalAdmin.findMany({
      select: {
        id: true,
        fullName: true,
        adminId: true,
        officialEmail: true,
        department: true,
        municipality: true,
        status: true,
        dateOfCreation: true,
        lastLogin: true,
        currentWorkload: true,
        workloadLimit: true
      },
      orderBy: { dateOfCreation: 'desc' }
    });

    return res.json({ success: true, data: municipalAdmins });
  } catch (error) {
    console.error('Get Municipal Admins Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;