import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes"
import { prisma } from '../db';

export async function getAllUser(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function createUser(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}
