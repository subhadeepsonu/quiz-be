import { Request, Response } from 'express';
import { StatusCodes } from "http-status-codes"
import { prisma } from '../db';

export async function getAllPlan(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function getPlan(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function createPlan(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function updatePlan(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}

export async function deletePlan(req: Request, res: Response) {
    try {
        // TODO: implement logic
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        return;
    }
}
