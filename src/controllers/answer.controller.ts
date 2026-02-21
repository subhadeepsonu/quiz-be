import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { logger } from "../utils/logger";

export async function saveAnswer(req: Request, res: Response) {
  try {
    const { submissionId, questionId, selectedOptions, flagged, timeTakenSec } =
      req.body;

    if (!submissionId || !questionId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "submissionId and questionId are required" });
      return;
    }

    const answer = await prisma.submittedAnswer.upsert({
      where: {
        submissionId_questionId: { submissionId, questionId },
      },
      update: {
        selectedOptions,
        flagged,
        timeTakenSec,
      },
      create: {
        submissionId,
        questionId,
        selectedOptions,
        flagged,
        timeTakenSec,
      },
    });

    res.status(StatusCodes.OK).json(answer);
  } catch (error) {
    logger.error("Error in saveAnswer", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to save answer" });
  }
}

export async function getAnswersBySubmission(req: Request, res: Response) {
  try {
    const { submissionId } = req.params;
    const answers = await prisma.submittedAnswer.findMany({
      where: { submissionId },
      include: { question: true },
    });

    res.json(answers);
  } catch (error) {
    logger.error("Error in getAnswersBySubmission", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch answers" });
  }
}
