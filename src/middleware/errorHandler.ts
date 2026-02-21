import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../utils/logger";

export interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: number;
}

export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error with full context
  const context = logger.getRequestContext(req);
  logger.error("Unhandled error in request", err, context);

  // Determine status code
  const statusCode = err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;

  // Send error response
  res.status(statusCode).json({
    error: "Internal Server Error",
    // Only include error details in development
    ...(process.env.NODE_ENV !== "production" && {
      message: err.message,
      stack: err.stack,
    }),
  });
}

// Wrapper function to catch async errors in route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
}
