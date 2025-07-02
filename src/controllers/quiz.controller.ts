import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { QuizValidator } from "../validator/quiz.validator";
import { QuizType } from "@prisma/client";

export async function getAllQuiz(req: Request, res: Response) {
  try {
    const topicId = req.query.topicId as string | undefined;
    const sectionId = req.query.sectionId as string | undefined;
    const quizType = req.query.type as QuizType | undefined;
    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(topicId && { topicId }),
        ...(sectionId && { sectionId }),
        ...(quizType && { type: quizType }),
      },
      include: {
        quizSections: {
          include: {
            questions: true,
          },
        },
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Quizzes fetched successfully",
      data: quizzes,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getQuiz(req: Request, res: Response) {
  try {
    const quizId = req.params.id;
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        quizSections: {
          include: {
            questions: true,
          },
        },
      },
    });
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Quiz not found" });
      return;
    }
    res.status(StatusCodes.OK).json({
      message: "Quiz fetched successfully",
      data: quiz,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createQuiz(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = QuizValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const quiz = await prisma.quiz.create({
      data: {
        title: check.data.title,
        duration: check.data.duration,
        type: check.data.type,
        sectionId: check.data.sectionId,
        topicId: check.data.topicId,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Quiz created successfully",
      data: quiz,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateQuiz(req: Request, res: Response) {
  try {
    const body = req.body;
    const quizId = req.params.id;
    const check = QuizValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: check.data.title,
        duration: check.data.duration,
        type: check.data.type,
        sectionId: check.data.sectionId,
        topicId: check.data.topicId,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Quiz updated successfully",
      data: quiz,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteQuiz(req: Request, res: Response) {
  try {
    const quizId = req.params.id;
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });
    if (!quiz) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Quiz not found" });
      return;
    }
    await prisma.quiz.delete({
      where: { id: quizId },
    });
    res.status(StatusCodes.OK).json({
      message: "Quiz deleted successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
