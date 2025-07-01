import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes"
import { prisma } from '../db';

export async function getAllSection(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function getSection(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function createSection(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function updateSection(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function deleteSection(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}
