/*
  Warnings:

  - The values [boolean] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('singleCorrect', 'multipleCorrect', 'Boolean', 'paragraph', 'fillInBlankDropdown', 'tableWithOptions', 'imageMultiBoolean', 'caseStudy', 'dataInterpretation', 'readingComprehension');
ALTER TABLE "Question" ALTER COLUMN "questionType" TYPE "QuestionType_new" USING ("questionType"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;
