import express from "express";
import { userRouter } from "./routes/user.route";
import cors from "cors";
import { planRouter } from "./routes/plan.route";
import { questionRouter } from "./routes/question.route";
import { quiz_sectionRouter } from "./routes/quiz_section.route";
import { quizRouter } from "./routes/quiz.route";
import { sectionRouter } from "./routes/section.route";
import { submissionRouter } from "./routes/submission.route";
import { topicRouter } from "./routes/topic.route";
import { authRouter } from "./routes/auth.route";
import { uploadRouter } from "./routes/upload.route";
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Hello test",
  });
});

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/plan", planRouter);
app.use("/question", questionRouter);
app.use("/quiz-section", quiz_sectionRouter);
app.use("/quiz", quizRouter);
app.use("/section", sectionRouter);
app.use("/submission", submissionRouter);
app.use("/topic", topicRouter);
app.use("/upload", uploadRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
