import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { jwtAuth } from "../middleware/jwtAuth";
import {
  createComplaintSchema,
  upvoteSchema,
  getComplaintsQuerySchema,
  CreateComplaintInput,
} from "../schemas/complaintSchema";
import { z } from "zod";
import WebSocket from "ws";
// import {
//   ComplaintStatus,
//   ComplaintUrgency,
// } from "@";
import dotenv from "dotenv";
const { VertexAI } = require("@google-cloud/vertexai"); //vertexai
import { sendComplaintConfirmationEmail } from "../utils/mailer";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

//r2
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

// WebSocket server for real-time upvote updates
let wss: WebSocket.Server | null = null;
const connectedClients = new Map<WebSocket, { id: string; lastPing: number }>();

export const initializeWebSocket = (server: any) => {
  try {
    wss = new WebSocket.Server({
      server,
      path: "/ws",
      clientTracking: true,
      perMessageDeflate: false,
      maxPayload: 1024 * 1024,
    });

    wss.on("connection", (ws: WebSocket, req) => {
      const clientId = generateClientId();
      const clientIP = req.socket.remoteAddress;

      console.log(`[WS] Client ${clientId} connected from ${clientIP}`);

      connectedClients.set(ws, {
        id: clientId,
        lastPing: Date.now(),
      });

      const welcomeMessage = {
        type: "connection_established",
        clientId: clientId,
        message: "Connected to upvote updates",
        timestamp: new Date().toISOString(),
        serverTime: Date.now(),
      };

      try {
        ws.send(JSON.stringify(welcomeMessage));
      } catch (error) {
        console.error(
          `[WS] Failed to send welcome message to ${clientId}:`,
          error
        );
      }

      ws.on("close", (code, reason) => {
        console.log(
          `[WS] Client ${clientId} disconnected. Code: ${code}, Reason: ${reason || "No reason"}`
        );
        connectedClients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error(`[WS] Client ${clientId} error:`, error.message);
        connectedClients.delete(ws);
      });

      ws.on("pong", () => {
        const clientInfo = connectedClients.get(ws);
        if (clientInfo) {
          clientInfo.lastPing = Date.now();
          console.log(`[WS] Pong received from ${clientId}`);
        }
      });

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());

          switch (data.type) {
            case "ping":
              ws.send(
                JSON.stringify({
                  type: "pong",
                  clientId: clientId,
                  timestamp: new Date().toISOString(),
                  serverTime: Date.now(),
                })
              );
              break;

            case "heartbeat":
              const clientInfo = connectedClients.get(ws);
              if (clientInfo) clientInfo.lastPing = Date.now();
              break;
          }
        } catch (error) {
          console.error(`[WS] Error parsing message from ${clientId}:`, error);
        }
      });
    });

    wss.on("error", (error) => {
      console.error("[WS] WebSocket server error:", error);
    });

    const heartbeatInterval = setInterval(() => {
      if (!wss) return;

      const now = Date.now();
      const staleTimeout = 60000;

      connectedClients.forEach((clientInfo, ws) => {
        const isStale = now - clientInfo.lastPing > staleTimeout;

        if (ws.readyState === WebSocket.OPEN) {
          if (isStale) {
            console.log(`[WS] Client ${clientInfo.id} is stale, terminating`);
            ws.terminate();
            connectedClients.delete(ws);
          } else {
            try {
              ws.ping();
            } catch (error) {
              connectedClients.delete(ws);
            }
          }
        } else {
          connectedClients.delete(ws);
        }
      });
    }, 30000);

    wss.on("close", () => {
      console.log("[WS] WebSocket server closed");
      connectedClients.clear();
    });

    console.log("[WS] WebSocket server initialized successfully on /ws path");
  } catch (error) {
    console.error("[WS] Failed to initialize WebSocket server:", error);
    throw error;
  }
};

// Generate a unique client ID for WebSocket connections
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Broadcast upvote updates to all connected clients
const broadcastUpvoteUpdate = (
  complaintId: string,
  upvoteCount: number,
  hasUpvoted: boolean,
  userId: string
) => {
  if (!wss) return;

  const message = JSON.stringify({
    type: "upvote_update",
    data: {
      complaintId,
      upvoteCount,
      hasUpvoted,
      userId,
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
    },
  });

  connectedClients.forEach((clientInfo, client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        connectedClients.delete(client);
      }
    }
  });
};

//vertexai
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = process.env.GCP_LOCATION;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//   console.error(
//     "ERROR: The GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
//   );
//   console.error("Please set it to the path of your service account key file.");
//   process.exit(1);
// }

