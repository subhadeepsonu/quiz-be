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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
app.use("/topic", topic_route_1.topicRouter);
app.use("/upload", upload_route_1.uploadRouter);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
