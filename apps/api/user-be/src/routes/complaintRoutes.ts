import express, { Request, Response } from 'express';
import { Prisma, PrismaClient } from '../../../../../generated/prisma';
import { jwtAuth } from '../middleware/jwtAuth';
import {
  createComplaintSchema,
  upvoteSchema,
  getComplaintsQuerySchema,
  CreateComplaintInput
} from '../schemas/complaintSchema';
import { z } from 'zod';
import fetch from 'node-fetch';
import WebSocket from 'ws';
import { ComplaintStatus, ComplaintUrgency, ComplaintLocation, Category, User } from '../../../../../generated/prisma';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';
import http from 'http';


dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();



//////new 
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// keep using multer to parse multipart/form-data into req.file
const upload = multer({ storage: multer.memoryStorage() });
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});
///////////


// WebSocket server for real-time upvote updates
let wss: WebSocket.Server | null = null;
const connectedClients = new Map<WebSocket, { id: string; lastPing: number }>();

export const initializeWebSocket = (server: any) => {
  try {
    wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      clientTracking: true,
      perMessageDeflate: false, // Disable compression to reduce overhead
      maxPayload: 1024 * 1024 // 1MB max payload
    });
    
    wss.on('connection', (ws: WebSocket, req) => {
      const clientId = generateClientId();
      const clientIP = req.socket.remoteAddress;
      
      console.log(`[WS] Client ${clientId} connected from ${clientIP}`);
      
      // Store client info
      connectedClients.set(ws, { 
        id: clientId, 
        lastPing: Date.now() 
      });
      
      // Send connection confirmation immediately
      const welcomeMessage = {
        type: 'connection_established',
        clientId: clientId,
        message: 'Connected to upvote updates',
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      };
      
      try {
        ws.send(JSON.stringify(welcomeMessage));
      } catch (error) {
        console.error(`[WS] Failed to send welcome message to ${clientId}:`, error);
      }
      
      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`[WS] Client ${clientId} disconnected. Code: ${code}, Reason: ${reason || 'No reason'}`);
        connectedClients.delete(ws);
      });
      
      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`[WS] Client ${clientId} error:`, error.message);
        connectedClients.delete(ws);
      });
      
      // Handle ping responses (from client)
      ws.on('pong', (data) => {
        const clientInfo = connectedClients.get(ws);
        if (clientInfo) {
          clientInfo.lastPing = Date.now();
          console.log(`[WS] Pong received from ${clientId}`);
        }
      });

      // Handle incoming messages from client
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`[WS] Message from ${clientId}:`, data.type || 'unknown');
          
          // Handle different message types
          switch (data.type) {
            case 'ping':
              // Respond to client ping
              ws.send(JSON.stringify({
                type: 'pong',
                clientId: clientId,
                timestamp: new Date().toISOString(),
                serverTime: Date.now()
              }));
              break;
              
            case 'heartbeat':
              // Update last ping time
              const clientInfo = connectedClients.get(ws);
              if (clientInfo) {
                clientInfo.lastPing = Date.now();
              }
              break;
              
            default:
              console.log(`[WS] Unknown message type from ${clientId}:`, data.type);
          }
        } catch (error) {
          console.error(`[WS] Error parsing message from ${clientId}:`, error);
        }
      });
    });
    
    wss.on('error', (error) => {
      console.error('[WS] WebSocket server error:', error);
    });
    
    // Enhanced heartbeat mechanism
    const heartbeatInterval = setInterval(() => {
      if (!wss) return;
      
      const now = Date.now();
      const staleTimeout = 60000; // 60 seconds
      
      console.log(`[WS] Heartbeat check - ${connectedClients.size} clients connected`);
      
      connectedClients.forEach((clientInfo, ws) => {
        const isStale = (now - clientInfo.lastPing) > staleTimeout;
        
        if (ws.readyState === WebSocket.OPEN) {
          if (isStale) {
            console.log(`[WS] Client ${clientInfo.id} is stale, terminating`);
            ws.terminate();
            connectedClients.delete(ws);
          } else {
            // Send ping to keep connection alive
            try {
              ws.ping();
              console.log(`[WS] Ping sent to ${clientInfo.id}`);
            } catch (error) {
              console.error(`[WS] Failed to ping ${clientInfo.id}:`, error);
              connectedClients.delete(ws);
            }
          }
        } else {
          // Remove dead connections
          console.log(`[WS] Removing dead connection ${clientInfo.id}`);
          connectedClients.delete(ws);
        }
      });
    }, 30000); // Check every 30 seconds
    
    wss.on('close', () => {
      console.log('[WS] WebSocket server closed');
      clearInterval(heartbeatInterval);
      connectedClients.clear();
    });

    console.log('[WS] WebSocket server initialized successfully on /ws path');
    
  } catch (error) {
    console.error('[WS] Failed to initialize WebSocket server:', error);
    throw error;
  }
};

