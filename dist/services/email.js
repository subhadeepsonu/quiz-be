"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailer = getMailer;
exports.sendMagicLoginEmail = sendMagicLoginEmail;
exports.sendPasswordEmail = sendPasswordEmail;
exports.sendTrialEndedEmail = sendTrialEndedEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function requiredEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
function getMailer() {
    const host = requiredEnv("SMTP_HOST");
    const port = Number(requiredEnv("SMTP_PORT"));
    const user = requiredEnv("SMTP_USER");
    const pass = requiredEnv("SMTP_PASS");
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}
function sendMagicLoginEmail(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
        if (!from)
            throw new Error("Missing EMAIL_FROM or SMTP_USER");
        const transporter = getMailer();
        yield transporter.sendMail({
            from,
            to: opts.to,
            subject: "Your Ascensa login link",
            text: `Use this link to log in (valid for a short time): ${opts.magicLinkUrl}`,
            html: `
      <p>Use this link to log in (valid for a short time):</p>
      <p><a href="${opts.magicLinkUrl}">Log in to Ascensa</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
        });
    });
}
function sendPasswordEmail(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
        if (!from)
            throw new Error("Missing EMAIL_FROM or SMTP_USER");
        const transporter = getMailer();
        yield transporter.sendMail({
            from,
            to: opts.to,
            subject: "Your Ascensa login credentials",
            text: `Your password: ${opts.password}\n\nLogin here: ${opts.loginUrl}`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Welcome to Ascensa Prep!</h2>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${opts.to}</p>
          <p style="margin: 10px 0 0 0;"><strong>Password:</strong> <code style="background-color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 16px; font-weight: bold;">${opts.password}</code></p>
        </div>
        <p style="margin-top: 20px;">
          <a href="${opts.loginUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Ascensa</a>
        </p>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
        });
    });
}
function sendTrialEndedEmail(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
        if (!from)
            throw new Error("Missing EMAIL_FROM or SMTP_USER");
        const transporter = getMailer();
        yield transporter.sendMail({
            from,
            to: opts.to,
            subject: "Your Ascensa free trial has ended",
            text: `Your 3-day free trial has ended. Subscribe to continue: ${opts.pricingUrl}`,
            html: `
      <p>Your 3-day free trial has ended.</p>
      <p><a href="${opts.pricingUrl}">Subscribe to continue</a></p>
    `,
        });
    });
}
