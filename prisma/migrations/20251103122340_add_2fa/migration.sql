-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'TWO_PART_ANALYSIS';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "twoPartAnalysisData" JSONB;
