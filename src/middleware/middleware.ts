import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function middleware(requiredRole: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res
          .status(401)
          .json({ message: "Unauthorized: Token missing or invalid" });
        return;
      }
      const token = authHeader;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: Role;
        [key: string]: any;
      };

      if (!decoded || !decoded.role) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
      }

      if (requiredRole.includes(decoded.role)) {
        req.body.user = decoded;
        next();
        return;
      }

      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: (error as Error).message,
      });
      return;
    }
  };
}
