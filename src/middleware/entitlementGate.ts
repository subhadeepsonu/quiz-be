import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "./middleware";
import { computeEntitlements } from "../services/entitlements";

function getDiagnosticQuizId(): string | null {
  return process.env.DIAGNOSTIC_QUIZ_ID || null;
}

export function requireQuizAccess() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      const quizId = (req.params as any)?.id || (req.params as any)?.quizId || req.body?.quizId;
      if (!quizId || typeof quizId !== "string") {
        next();
        return;
      }

      const ent = await computeEntitlements(userId);
      if (!ent) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
        return;
      }

      if (ent.accessLevel !== "DIAGNOSTIC_ONLY") {
        next();
        return;
      }

      const diagnosticId = getDiagnosticQuizId();
      // If not configured yet, don't hard-block the whole product in beta.
      // Set DIAGNOSTIC_QUIZ_ID to enforce diagnostic-only access.
      if (!diagnosticId) {
        next();
        return;
      }
      if (diagnosticId && quizId === diagnosticId) {
        next();
        return;
      }

      res.status(StatusCodes.FORBIDDEN).json({
        error: "Subscription required",
      });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
    }
  };
}

