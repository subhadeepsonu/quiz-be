"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("./routes/user.route");
const cors_1 = __importDefault(require("cors"));
const plan_route_1 = require("./routes/plan.route");
const question_route_1 = require("./routes/question.route");
const quiz_route_1 = require("./routes/quiz.route");
const section_route_1 = require("./routes/section.route");
const submission_route_1 = require("./routes/submission.route");
const topic_route_1 = require("./routes/topic.route");
const auth_route_1 = require("./routes/auth.route");
const upload_route_1 = require("./routes/upload.route");
const answer_routes_1 = require("./routes/answer.routes");
const dotenv_1 = __importDefault(require("dotenv"));
const trial_route_1 = require("./routes/trial.route");
const trialExpiryJob_1 = require("./services/trialExpiryJob");
const billing_route_1 = require("./routes/billing.route");
const webhook_controller_1 = require("./controllers/webhook.controller");
const app = (0, express_1.default)();
dotenv_1.default.config();
// Stripe webhooks require the raw body; mount before JSON middleware.
app.post("/billing/webhook", express_1.default.raw({ type: "application/json" }), webhook_controller_1.stripeWebhook);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.json({
        message: "Hello test",
    });
});
app.use("/user", user_route_1.userRouter);
app.use("/auth", auth_route_1.authRouter);
app.use("/plan", plan_route_1.planRouter);
app.use("/question", question_route_1.questionRouter);
app.use("/quiz", quiz_route_1.quizRouter);
app.use("/section", section_route_1.sectionRouter);
app.use("/submission", submission_route_1.submissionRouter);
app.use("/answer", answer_routes_1.answerRouter);
app.use("/topic", topic_route_1.topicRouter);
app.use("/upload", upload_route_1.uploadRouter);
app.use("/trial", trial_route_1.trialRouter);
app.use("/billing", billing_route_1.billingRouter);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// Lightweight cron (beta): email trial-ended users.
// In production, move this to a separate worker/cron job.
setInterval(() => {
    (0, trialExpiryJob_1.runTrialExpirySweep)().catch((err) => console.error("Trial expiry sweep failed:", err));
}, 15 * 60000);