if (!PROJECT_ID || !LOCATION || !ENDPOINT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("ERROR: Missing required environment variables (GCP_PROJECT_ID, GCP_LOCATION, ENDPOINT_ID, CLIENT_EMAIL, or PRIVATE_KEY).");
    console.error("Please ensure your .env file is set up correctly with all required values.");
    process.exit(1);
}

const vertex_ai = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
  credentials: {
    client_email: CLIENT_EMAIL,
    // The private key from .env needs to have its newline characters correctly formatted.
    private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
  }
});


const modelEndpointPath = `projects/${PROJECT_ID}/locations/${LOCATION}/endpoints/${ENDPOINT_ID}`;

const generativeModel = vertex_ai.getGenerativeModel({
  // The 'model' parameter for a tuned model is its full endpoint resource name.
  model: modelEndpointPath,
});

async function standardizeSubCategory(subCategory: string): Promise<string> {
  if (!subCategory) {
    throw new Error("A non-empty subCategory is required");
  }

  let prompt = subCategory;

  console.log(`Received prompt: "${prompt}"`);
  console.log(`Sending request to endpoint: ${ENDPOINT_ID}`);

  try {
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const resp = await generativeModel.generateContent(request);

    // Safely access the response text to avoid errors if the structure is unexpected.
    const modelResponseText =
      resp.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (modelResponseText) {
      console.log("Successfully received response from model endpoint.");
      return modelResponseText;
    } else {
      console.warn("AI returned empty; falling back to original.");
      return subCategory;
    }
  } catch (error) {
    console.error("Error calling Vertex AI API:", error);
    throw new Error(
      "An internal server error occurred while contacting the Vertex AI model"
    );
  }
}

// Helper function to extract user information from the request
const getUserFromToken = (req: any): { id: string } | null => {
  try {
    return req.user || null;
  } catch (error) {
    return null;
  }
};

router.post(
  "/upload",
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded." });
      return;
    }

    const file = req.file;
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
        message: "Upload successful",
        url: `${process.env.R2_PUBLIC_URL}/${key}`,
      });
    } catch (err) {
      console.error("S3 upload error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// POST /api/complaints/newcomplaint - Create a new complaint
router.post(
  "/newcomplaint",
  jwtAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const validatedData = createComplaintSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true },
      });

      if (!userExists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: validatedData.categoryName,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          assignedDepartment: true,
          subCategories: true,
          learnedSubCategories: true,
        },
      });

      if (!category) {
        const availableCategories = await prisma.category.findMany({
          select: { name: true },
          orderBy: { name: "asc" },
        });

        res.status(400).json({
          error: `Category '${validatedData.categoryName}' not found.`,
          availableCategories: availableCategories.map((cat) => cat.name),
        });
        return;
      }

      const standardizedSubCategory = await standardizeSubCategory(
        validatedData.subCategory
      );

      // Directly use user input without AI standardization
      //standardizedSubCategory = validatedData.subCategory;

      const result = await prisma.$transaction(async (tx: any) => {
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
            attachmentUrl: validatedData.attachmentUrl ?? null,
            location: {
              create: {
                pin: validatedData.location.pin,
                district: validatedData.location.district,
                city: validatedData.location.city,
                locality: validatedData.location.locality,
                street: validatedData.location.street ?? null,
                latitude: validatedData.location.latitude ?? null,
                longitude: validatedData.location.longitude ?? null,
              },
            },
          },
          include: {
            location: true,
            category: {
              select: { name: true, assignedDepartment: true },
            },
            complainant: {
              select: { name: true, email: true },
            },
          },
        });

        const updatedSubCategories = Array.from(
          new Set([...category.subCategories, validatedData.subCategory])
        );

        const updatedLearnedSubCategories = Array.from(
          new Set([...category.learnedSubCategories, standardizedSubCategory])
        );

        await tx.category.update({
          where: { id: category.id },
          data: {
            subCategories: updatedSubCategories,
            learnedSubCategories: updatedLearnedSubCategories,
          },
        });

        return complaint;
      });

      if (userExists?.email) {
        sendComplaintConfirmationEmail(userExists.email, userExists.name, {
          categoryName: validatedData.categoryName,
          subCategory: validatedData.subCategory,
          standardizedSubCategory: standardizedSubCategory,
          description: validatedData.description,
          urgency: validatedData.urgency,
          location: {
            pin: validatedData.location.pin,
            district: validatedData.location.district,
            city: validatedData.location.city,
            locality: validatedData.location.locality,
            street: validatedData.location.street ?? undefined,
          },
          date: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
        }).catch(console.error);
      }

      res.status(201).json({
        message: "Complaint submitted successfully",
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
            name: result.complainant.name,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({
        error: "Failed to submit complaint. Please try again.",
      });
    }
  }
);

