import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../utils/logger";
import { getMailer } from "../services/email";

export async function submitContact(req: Request, res: Response) {
  try {
    const { email, message } = req.body || {};

    if (!email || typeof email !== "string") {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Email is required" });
      return;
    }

    if (!message || typeof message !== "string") {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Message is required" });
      return;
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
    if (!from) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Email is not configured" });
      return;
    }

    const supportTo =
      process.env.CONTACT_EMAIL ||
      process.env.SUPPORT_EMAIL ||
      from;

    const transporter = getMailer();

    await transporter.sendMail({
      from,
      to: supportTo,
      subject: "New contact form submission",
      replyTo: email,
      text: `From: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
      `,
    });

    res.status(StatusCodes.OK).json({
      message: "Your message has been sent. We'll get back to you soon.",
    });
  } catch (error) {
    logger.error(
      "Error in submitContact",
      error as Error,
      logger.getRequestContext(req)
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
}

