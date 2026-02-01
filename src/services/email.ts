import nodemailer from "nodemailer";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "https://ascensa-frontned.vercel.app";
}

export function getMailer() {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMagicLoginEmail(opts: { to: string; magicLinkUrl: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing EMAIL_FROM or SMTP_USER");

  const transporter = getMailer();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Your Ascensa login link",
    text: `Use this link to log in (valid for a short time): ${opts.magicLinkUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Your Ascensa Login Link</h2>
        <p>Use this link to automatically sign in (valid for a short time):</p>
        <p style="margin-top: 20px;">
          <a href="${opts.magicLinkUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Ascensa</a>
        </p>
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordEmail(opts: { to: string; password: string; loginUrl: string; magicLinkUrl?: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing EMAIL_FROM or SMTP_USER");

  const transporter = getMailer();
  
  // If magic link is provided, prioritize it; otherwise use regular login URL
  const primaryLink = opts.magicLinkUrl || opts.loginUrl;
  const primaryLinkText = opts.magicLinkUrl ? "Click here to automatically sign in" : "Log in to Ascensa";
  
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Your Ascensa login credentials",
    text: `Your password: ${opts.password}\n\n${opts.magicLinkUrl ? `Quick login link: ${opts.magicLinkUrl}\n\n` : ""}Login here: ${opts.loginUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Welcome to Ascensa Prep!</h2>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${opts.to}</p>
          <p style="margin: 10px 0 0 0;"><strong>Password:</strong> <code style="background-color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 16px; font-weight: bold;">${opts.password}</code></p>
        </div>
        ${opts.magicLinkUrl ? `
        <p style="margin-top: 20px;">
          <a href="${opts.magicLinkUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 10px;">${primaryLinkText}</a>
        </p>
        <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">
          Or use the password above to log in manually: <a href="${opts.loginUrl}" style="color: #ea580c; text-decoration: underline;">${opts.loginUrl}</a>
        </p>
        ` : `
        <p style="margin-top: 20px;">
          <a href="${opts.loginUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log in to Ascensa</a>
        </p>
        `}
        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendTrialEndedEmail(opts: { to: string; pricingUrl: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing EMAIL_FROM or SMTP_USER");

  const transporter = getMailer();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Your Ascensa free trial has ended",
    text: `Your 3-day free trial has ended. Subscribe to continue: ${opts.pricingUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Your Free Trial Has Ended</h2>
        <p>Your 3-day free trial has ended. Subscribe to continue your GMAT preparation journey:</p>
        <p style="margin-top: 20px;">
          <a href="${opts.pricingUrl}" style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Pricing Plans</a>
        </p>
      </div>
    `,
  });
}

