import nodemailer from "nodemailer";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_BASE_URL || "https://ascensa-frontned.vercel.app";
}

function getEmailLogoUrl(): string {
  return process.env.EMAIL_LOGO_URL || "https://ascensa-frontned.vercel.app/logo.jpeg";
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

const LOGIN_CREDENTIALS_HTML = (opts: {
  userEmail: string;
  userPassword: string;
  loginPageUrl: string;
  logoUrl: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Ascensa Prep</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0E8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F0E8; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(27, 42, 74, 0.1);">
                    
                    <tr>
                        <td align="center" style="background-color: #1B2A4A; padding: 40px 20px;">
                            <img src="${opts.logoUrl}" alt="Ascensa Prep Logo" width="180" style="display: block; border: 0; color: #F5F0E8; font-size: 24px; font-weight: bold; text-align: center;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 40px 30px 40px; color: #333333;">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #1B2A4A; text-align: center;">Welcome to Your GMAT Journey!</h1>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                You're officially signed up and ready to start mastering the GMAT Focus Edition. Below are your secure login credentials to access the platform and your diagnostic tests.
                            </p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F0E8; border-radius: 6px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px; text-align: center;">
                                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555555; text-transform: uppercase; letter-spacing: 1px;">Your Login Details</p>
                                        <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Email:</strong> ${opts.userEmail}</p>
                                        <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> ${opts.userPassword}</p>
                                    </td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <a href="${opts.loginPageUrl}" style="display: inline-block; background-color: #E8761A; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Log In to Your Dashboard</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #777777; text-align: center;">
                                We highly recommend changing your password immediately after logging in for the first time.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #1B2A4A; padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #F5F0E8; opacity: 0.8;">
                                &copy; 2026 Ascensa Prep. All rights reserved.<br>
                                Dubai, United Arab Emirates
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`;

export async function sendPasswordEmail(opts: { to: string; password: string; loginUrl: string; magicLinkUrl?: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing EMAIL_FROM or SMTP_USER");

  const transporter = getMailer();
  const loginPageUrl = opts.magicLinkUrl || opts.loginUrl;

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Welcome to Ascensa Prep – Your Login Details",
    text: `Welcome to Ascensa Prep!\n\nYour login details:\nEmail: ${opts.to}\nPassword: ${opts.password}\n\nLog in here: ${loginPageUrl}\n\nWe recommend changing your password after your first login.`,
    html: LOGIN_CREDENTIALS_HTML({
      userEmail: opts.to,
      userPassword: opts.password,
      loginPageUrl,
      logoUrl: getEmailLogoUrl(),
    }),
  });
}

const TRIAL_ENDED_HTML = (opts: { subscriptionPageUrl: string; logoUrl: string }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Ascensa Prep Trial Has Ended</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0E8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F0E8; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(27, 42, 74, 0.1);">
                    
                    <tr>
                        <td align="center" style="background-color: #F5F0E8; padding: 30px 20px; border-bottom: 3px solid #1B2A4A;">
                            <img src="${opts.logoUrl}" alt="Ascensa Prep Logo" width="200" style="display: block; border: 0;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 40px 30px 40px; color: #333333;">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #1B2A4A; text-align: center;">Your 3-Day Free Trial Has Ended</h1>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                We hope you enjoyed your exclusive access to the Ascensa Prep platform! Your free trial has officially wrapped up, but your GMAT journey is just getting started.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                                Don't lose your momentum. Upgrade your account today to maintain full access to all diagnostic tests and keep sharpening your skills
                            </p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <a href="${opts.subscriptionPageUrl}" style="display: inline-block; background-color: #E8761A; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 40px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Extend Subscription</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #777777; text-align: center;">
                                If you have any questions about our subscription plans or need help choosing the right tier, just reply to this email!
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #1B2A4A; padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #F5F0E8; opacity: 0.8;">
                                &copy; 2026 Ascensa Prep. All rights reserved.<br>
                                Dubai, United Arab Emirates
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>

</body>
</html>`;

export async function sendTrialEndedEmail(opts: { to: string; pricingUrl: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error("Missing EMAIL_FROM or SMTP_USER");

  const transporter = getMailer();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: "Your Ascensa Prep Trial Has Ended",
    text: `Your 3-day free trial has ended. We hope you enjoyed Ascensa Prep! Upgrade your account to maintain full access: ${opts.pricingUrl}\n\nIf you have questions, just reply to this email.`,
    html: TRIAL_ENDED_HTML({
      subscriptionPageUrl: opts.pricingUrl,
      logoUrl: getEmailLogoUrl(),
    }),
  });
}

