import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { QuestionSchema, UpdateQuestionSchema } from "../validator/question.validator";

export async function getAllQuestion(req: Request, res: Response) {
  try {
    const quizId = req.query.quizId as string | undefined;
    if (!quizId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Quiz ID is required" });
      return;
    }

    const questions = await prisma.question.findMany({
      where: {
        quizId: quizId,
        isDeleted: false,
      },
      orderBy: {
        orderNo: 'asc',
        createdAt: 'asc',
      }
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
    const question = await prisma.question.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
    });

    if (!question) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Question not found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Question fetched successfully",
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
        questionText: check.data.questionText,
        image: check.data.image,
        questionType: check.data.questionType,
        questionSection: check.data.questionSection != null ? check.data.questionSection : null,
        questionTopic: check.data.questionTopic,
        paragraphText: check.data.paragraphText,
        optionA: check.data.optionA,
        optionB: check.data.optionB,
        optionC: check.data.optionC,
        optionD: check.data.optionD,
        optionE: check.data.optionE,
        correctOptions: check.data.correctOption,
        explanation: check.data.explanation,
        answerImage: check.data.answerImage,
        tableData: check.data.tableData,
        caseStudyData: check.data.caseStudyData,
        blankOptions: check.data.blankOptions,
        subQuestions: check.data.subQuestions,
        twoPartAnalysisData: check.data.twoPartAnalysisData,
        points: check.data.points || 1,
        quizId: check.data.quizId,
        orderIndex: check.data.orderIndex || 0,
        isDeleted: false,
        sectionId: check.data.sectionId,
        topicId: check.data.topicId
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
    const check = UpdateQuestionSchema.safeParse(body);
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
        questionText: check.data.questionText || null,
        image: check.data.image || null,
        questionType: check.data.questionType,
        questionSection: check.data.questionSection != null ? check.data.questionSection : null,
        questionTopic: check.data.questionTopic,
        paragraphText: check.data.paragraphText || null,
        optionA: check.data.optionA || null,
        optionB: check.data.optionB || null,
        optionC: check.data.optionC || null,
        optionD: check.data.optionD || null,
        optionE: check.data.optionE || null,
        correctOptions: check.data.correctOption,
        explanation: check.data.explanation || null,
        answerImage: check.data.answerImage || null,
        tableData: check.data.tableData || undefined,
        caseStudyData: check.data.caseStudyData || undefined,
        blankOptions: check.data.blankOptions || undefined,
        subQuestions: check.data.subQuestions || undefined,
        points: check.data.points || 1,
        orderIndex: check.data.orderIndex || 0,
        sectionId: check.data.sectionId,
        topicId: check.data.topicId,

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
    console.log(questionId)
    const checkQuestion = await prisma.question.findUnique({
      where: { id: questionId, isDeleted: false },
    });
    console.log(checkQuestion)
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

// Additional helper function to get questions by category
export async function getQuestionsByCategory(req: Request, res: Response) {
  try {
    const { quizId, questionCategory } = req.query;

    if (!quizId || !questionCategory) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Quiz ID and question category are required"
      });
      return;
    }

    const questions = await prisma.question.findMany({
      where: {
        quizId: quizId as string,
        isDeleted: false,
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    res.status(StatusCodes.OK).json({
      message: "Questions fetched by category successfully",
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

// Function to reorder questions
export async function reorderQuestions(req: Request, res: Response) {
  try {
    const { questionOrders } = req.body; // Array of { id: string, orderIndex: number }

    if (!Array.isArray(questionOrders)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "questionOrders must be an array"
      });
      return;
    }

    // Update order index for multiple questions
    const updatePromises = questionOrders.map((item: { id: string, orderIndex: number }) =>
      prisma.question.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex }
      })
    );

    await Promise.all(updatePromises);

    res.status(StatusCodes.OK).json({
      message: "Questions reordered successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}