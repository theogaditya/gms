// userRoutes.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { jwtAuth } from '../middleware/jwtAuth';

const router = express.Router();
const prisma = new PrismaClient();

  const getUserFromToken = (req: any): { id: string } | null => {
    try {
      return req.user || null;
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  };

// GET /api/user/:id - Get user info including location
router.get('/:id', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authenticatedUser = getUserFromToken(req);

    // Authentication and authorization check
    if (!authenticatedUser || authenticatedUser.id !== id) {
       res.status(403).json({ error: 'Unauthorized access' });
       return
    }

    // Fetch user with location
    const user = await prisma.user.findUnique({
      where: { id },
      include: { location: true }
    });

    if (!user || user.status === 'DELETED') {
       res.status(404).json({ error: 'User not found' });
       return
    }

    // Omit sensitive fields from response
    const { password, ...safeUser } = user;

    res.json({
      user: safeUser,
      location: user.location
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// GET /api/user/:id/complaints - Get user's complaints
router.get('/:id/complaints', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authenticatedUser = getUserFromToken(req);

    // Authentication and authorization check
    if (!authenticatedUser || authenticatedUser.id !== id) {
       res.status(403).json({ error: 'Unauthorized access' });
        return;
    }

    // Fetch user's complaints with detailed information
    const complaints = await prisma.complaint.findMany({
      where: { 
        complainantId: id,
        complainant: { status: 'ACTIVE' } 
      },
      include: {
        category: { select: { name: true } },
        location: true
      },
      orderBy: { submissionDate: 'desc' }
    });

    res.json({
      complaints: complaints.map(complaint => ({
        id: complaint.id,
        seq: complaint.seq,
        submissionDate: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        category: complaint.category.name,
        subCategory: complaint.subCategory,
        description: complaint.description,
        upvoteCount: complaint.upvoteCount,
        location: complaint.location,
        attachmentUrl: complaint.attachmentUrl
      }))
    });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// PATCH /api/user/:id/status - Delete user account (soft delete)
router.patch('/:id/status', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authenticatedUser = getUserFromToken(req);

    // Authentication and authorization check
    if (!authenticatedUser || authenticatedUser.id !== id) {
       res.status(403).json({ error: 'Unauthorized access' });
       return
    }

    // Soft delete the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'DELETED' }
    });

    // Clear authentication token
    res.clearCookie('token');

    res.json({ 
      message: 'Account deleted successfully',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;