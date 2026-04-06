import "dotenv/config";
import { getEmailFromHeader, getMailer } from "../services/email";

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: npm run send-test-email -- <recipient@email.com>");
    process.exitCode = 1;
    return;
  }

  const from = getEmailFromHeader();

  const transporter = getMailer();
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Ascensa SMTP test",
    text: "If you received this, SMTP (e.g. Resend) is configured correctly.",
    html: "<p>If you received this, SMTP (e.g. Resend) is configured correctly.</p>",
  });

  console.log("Sent:", info.messageId);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
