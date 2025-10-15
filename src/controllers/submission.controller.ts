import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middleware/middleware";

export async function startSubmission(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { quizId } = req.body;
    const userId = req.userId;

    if (!userId || !quizId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "userId and quizId are required" });
      return;
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        quizId,
        status: "inProgress",
      },
    });

    res.status(StatusCodes.CREATED).json(submission);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create submission" });
  }
}

export async function getAllSubmissions(req: Request, res: Response) {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { startedAt: "desc" },
      include: { user: true, quiz: true },
    });
    res.json(submissions);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch submissions" });
  }
}

export async function getUserSubmissions(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { quizId, limit } = req.query;

    const whereClause: any = { userId };
    if (quizId) whereClause.quizId = quizId;

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: { startedAt: "desc" },
      take: limit ? Number(limit) : undefined,
      include: { quiz: true },
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user submissions" });
  }
}

export async function getSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        quiz: true,
        answers: { include: { question: true } },
      },
    });

    if (!submission)
      res.status(StatusCodes.NOT_FOUND).json({ error: "Submission not found" });

    res.json(submission);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch submission" });
  }
}

export async function completeSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to complete submission" });
  }
}

export async function deleteSubmission(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.submission.delete({ where: { id } });
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete submission" });
  }
}
