import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function getAllSubmission(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function getSubmission(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function createSubmission(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function updateSubmission(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}

export async function deleteSubmission(req: Request, res: Response) {
  try {
    // TODO: implement logic
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
    return;
  }
}
