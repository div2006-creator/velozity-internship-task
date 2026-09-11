import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyAccessToken, TokenPayload } from '../utils/token';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Access token missing or invalid format' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
  }
}

// Alias for authenticate
export const authenticate = authenticateUser;

/**
 * Middleware factory enforcing role-based access control.
 * ADMIN role always bypasses role checks unless explicitly restricted.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User authentication required' });
      return;
    }

    const userRole = req.user.role as Role;

    // ADMIN has full access across all endpoints
    if (userRole === Role.ADMIN || allowedRoles.includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({
      error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role: ${userRole}`,
    });
  };
}
