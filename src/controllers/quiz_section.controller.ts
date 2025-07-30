import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import {
  QuizSectionValidator,
  UpdateQuizSectionValidator,
} from "../validator/quiz_section.validator";

export async function getAllQuiz_section(req: Request, res: Response) {
  try {
    const quizId = req.query.quizId as string | undefined;
    if (!quizId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Quiz ID is required" });
      return;
    }

    const quizSections = await prisma.quizSection.findMany({
      where: { quizId: quizId, isDeleted: false },
      include: {
        questions: true,
      },
    });

    res.status(StatusCodes.OK).json({
      message: "Quiz sections fetched successfully",
      data: quizSections,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getQuiz_section(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const quizSections = await prisma.quizSection.findMany({
      where: {
        quizId: id,
        isDeleted: false,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "quiz sections",
      data: quizSections,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createQuiz_section(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = QuizSectionValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const quizSection = await prisma.quizSection.create({
      data: {
        name: check.data.name,
        quizId: check.data.quizId,
        isCalculatorAllowed: check.data.isCalculatorAllowed,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Quiz section created successfully",
      data: quizSection,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateQuiz_section(req: Request, res: Response) {
  try {
    const body = req.body;
    const sectionId = req.params.id;
    const check = UpdateQuizSectionValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const updatedSection = await prisma.quizSection.update({
      where: { id: sectionId },
      data: {
        name: check.data.name,
        isCalculatorAllowed: check.data.isCalculatorAllowed,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Quiz section updated successfully",
      data: updatedSection,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteQuiz_section(req: Request, res: Response) {
  try {
    const sectionId = req.params.id;
    const existingSection = await prisma.quizSection.findUnique({
      where: { id: sectionId },
    });
    if (!existingSection) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Quiz section not found",
      });
      return;
    }
    await prisma.quizSection.update({
      where: { id: sectionId },
      data: {
        isDeleted: true,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Quiz section deleted successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
