/*
  Warnings:

  - The values [Boolean] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `answer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `answerImg` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `correctOption` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `quizSectionId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `sectionId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOption` on the `SubmittedAnswer` table. All the data in the column will be lost.
  - You are about to drop the `QuizSection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[submissionId,questionId]` on the table `SubmittedAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionCategory` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestCategory" AS ENUM ('quantitative', 'verbal', 'dataInsights', 'mockTests');

-- CreateEnum
CREATE TYPE "TestSubCategory" AS ENUM ('topicWise', 'sectional', 'readingComprehension', 'criticalReasoning', 'rcTopicWise', 'rcLongSittings', 'crTopicWise', 'crLongSittings', 'crActLongSittings', 'verbalSectional', 'integratedReasoning', 'dataSufficiency', 'irTopicWise', 'irSectional', 'dsSectional', 'dataInsightsSectional');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('pending', 'inProgress', 'completed');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('quantitative', 'verbal', 'dataInsights', 'general');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('easy', 'medium', 'hard');

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('singleCorrect', 'multipleCorrect', 'boolean', 'paragraph', 'fillInBlankDropdown', 'tableWithOptions', 'imageMultiBoolean', 'caseStudy', 'dataInterpretation', 'readingComprehension');
ALTER TABLE "Question" ALTER COLUMN "questionType" TYPE "QuestionType_new" USING ("questionType"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizSectionId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_topicId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSection" DROP CONSTRAINT "QuizSection_quizId_fkey";

-- DropForeignKey
ALTER TABLE "SubmittedAnswer" DROP CONSTRAINT "SubmittedAnswer_submissionId_fkey";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "answer",
DROP COLUMN "answerImg",
DROP COLUMN "correctOption",
DROP COLUMN "question",
DROP COLUMN "quizSectionId",
ADD COLUMN     "answerImage" TEXT,
ADD COLUMN     "caseStudyData" JSONB,
ADD COLUMN     "correctOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "questionCategory" "QuestionCategory" NOT NULL,
ADD COLUMN     "questionText" TEXT NOT NULL,
ADD COLUMN     "quizId" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isDeleted" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "sectionId",
DROP COLUMN "topicId",
DROP COLUMN "type",
ADD COLUMN     "category" "TestCategory" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "subCategory" "TestSubCategory",
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "score",
ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "flaggedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxScore" DOUBLE PRECISION,
ADD COLUMN     "percentage" DOUBLE PRECISION,
ADD COLUMN     "timeSpentSec" INTEGER,
ADD COLUMN     "totalScore" DOUBLE PRECISION,
ADD COLUMN     "unansweredCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SubmittedAnswer" DROP COLUMN "selectedOption",
ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "QuizSection";

-- DropEnum
DROP TYPE "QuizType";

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");

-- CreateIndex
CREATE INDEX "Question_questionCategory_idx" ON "Question"("questionCategory");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Question_isDeleted_idx" ON "Question"("isDeleted");

-- CreateIndex
CREATE INDEX "Quiz_category_subCategory_idx" ON "Quiz"("category", "subCategory");

-- CreateIndex
CREATE INDEX "Quiz_isDeleted_idx" ON "Quiz"("isDeleted");

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
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmittedAnswer" ADD CONSTRAINT "SubmittedAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
