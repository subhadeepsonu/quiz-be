import express from "express";
import { userRouter } from "./routes/user.route";
import cors from "cors";
import { planRouter } from "./routes/plan.route";
import { questionRouter } from "./routes/question.route";
import { quizRouter } from "./routes/quiz.route";
import { sectionRouter } from "./routes/section.route";
import { submissionRouter } from "./routes/submission.route";
import { topicRouter } from "./routes/topic.route";
import { authRouter } from "./routes/auth.route";
import { uploadRouter } from "./routes/upload.route";
import { answerRouter } from "./routes/answer.routes";
import dotenv from "dotenv";
import { trialRouter } from "./routes/trial.route";
import { runTrialExpirySweep } from "./services/trialExpiryJob";
import { billingRouter } from "./routes/billing.route";
import { stripeWebhook } from "./controllers/webhook.controller";
const app = express();
dotenv.config();
app.use(cors());
// Stripe webhooks require the raw body; mount before JSON middleware.
app.post("/billing/webhook", express.raw({ type: "application/json" }), stripeWebhook);


app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello test",
  });
});

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/plan", planRouter);
app.use("/question", questionRouter);
app.use("/quiz", quizRouter);
app.use("/section", sectionRouter);
app.use("/submission", submissionRouter);
app.use("/answer", answerRouter);
app.use("/topic", topicRouter);
app.use("/upload", uploadRouter);
app.use("/trial", trialRouter);
app.use("/billing", billingRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Lightweight cron (beta): email trial-ended users.
// In production, move this to a separate worker/cron job.
setInterval(() => {
  runTrialExpirySweep().catch((err) => console.error("Trial expiry sweep failed:", err));
}, 15 * 60_000);
