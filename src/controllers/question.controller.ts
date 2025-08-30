import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { QuestionSchema } from "../validator/question.validator";

export async function getAllQuestion(req: Request, res: Response) {
  try {
    const quizId = req.query.quizId as string | undefined;
    if (!quizId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Quiz ID is required" });
      return;
    }
    const questions = await prisma.quizSection.findMany({
      where: {
        quizId: quizId,
      },
      include: {
        questions: true,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Questions fetched successfully",
      data: questions,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const questions = await prisma.question.findMany({
      where: {
        quizSectionId: id,
        isDeleted: false,
      },
    });
    res.status(StatusCodes.ACCEPTED).json({
      message: "questions",
      data: questions,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = QuestionSchema.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const question = await prisma.question.create({
      data: {
        optionA: check.data.optionA,
        optionB: check.data.optionB,
        optionC: check.data.optionC,
        optionD: check.data.optionD,
        optionE: check.data.optionE,
        question: check.data.question,
        paragraphText: check.data.paragraphText,
        isDeleted: false,
        questionType: check.data.questionType,
        correctOption: check.data.correctOption,
        image: check.data.image,
        quizSectionId: check.data.quizSectionId,
        answer: check.data.answer,
        answerImg: check.data.answerImgUrl,
        blankOptions: check.data.blankOptions,
        subQuestions: check.data.subQuestions,
        tableData: check.data.tableData,
        caseStudyData: check.data.caseStudyData,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
      data: question,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const body = req.body;
    const questionId = req.params.id;
    const check = QuestionSchema.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const checkQuestion = await prisma.question.findUnique({
      where: { id: questionId, isDeleted: false },
    });
    if (!checkQuestion) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Question not found",
      });
      return;
    }
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        optionA: check.data.optionA,
        optionB: check.data.optionB,
        optionC: check.data.optionC,
        optionD: check.data.optionD,
        optionE: check.data.optionE,
        paragraphText: check.data.paragraphText,
        question: check.data.question,
        isDeleted: false,
        questionType: check.data.questionType,
        correctOption: check.data.correctOption,
        image: check.data.image,
        answer: check.data.answer,
        answerImg: check.data.answerImgUrl,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Question updated successfully",
      data: question,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const questionId = req.params.id;
    console.log(questionId);
    const checkQuestion = await prisma.question.findUnique({
      where: { id: questionId, isDeleted: false },
    });
    console.log(checkQuestion);
    if (!checkQuestion) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Question not found" });
      return;
    }
    await prisma.question.update({
      where: { id: questionId },
      data: { isDeleted: true },
    });
    res.status(StatusCodes.OK).json({
      message: "Question deleted successfully",
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
