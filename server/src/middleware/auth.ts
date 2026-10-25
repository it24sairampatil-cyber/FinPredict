// FinPredict.js - JWT Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  displayName: string;
  department: string;
  clearanceLevel: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'finpredict_institutional_jwt_secret_key_2026_xyz';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Forbidden: Expired or invalid authentication token.' });
  }
}
