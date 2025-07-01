import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes"
import { prisma } from '../db';

export async function getAllQuiz_section(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function getQuiz_section(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function createQuiz_section(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function updateQuiz_section(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function deleteQuiz_section(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}