// Generate unique client ID
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const broadcastUpvoteUpdate = (complaintId: string, upvoteCount: number, hasUpvoted: boolean, userId: string) => {
  if (!wss) {
    console.warn('[WS] WebSocket server not initialized');
    return;
  }

  const message = JSON.stringify({
    type: 'upvote_update',
    data: {
      complaintId,
      upvoteCount,
      hasUpvoted,
      userId,
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    }
  });
  
  let sentCount = 0;
  let activeConnections = 0;
  let failedSends = 0;
  
  connectedClients.forEach((clientInfo, client) => {
    activeConnections++;
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error(`[WS] Error sending to ${clientInfo.id}:`, error);
        failedSends++;
        // Remove failed connection
        connectedClients.delete(client);
      }
    }
  });
  
  console.log(`[WS] Upvote broadcast: ${sentCount} sent, ${failedSends} failed, ${activeConnections} total connections (complaint: ${complaintId})`);
};

// AI Model Configuration
const PROJECT_ID = 'orbital-builder-454706-h5';
const LOCATION = 'us-central1';
const ENDPOINT_ID = '2326264238676377600';

export interface AiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text: string }>;
    };
  }>;
}

// auth.ts
import { execSync } from 'child_process';

let cachedToken: string | undefined;

/**
 * Returns a fresh access token, caching it until expiration.
 * If the cached token fails with 401, we’ll clear it and fetch again.
 */
export function getVertexToken(): string {
  if (!cachedToken) {
    // Run this only once (or after invalidation)
    cachedToken = execSync(
      'gcloud auth application-default print-access-token'
    )
      .toString()
      .trim();
  }
  return cachedToken;
}

export function invalidateToken() {
  cachedToken = undefined;
}


