-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "TestCategory" AS ENUM ('QUANTITATIVE', 'VERBAL', 'DATA_INSIGHTS', 'MOCK_TESTS');

-- CreateEnum
CREATE TYPE "TestSubCategory" AS ENUM ('TOPIC_WISE', 'SECTIONAL', 'RC_TOPIC', 'RC_LONG', 'CR_TOPIC', 'CR_LONG', 'CR_ACT', 'IR_TOPIC', 'IR_SECTIONAL', 'DS', 'FULL_LENGTH');

-- CreateEnum
CREATE TYPE "SectionEnum" AS ENUM ('VERBAL_REASONING', 'QUANTITATIVE_REASONING', 'DATA_INSIGHTS', 'INTEGRATED_REASONING');

-- CreateEnum
CREATE TYPE "TopicEnum" AS ENUM ('READING_COMPREHENSION', 'STRENGTH', 'WEAKEN', 'FLAW', 'PARADOX', 'INFERENCE', 'ASSUMPTIONS', 'ARITHMETIC', 'COORDINATE_GEOMETRY', 'PROBABILITY', 'PERMUTATION_COMBINATION', 'ALGEBRA', 'NUMBER_PROPERTIES', 'MODS_INEQUALITIES', 'STATISTICS', 'GENERAL_WORD_PROBLEMS', 'DATA_SUFFICIENCY', 'MATH_RELATED', 'NON_MATH_RELATED', 'GRAPHICAL_INTERPRETATION', 'TABLE_ANALYSIS', 'MULTI_SOURCE_REASONING', 'TWO_PART_ANALYSTS');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('pending', 'inProgress', 'completed');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'expired', 'cancelled', 'failed');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('inProgress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('singleCorrect', 'multipleCorrect', 'Boolean', 'paragraph', 'fillInBlankDropdown', 'tableWithOptions', 'imageMultiBoolean', 'caseStudy', 'dataInterpretation', 'readingComprehension', 'TWO_PART_ANALYSIS');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('quantitative', 'verbal', 'dataInsights', 'general');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalPaymentId" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TestCategory" NOT NULL,
    "subCategory" "TestSubCategory",
    "duration" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "image" TEXT,
    "questionType" "QuestionType" NOT NULL,
    "questionSection" "SectionEnum",
    "questionTopic" "TopicEnum",
    "paragraphText" TEXT,
    "optionA" TEXT,
    "optionB" TEXT,
    "optionC" TEXT,
    "optionD" TEXT,
    "optionE" TEXT,
    "correctOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "twoPartAnalysisData" JSONB,
    "explanation" TEXT,
    "answerImage" TEXT,
    "tableData" JSONB,
    "caseStudyData" JSONB,
    "blankOptions" JSONB,
    "subQuestions" JSONB,
    "points" INTEGER NOT NULL DEFAULT 1,
    "quizId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,
    "topicId" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'inProgress',
    "totalScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "timeSpentSec" INTEGER,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "unansweredCount" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmittedAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCorrect" BOOLEAN,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "timeTakenSec" INTEGER,
    "visited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubmittedAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Quiz_category_subCategory_idx" ON "Quiz"("category", "subCategory");

-- CreateIndex
CREATE INDEX "Quiz_isDeleted_idx" ON "Quiz"("isDeleted");

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Question_isDeleted_idx" ON "Question"("isDeleted");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_quizId_idx" ON "Submission"("quizId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_startedAt_idx" ON "Submission"("startedAt");

-- CreateIndex
CREATE INDEX "SubmittedAnswer_submissionId_idx" ON "SubmittedAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "SubmittedAnswer_questionId_idx" ON "SubmittedAnswer"("questionId");

-- CreateIndex
CREATE INDEX "SubmittedAnswer_isCorrect_idx" ON "SubmittedAnswer"("isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "SubmittedAnswer_submissionId_questionId_key" ON "SubmittedAnswer"("submissionId", "questionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedAnswer" ADD CONSTRAINT "SubmittedAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedAnswer" ADD CONSTRAINT "SubmittedAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
