import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes"
import { prisma } from '../db';

export async function getAllTopic(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function getTopic(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function createTopic(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function updateTopic(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function deleteTopic(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}
