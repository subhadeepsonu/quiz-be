import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";
import { sectionValidator } from "../validator/section.validator";

export async function getAllSection(req: Request, res: Response) {
  try {
    const sections = await prisma.section.findMany({
      where: {
        isDeleted: false,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Sections fetched successfully",
      data: sections,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getSectionById(req: Request, res: Response) {
  try {
    const sectionId = req.params.id;
    const section = await prisma.section.findUnique({
      where: { id: sectionId, isDeleted: false },
      include: {},
    });
    if (!section) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Section not found" });
      return;
    }
    res.status(StatusCodes.OK).json({
      message: "Section fetched successfully",
      data: section,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createSection(req: Request, res: Response) {
  try {
    const body = req.body;
    const check = sectionValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const newSection = await prisma.section.create({
      data: {
        name: check.data.name,
      },
    });
    res.status(StatusCodes.CREATED).json({
      message: "Section created successfully",
      data: newSection,
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateSection(req: Request, res: Response) {
  try {
    const body = req.body;
    const sectionId = req.params.id;
    const check = sectionValidator.safeParse(body);
    if (!check.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Invalid request body",
        details: check.error.errors,
      });
      return;
    }
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId, isDeleted: false },
    });
    if (!existingSection) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Section not found" });
      return;
    }
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        name: check.data.name,
      },
    });
    res.status(StatusCodes.OK).json({
      message: "Section updated successfully",
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

export async function deleteSection(req: Request, res: Response) {
  try {
    const sectionId = req.params.id;
    const existingSection = await prisma.section.findUnique({
      where: { id: sectionId, isDeleted: false },
    });
    if (!existingSection) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Section not found" });
      return;
    }
    await prisma.section.update({
      where: { id: sectionId },
      data: { isDeleted: true },
    });
    res.status(StatusCodes.OK).json({
      message: "Section deleted successfully",
    });
    return;
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
