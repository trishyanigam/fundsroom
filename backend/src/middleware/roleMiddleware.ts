import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

/**
 * Role Authorization Middleware: Restricts route execution to specific permitted roles.
 * Distinction:
 * - HTTP 401: Authentication failure (User not logged in or invalid token)
 * - HTTP 403: Authorization failure (Authenticated user lacks required role permissions)
 * @param allowedRoles List of roles permitted to access the endpoint.
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required before permission check.'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        }
      });
      return;
    }

    next();
  };
};
