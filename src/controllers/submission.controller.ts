import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middleware/middleware";
import { logger } from "../utils/logger";

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
    logger.error("Error in startSubmission", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in getAllSubmissions", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in getUserSubmissions", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch user submissions" });
  }
}

export async function getSubmissionByQuiz(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Unauthorized: User not found in token",
      });
      return
    }

    const submission = await prisma.submission.findFirst({
      where: {
        userId,
        quizId,
        status: "completed",
      },
      orderBy: { startedAt: "desc" },
      include: {
        quiz: true,
        answers: {
          include: { question: true },
        },
      },
    });

    if (!submission) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "No submission found for this quiz",
      });
      return
    }
    const totalTimeSec = submission.answers.reduce((acc: number, answer) => {
      return acc + (answer.timeTakenSec ? Number(answer.timeTakenSec) : 0);
    }, 0);

    let categorySpecificData: Record<
      string,
      { totalTime: number; questionCount: number; averageTimePerQuestion?: number }
    > = {};

    if (submission.quiz.category === "MOCK_TESTS") {
      categorySpecificData = submission.answers.reduce(
        (acc: any, answer: any) => {
          let section = answer.question?.questionSection;
          const time = answer.timeTakenSec;

          if (time != null && section) {
            
            if (
              section === "DATA_INSIGHTS" ||
              section === "INTEGRATED_REASONING"
            ) {
              section = "DATA_INSIGHTS_AND_IR";
            }

            if (!acc[section]) acc[section] = { totalTime: 0, questionCount: 0 };
            acc[section].totalTime += Number(time);
            acc[section].questionCount += 1;
          }

          return acc;
        },
        {}
      );

      for (const [section, data] of Object.entries(categorySpecificData)) {
        data.averageTimePerQuestion =
          data.questionCount > 0 ? data.totalTime / data.questionCount : 0;
      }
    }


    const avgTimePerQuestionSec =
      submission.answers.length > 0
        ? totalTimeSec / submission.answers.length
        : 0;

    res.json({
      submission,
      totalTimeSec,
      avgTimePerQuestionSec,
      categorySpecificData,
    });
    return
  } catch (error) {
    logger.error("Error in getSubmissionByQuiz", error as Error, logger.getRequestContext(req));
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to fetch submission results",
    });
    return
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
    logger.error("Error in completeSubmission", error as Error, logger.getRequestContext(req));
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
    logger.error("Error in deleteSubmission", error as Error, logger.getRequestContext(req));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete submission" });
  }
}