// GET /api/complaints/ - Get all complaints with filtering and sorting
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      categoryName,
      status,
      urgency,
      isPublic,
      district,
      city,
      sortBy = "recent",
      forYou = "false",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {
      isPublic: isPublic === "false" ? false : true,
      complainant: {
        status: {
          in: ["ACTIVE"],
        },
      },
    };

    if (categoryName) {
      const category = await prisma.category.findFirst({
        where: {
          name: { equals: categoryName as string, mode: "insensitive" },
        },
        select: { id: true },
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
        district: { equals: district as string, mode: "insensitive" },
      };
    }

    if (city) {
      whereClause.location = {
        ...whereClause.location,
        city: { equals: city as string, mode: "insensitive" },
      };
    }

    if (forYou === "true") {
      const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : null);

      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
          };

          const userWithLocation = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
              location: true,
            },
          });

          if (userWithLocation?.location) {
            whereClause.location = {
              ...whereClause.location,
              district: {
                equals: userWithLocation.location.district,
                mode: "insensitive",
              },
              city: {
                equals: userWithLocation.location.city,
                mode: "insensitive",
              },
            };
          }
        } catch (error) {
          // Proceed without location filter
        }
      }
    }

    let orderBy: any = { submissionDate: "desc" };

    switch (sortBy) {
      case "upvotes":
        orderBy = { upvoteCount: "desc" };
        break;
      case "urgent":
        orderBy = [{ urgency: "desc" }, { submissionDate: "desc" }];
        break;
    }

    const [complaints, totalCount] = await Promise.all([
      prisma.complaint.findMany({
        where: whereClause,
        select: {
          id: true,
          seq: true,
          submissionDate: true,
          subCategory: true,
          standardizedSubCategory: true,
          description: true,
          status: true,
          urgency: true,
          upvoteCount: true,
          attachmentUrl: true,
          complainant: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          location: {
            select: {
              district: true,
              city: true,
              pin: true,
              locality: true,
              street: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limitNum,
      }),
      prisma.complaint.count({ where: whereClause }),
    ]);

    if (!complaints.length) {
      res.status(404).json({ error: "No complaints found" });
      return;
    }

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      complaints: complaints.map((complaint) => ({
        id: complaint.id,
        seq: complaint.seq,
        name: complaint.complainant.name,
        category: complaint.category.name,
        subCategory: complaint.subCategory,
        standardizedSubCategory: complaint.standardizedSubCategory,
        district: complaint.location?.district,
        city: complaint.location?.city,
        pin: complaint.location?.pin,
        photo: complaint.attachmentUrl,
        upvotes: complaint.upvoteCount,
        dateOfPost: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        description:
          complaint.description.length > 100
            ? complaint.description.substring(0, 100) + "..."
            : complaint.description,
      })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      filters: {
        sortBy,
        forYou: forYou === "true",
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// GET /api/complaints/:id - Get single complaint with full details
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (
      !id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      res.status(400).json({ error: "Invalid complaint ID format" });
      return;
    }

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
            name: true,
            status: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            district: true,
            city: true,
            pin: true,
            locality: true,
            street: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (
      !complaint ||
      !complaint.complainant ||
      ["DELETED", "SUSPENDED"].includes(complaint.complainant.status)
    ) {
      res.status(404).json({ error: "Complaint not found" });
      return;
    }
    if (!complaint.location) {
      res.status(500).json({ error: "Location data is missing" });
      return;
    }

    let hasUpvoted = false;
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
          id: string;
        };

        const upvote = await prisma.upvote.findUnique({
          where: {
            userId_complaintId: {
              userId: decoded.id,
              complaintId: id,
            },
          },
        });
        hasUpvoted = !!upvote;
      } catch (error) {
        // Continue without upvote status
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
          coordinates:
            complaint.location.latitude && complaint.location.longitude
              ? {
                  lat: complaint.location.latitude,
                  lng: complaint.location.longitude,
                }
              : null,
        },
        photo: complaint.attachmentUrl,
        upvotes: complaint.upvoteCount,
        hasUpvoted,
        dateOfPost: complaint.submissionDate,
        status: complaint.status,
        urgency: complaint.urgency,
        isPublic: complaint.isPublic,
        shareData: {
          subCategory: complaint.subCategory,
          image: complaint.attachmentUrl,
          district: complaint.location.district,
          url: `${req.protocol}://${req.get("host")}/complaints/${id}`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint details" });
  }
});

// GET /api/complaints/user/:userId - Get user's complaints
router.get(
  "/user/:userId",
  jwtAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const requestingUser = getUserFromToken(req);

      if (!requestingUser || requestingUser.id !== userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      });

      if (!user || ["DELETED", "SUSPENDED"].includes(user.status)) {
        res.status(404).json({ error: "User not found" });
        return;
      }

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
            select: { name: true },
          },
          location: {
            select: {
              district: true,
              city: true,
              pin: true,
            },
          },
        },
        orderBy: { submissionDate: "desc" },
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        complaints: complaints.map((complaint) => ({
          id: complaint.id,
          seq: complaint.seq,
          category: complaint.category.name,
          subCategory: complaint.subCategory,
          description:
            complaint.description.length > 100
              ? complaint.description.substring(0, 100) + "..."
              : complaint.description,
          district: complaint.location?.district,
          city: complaint.location?.city,
          pin: complaint.location?.pin,
          photo: complaint.attachmentUrl,
          upvotes: complaint.upvoteCount,
          dateOfPost: complaint.submissionDate,
          status: complaint.status,
          urgency: complaint.urgency,
          isPublic: complaint.isPublic,
        })),
        totalComplaints: complaints.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user complaints" });
    }
  }
);

