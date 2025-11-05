-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "questionText" DROP NOT NULL;

-- DropEnum
DROP TYPE "QuestionCategory";
