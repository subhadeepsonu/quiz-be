-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'paragraph';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "paragraphText" TEXT;