// GET /api/complaints/categories - Get all available categories
router.get(
  "/categories",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          assignedDepartment: true,
          subCategories: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          assignedDepartment: cat.assignedDepartment,
          subCategories: cat.subCategories,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
);

// POST /api/complaints/:id/upvote - Toggle upvote
router.post(
  "/:id/upvote",
  jwtAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = getUserFromToken(req);

      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      if (
        !id.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        res.status(400).json({ error: "Invalid complaint ID format" });
        return;
      }

      const complaint = await prisma.complaint.findUnique({
        where: { id },
        select: {
          id: true,
          isPublic: true,
          complainantId: true,
        },
      });

      if (!complaint) {
        res.status(404).json({ error: "Complaint not found" });
        return;
      }

      if (!complaint.isPublic || complaint.complainantId === user.id) {
        res.status(403).json({ error: "Upvote not allowed" });
        return;
      }

      const existingUpvote = await prisma.upvote.findUnique({
        where: {
          userId_complaintId: {
            userId: user.id,
            complaintId: id,
          },
        },
      });

      let action: string;
      let newUpvoteCount: number;
      let hasUpvoted: boolean;

      const result = await prisma.$transaction(async (tx: any) => {
        if (existingUpvote) {
          await tx.upvote.delete({
            where: { id: existingUpvote.id },
          });
          action = "removed";
          hasUpvoted = false;
        } else {
          await tx.upvote.create({
            data: {
              userId: user.id,
              complaintId: id,
            },
          });
          action = "added";
          hasUpvoted = true;
        }

        const upvoteCount = await tx.upvote.count({
          where: { complaintId: id },
        });

        await tx.complaint.update({
          where: { id },
          data: { upvoteCount },
        });

        return { action, hasUpvoted, upvoteCount };
      });

      broadcastUpvoteUpdate(id, result.upvoteCount, result.hasUpvoted, user.id);

      res.json({
        message: `Upvote ${result.action}`,
        upvoteCount: result.upvoteCount,
        hasUpvoted: result.hasUpvoted,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle upvote" });
    }
  }
);

// GET /api/complaints/:id/upvotes - Get upvote status
router.get(
  "/:id/upvotes",
  jwtAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = getUserFromToken(req);

      if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      if (
        !id.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        res.status(400).json({ error: "Invalid complaint ID format" });
        return;
      }

      const [upvoteCount, userUpvote] = await Promise.all([
        prisma.upvote.count({
          where: { complaintId: id },
        }),
        prisma.upvote.findUnique({
          where: {
            userId_complaintId: {
              userId: user.id,
              complaintId: id,
            },
          },
        }),
      ]);

      res.json({
        upvoteCount,
        hasUpvoted: !!userUpvote,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upvote status" });
    }
  }
);

// Health check endpoint
router.get("/health", async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    res
      .status(503)
      .json({ status: "unhealthy", error: "Database connection failed" });
  }
});

export default router;