// FinPredict.js - Role-Based Access Control (RBAC) Middleware
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function requireRole(allowedRoles: Array<'user' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access requires ${allowedRoles.join(' or ')} clearance level. Current: ${req.user.role}`,
        clearanceLevelRequired: allowedRoles
      });
      return;
    }

    next();
  };
}
