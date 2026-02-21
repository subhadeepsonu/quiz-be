import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: Role;
}

export function middleware(requiredRoles: Role[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ message: "Unauthorized: Missing token" });
        return;
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: Role;
      };

      if (!decoded || !decoded.id || !decoded.role) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
      }

      if (!requiredRoles.includes(decoded.role)) {
        res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      req.userId = decoded.id;
      req.userRole = decoded.role;

      next();
    } catch (error) {
      // Import logger here to avoid circular dependency
      const { logger } = require("../utils/logger");
      logger.error("Error in authentication middleware", error as Error, {
        route: req.path,
        method: req.method,
      });
      res.status(401).json({
        message: "Unauthorized: Token verification failed",
        error: (error as Error).message,
      });
    }
  };
}
