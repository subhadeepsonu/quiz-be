import { Request } from "express";

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

interface LogContext {
  route?: string;
  method?: string;
  userId?: string;
  params?: any;
  body?: any;
  query?: any;
  [key: string]: any;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = this.formatTimestamp();
    const logEntry: any = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return JSON.stringify(logEntry);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const logMessage = this.formatLog(level, message, context, error);
    
    // Use console.error for errors, console.log for others
    if (level === LogLevel.ERROR) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Helper to extract request context
  getRequestContext(req: Request): LogContext {
    return {
      route: req.path || req.route?.path,
      method: req.method,
      userId: (req as any).userId,
      params: req.params,
      query: req.query,
      // Only log body for non-sensitive routes (exclude auth routes)
      body: req.path?.includes("/auth") || req.path?.includes("/billing/webhook")
        ? undefined
        : req.body,
    };
  }
}

export const logger = new Logger();
