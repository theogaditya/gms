import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateStateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  
  let token: string | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.accessLevel !== 'DEPT_STATE_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not a state admin' });
    }

    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authenticateMunicipalAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  
  let token: string | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.accessLevel !== 'DEPT_MUNICIPAL_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not a municipal admin' });
    }

    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authenticateAgent = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  
  let token: string | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.accessLevel !== 'AGENT' || decoded.type !== 'AGENT') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not an agent' });
    }

    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authenticateMultiple = (allowedAccessLevels: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    
    let token: string | undefined;
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      if (!allowedAccessLevels.includes(decoded.accessLevel)) {
        return res.status(403).json({ 
          success: false, 
          message: `Unauthorized: Access level not permitted. Required: ${allowedAccessLevels.join(' or ')}` 
        });
      }

      (req as any).user = decoded;
      next();
    } catch {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
  };
};