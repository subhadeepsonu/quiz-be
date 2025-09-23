import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { QuizValidator } from "../validator/quiz.validator";
import { TestCategory, TestSubCategory } from "@prisma/client";

export async function getAllQuiz(req: Request, res: Response) {
  try {
    const category = req.query.category as TestCategory | undefined;
    const subCategory = req.query.subCategory as TestSubCategory | undefined;
    console.log(category, subCategory)
    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(category && { category }),
        ...(subCategory && { subCategory }),
        isDeleted: false,
      },
      include: {
        questions: true,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Quizzes fetched successfully",
      data: quizzes,
    });
    return;
  } catch (error) {
    console.log(error)
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
      where: { id: quizId, isDeleted: false },
      include: {
        questions: {
          where: {
            isDeleted: false
          }
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
        description: check.data.description,
        category: check.data.category,
        subCategory: check.data.subCategory,
        duration: check.data.duration,
        totalQuestions: check.data.totalQuestions || 0,
      },
    });

    res.status(StatusCodes.CREATED).json({
      message: "Quiz created successfully",
      data: quiz,
    });
    return;
  } catch (error) {
    console.log(error);
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
        description: check.data.description,
        category: check.data.category,
        subCategory: check.data.subCategory,
        duration: check.data.duration,
        totalQuestions: check.data.totalQuestions || 0,
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

    await prisma.quiz.update({
      where: { id: quizId },
      data: {
        isDeleted: true,
      },
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