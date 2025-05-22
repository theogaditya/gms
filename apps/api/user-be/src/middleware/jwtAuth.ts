import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const jwtAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new Error('No token provided')); // Pass error to next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = { id: decoded.id };
    next(); // Proceed to next middleware/route
  } catch (error) {
    next(new Error('Invalid token')); // Pass error to next()
  }
};