import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../db";

export async function login(req: Request, res: Response) {
  try {
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function register(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function verify(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function verifyForgotPassword(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
