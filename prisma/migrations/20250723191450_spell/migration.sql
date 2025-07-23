/*
  Warnings:

  - You are about to drop the column `isCalcutorAllowed` on the `QuizSection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSection" DROP COLUMN "isCalcutorAllowed",
ADD COLUMN     "isCalculatorAllowed" BOOLEAN NOT NULL DEFAULT false;