// AI standardization function with better error handling
async function standardizeSubCategory(subCategory: string): Promise<string> {

const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}:generateContent`;

  // single attempt with retry-on-401
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = getVertexToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: subCategory }] }],
      }),
    });

    // on 401, clear cache and retry once
    if (res.status === 401 && attempt === 0) {
      console.warn('Vertex AI token expired or unauthorized—refreshing token');
      invalidateToken();
      continue;
    }

    // for other non-2xx, bail out
    if (!res.ok) {
      console.warn(`AI standardization failed (status ${res.status}), using original`);
      return subCategory;
    }

    // parse with correct type
    const data = (await res.json()) as AiGenerateContentResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return text || subCategory;
  }

  // if we got here, even after retry we failed
  return subCategory;

}




////////
// Helper function to get user from JWT token
const getUserFromToken = (req: any): { id: string } | null => {
  try {
    return req.user || null;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// Add this route to your Express app
router.post(
  '/upload',
  upload.single('file'),
  async (req, res): Promise<void> => {
    // 1) guard against no file
    if (!req.file) {
       res.status(400).json({ error: 'No file uploaded.' });
       return
    }
    // console.log('Uploading to bucket:', process.env.R2_BUCKET_NAME);

    // 2) assert non‐null so TS knows it's a File
    const file = req.file;  // after the guard this is definitely an Express.Multer.File

    const key = `complaints/${Date.now()}_${file.originalname}`;
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3.send(cmd);
       res.status(200).json({
        message: 'Upload successful',
        url: `${process.env.R2_PUBLIC_URL}/${key}`,
      });
    } catch (err) {
      console.error('S3 upload error:', err);
       res.status(500).json({ error: 'Upload failed' });
      return;

    }
  }
);

// POST /api/complaints/newcomplaint - Create a new complaint
router.post('/newcomplaint', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from JWT middleware
    const user = getUserFromToken(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Validate request body
    const validatedData = createComplaintSchema.parse(req.body);

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true }
    });

    if (!userExists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Find category by name (case-insensitive search)
    const category = await prisma.category.findFirst({
      where: { 
        name: {
          equals: validatedData.categoryName,
          mode: 'insensitive'
        }
      },
      select: { 
        id: true, 
        name: true, 
        assignedDepartment: true,
        subCategories: true,
        learnedSubCategories: true
      }
    });

    if (!category) {
      const availableCategories = await prisma.category.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
      });

      res.status(400).json({ 
        error: `Category '${validatedData.categoryName}' not found. Please check the category name and try again.`,
        availableCategories: availableCategories.map(cat => cat.name)
      });
      return;
    }

    // Standardize subcategory using AI (with fallback)
    const standardizedSubCategory = await standardizeSubCategory(validatedData.subCategory);

    // Create complaint with transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the complaint
      const complaint = await tx.complaint.create({
        data: {
          complainantId: user.id,
          categoryId: category.id,
          subCategory: validatedData.subCategory,
          standardizedSubCategory,
          description: validatedData.description,
          urgency: validatedData.urgency,
          assignedDepartment: category.assignedDepartment,
          isPublic: validatedData.isPublic,
          attachmentUrl: validatedData.attachmentUrl??null,
location: {
  create: {
    pin: validatedData.location.pin,
    district: validatedData.location.district,
    city: validatedData.location.city,
    locality: validatedData.location.locality ,
    street: validatedData.location.street ,
    latitude: validatedData.location.latitude?? null,
    longitude: validatedData.location.longitude?? null
  }
}
        },
        include: {
          location: true,
          category: {
            select: { name: true, assignedDepartment: true }
          },
          complainant: {
            select: { name: true, email: true }
          }
        }
      });

      // Update category with new subcategory entries
      const updatedSubCategories = Array.from(new Set([
        ...category.subCategories,
        validatedData.subCategory
      ]));
      
      const updatedLearnedSubCategories = Array.from(new Set([
        ...category.learnedSubCategories,
        standardizedSubCategory
      ]));

      await tx.category.update({
        where: { id: category.id },
        data: {
          subCategories: updatedSubCategories,
          learnedSubCategories: updatedLearnedSubCategories
        }
      });

      return complaint;
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: {
        id: result.id,
        seq: result.seq,
        submissionDate: result.submissionDate,
        category: result.category.name,
        subCategory: result.subCategory,
        standardizedSubCategory: result.standardizedSubCategory,
        description: result.description,
        urgency: result.urgency,
        status: result.status,
        assignedDepartment: result.assignedDepartment,
        isPublic: result.isPublic,
        location: result.location,
        upvoteCount: result.upvoteCount,
        complainant: {
          name: result.complainant.name
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

console.error('Error creating complaint:', error);
console.error('Error details:', JSON.stringify(error, null, 2));
res.status(500).json({ 
  error: 'Failed to submit complaint. Please try again.',
});
  }
});

// GET /api/complaints - Get all complaints with filtering and sorting
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse and validate query parameters
    const {
      page = '1',
      limit = '10',
      categoryName,
      status,
      urgency,
      isPublic,
      district,
      city,
      sortBy = 'recent',
      forYou = 'false'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {
      // Only show public complaints for general listing
      isPublic: isPublic === 'false' ? false : true
    };

    // Add filters
    if (categoryName) {
      const category = await prisma.category.findFirst({
        where: { 
          name: { equals: categoryName as string, mode: 'insensitive' } 
        },
        select: { id: true }
      });
      if (category) {
        whereClause.categoryId = category.id;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    if (urgency) {
      whereClause.urgency = urgency;
    }

    if (district) {
      whereClause.location = {
        district: { equals: district as string, mode: 'insensitive' }
      };
    }

    if (city) {
      whereClause.location = {
        ...whereClause.location,
        city: { equals: city as string, mode: 'insensitive' }
      };
    }

  //   if (!complaint.location) {
  //     return res.status(500).json({ error: 'Location data is missing for this complaint' });
  //  }

    // Handle "For You" filter - requires authentication
    let userDistrict = null;
    const authHeader = req.headers.authorization;
// In GET /api/complaints route
// Handle "For You" filter - requires authentication
if (forYou === 'true') {
  const token = req.cookies?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      // Get user's profile location
      const userWithLocation = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { 
          location: true 
        }
      });

      if (userWithLocation?.location) {
        // Merge with existing location conditions instead of overwriting
        whereClause.location = {
          ...whereClause.location,
          district: { equals: userWithLocation.location.district, mode: 'insensitive' },
          city: { equals: userWithLocation.location.city, mode: 'insensitive' }
        };
      }
    } catch (error) {
      console.warn('Could not authenticate user for "For You" filter:', error);
    }
  }
}
    // Build order clause
    let orderBy: any = { submissionDate: 'desc' }; // Default: recent

    switch (sortBy) {
      case 'upvotes':
        orderBy = { upvoteCount: 'desc' };
        break;
      case 'urgent':
        orderBy = [
          { urgency: 'desc' }, // HIGH first, then MEDIUM, then LOW
          { submissionDate: 'desc' }
        ];
        break;
      case 'recent':
      default:
        orderBy = { submissionDate: 'desc' };
        break;
    }

    // Get complaints with all required data
    const [complaints, totalCount] = await Promise.all([
      prisma.complaint.findMany({
        where: whereClause,
        select: {
          id: true,
          seq: true,
          submissionDate: true,
          subCategory: true,
          description: true,
          status: true,
          urgency: true,
          upvoteCount: true,
          attachmentUrl: true,
          complainant: {
            select: {
              name: true
            }
          },
          category: {
            select: {
              name: true
            }
          },
          location: {
            select: {
              district: true,
              city: true,
              pin: true,
              locality: true,
              street: true,
              latitude: true,
              longitude: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limitNum
      }),
      prisma.complaint.count({ where: whereClause })
    ]);
    if (!complaints) {
      res.status(404).json({ error: 'No complaints found' });
      return;
    }
    if (!complaints.length) {
      res.status(404).json({ error: 'No complaints found matching the criteria' });
      return;
    }
    
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      complaints: complaints.map(complaint => ({
        id: complaint.id,
        seq: complaint.seq,
        name: complaint.complainant.name,
        category: complaint.category.name,
        subCategory: complaint.subCategory,
        district: complaint.location?.district,
        city: complaint.location?.city,
        pin: complaint.location?.pin,
        photo: complaint.attachmentUrl,
        upvotes: complaint.upvoteCount,
        dateOfPost: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        description: complaint.description.length > 100 
          ? complaint.description.substring(0, 100) + '...' 
          : complaint.description
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        appliedDistrict: district || userDistrict,
        sortBy,
        forYou: forYou === 'true'
      }
    });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET /api/complaints/:id - Get single complaint with full details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid complaint ID format' });
      return;
    }

    // Get complaint with full details
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        seq: true,
        submissionDate: true,
        subCategory: true,
        description: true,
        status: true,
        urgency: true,
        upvoteCount: true,
        attachmentUrl: true,
        isPublic: true,
        complainant: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        location: {
          select: {
            district: true,
            city: true,
            pin: true,
            locality: true,
            street: true,
            latitude: true,
            longitude: true
          }
        }
      }
    });

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    if (!complaint.location) {
       res.status(500).json({ error: 'Location data is missing for this complaint' });
       return; 
   }

    // Check if user has upvoted (if authenticated)
    let hasUpvoted = false;
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        
        const upvote = await prisma.upvote.findUnique({
          where: {
            userId_complaintId: {
              userId: decoded.id,
              complaintId: id
            }
          }
        });
        hasUpvoted = !!upvote;
      } catch (error) {
        // Token invalid, continue without upvote status
      }
    }

    res.json({
      complaint: {
        id: complaint.id,
        seq: complaint.seq,
        name: complaint.complainant.name,
        category: complaint.category.name,
        subCategory: complaint.subCategory,
        description: complaint.description,
        location: {
          district: complaint.location.district,
          city: complaint.location.city,
          pin: complaint.location.pin,
          locality: complaint.location.locality,
          street: complaint.location.street,
          latitude: complaint.location.latitude,
          longitude: complaint.location.longitude,
          // For Google Maps
          coordinates: complaint.location.latitude && complaint.location.longitude 
            ? {
                lat: complaint.location.latitude,
                lng: complaint.location.longitude
              }
            : null
        },
        photo: complaint.attachmentUrl,
        upvotes: complaint.upvoteCount,
        hasUpvoted,
        dateOfPost: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        isPublic: complaint.isPublic,
        // Share data
        shareData: {
          subCategory: complaint.subCategory,
          image: complaint.attachmentUrl,
          district: complaint.location.district,
          url: `${req.protocol}://${req.get('host')}/complaints/${id}`
        }
      }
    });

  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
});

