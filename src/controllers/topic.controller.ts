import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { topicValidator } from "../validator/topic.validator";

export async function getAllTopic(req: Request, res: Response) {
  try {
    const topics = await prisma.topic.findMany({
      where: {
        isDeleted: false,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Topics fetched successfully",
      data: topics,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createTopic(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = topicValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const topic = await prisma.topic.create({
      data: {
        name: check.data.name,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Topic created successfully",
      data: topic,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateTopic(req: Request, res: Response) {
  try {
    const body = req.body;
    const topicId = req.params.id;
    const check = topicValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const existingTopic = await prisma.topic.findUnique({
      where: { id: topicId, isDeleted: false },
    });
    if (!existingTopic) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Topic not found",
      });
      return;
    }
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        name: check.data.name,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Topic updated successfully",
      data: updatedTopic,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteTopic(req: Request, res: Response) {
  try {
    const topicId = req.params.id;
    const topic = await prisma.topic.findUnique({
      where: { id: topicId, isDeleted: false },
    });
    if (!topic) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Topic not found" });
      return;
    }
    await prisma.topic.update({
      where: { id: topicId },
      data: { isDeleted: true },
    });
    res.status(StatusCodes.OK).json({
      message: "Topic deleted successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