// GET /api/complaints/user/:userId - Get user's complaints (improved)
router.get('/user/:userId', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUser = getUserFromToken(req);

    if (!requestingUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Users can only view their own complaints unless they're admin
    // For now, allow only self-access
    if (requestingUser.id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user's complaints
    const complaints = await prisma.complaint.findMany({
      where: { complainantId: userId },
      select: {
        id: true,
        seq: true,
        submissionDate: true,
        subCategory: true,
        description: true,
        status: true,
        urgency: true,
        upvoteCount: true,
        attachmentUrl: true,
        isPublic: true,
        category: {
          select: { name: true }
        },
        location: {
          select: {
            district: true,
            city: true,
            pin: true
          }
        }
      },
      orderBy: { submissionDate: 'desc' }
    });

    const complaintCount = complaints.length;
    if (!complaints) {
      res.status(404).json({ error: 'No complaints found for this user' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      complaints: complaints.map(complaint => ({
        id: complaint.id,
        seq: complaint.seq,
        category: complaint.category.name,
        subCategory: complaint.subCategory,
        description: complaint.description.length > 100 
          ? complaint.description.substring(0, 100) + '...' 
          : complaint.description,
        district: complaint.location?.district,
        city: complaint.location?.city,
        pin: complaint.location?.pin,
        photo: complaint.attachmentUrl,
        upvotes: complaint.upvoteCount,
        dateOfPost: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        isPublic: complaint.isPublic
      })),
      totalComplaints: complaintCount
    });

  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// GET /api/complaints/categories - Get all available categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        assignedDepartment: true,
        subCategories: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        assignedDepartment: cat.assignedDepartment,
        subCategories: cat.subCategories
      }))
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/complaints/:id/upvote - Toggle upvote with enhanced error handling
router.post('/:id/upvote', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = getUserFromToken(req);

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid complaint ID format' });
      return;
    }

    // Check if complaint exists and is public
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      select: { 
        id: true, 
        isPublic: true,
        complainantId: true
      }
    });

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }


    if (!complaint.isPublic) {
      res.status(403).json({ error: 'Cannot upvote private complaints' });
      return;
    }

    // Prevent self-upvoting
    if (complaint.complainantId === user.id) {
      res.status(403).json({ error: 'Cannot upvote your own complaint' });
      return;
    }

    // Check if user already upvoted
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        userId_complaintId: {
          userId: user.id,
          complaintId: id
        }
      }
    });

    let action: string;
    let newUpvoteCount: number;
    let hasUpvoted: boolean;

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx: any) => {
      if (existingUpvote) {
        // Remove upvote
        await tx.upvote.delete({
          where: { id: existingUpvote.id }
        });
        action = 'removed';
        hasUpvoted = false;
      } else {
        // Add upvote
        await tx.upvote.create({
          data: {
            userId: user.id,
            complaintId: id
          }
        });
        action = 'added';
        hasUpvoted = true;
      }

      // Get updated upvote count
      const upvoteCount = await tx.upvote.count({
        where: { complaintId: id }
      });

      // Update complaint upvote count for faster queries
      await tx.complaint.update({
        where: { id },
        data: { upvoteCount }
      });

      return { action, hasUpvoted, upvoteCount };
    });

    // Broadcast upvote update via WebSocket
    broadcastUpvoteUpdate(id, result.upvoteCount, result.hasUpvoted, user.id);

    res.json({
      message: `Upvote ${result.action}`,
      upvoteCount: result.upvoteCount,
      hasUpvoted: result.hasUpvoted
    });

  } catch (error) {
    console.error('Error toggling upvote:', error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
});

// GET /api/complaints/:id/upvotes - Get upvote status
router.get('/:id/upvotes', jwtAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = getUserFromToken(req);

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid complaint ID format' });
      return;
    }

    // Get upvote count and user's upvote status
    const [upvoteCount, userUpvote] = await Promise.all([
      prisma.upvote.count({
        where: { complaintId: id }
      }),
      prisma.upvote.findUnique({
        where: {
          userId_complaintId: {
            userId: user.id,
            complaintId: id
          }
        }
      })
    ]);

    res.json({
      upvoteCount,
      hasUpvoted: !!userUpvote
    });

  } catch (error) {
    console.error('Error fetching upvote status:', error);
    res.status(500).json({ error: 'Failed to fetch upvote status' });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

export default router;
