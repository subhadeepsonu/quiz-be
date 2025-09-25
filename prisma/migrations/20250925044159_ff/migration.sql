/*
  Warnings:

  - You are about to drop the column `questionCategory` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SectionEnum" AS ENUM ('VERBAL_REASONING', 'QUANTITATIVE_REASONING', 'DATA_INSIGHTS', 'INTEGRATED_REASONING');

-- CreateEnum
CREATE TYPE "TopicEnum" AS ENUM ('READING_COMPREHENSION', 'STRENGTH', 'WEAKEN', 'FLAW', 'PARADOX', 'INFERENCE', 'ASSUMPTIONS', 'ARITHMETIC', 'COORDINATE_GEOMETRY', 'PROBABILITY', 'PERMUTATION_COMBINATION', 'ALGEBRA', 'NUMBER_PROPERTIES', 'MODS_INEQUALITIES', 'STATISTICS', 'GENERAL_WORD_PROBLEMS', 'DATA_SUFFICIENCY', 'MATH_RELATED', 'NON_MATH_RELATED', 'GRAPHICAL_INTERPRETATION', 'TABLE_ANALYSIS', 'MULTI_SOURCE_REASONING', 'TWO_PART_ANALYSTS');

-- DropIndex
DROP INDEX "Question_questionCategory_idx";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "questionCategory",
DROP COLUMN "tags",
ADD COLUMN     "questionSection" "SectionEnum",
ADD COLUMN     "questionTopic" "TopicEnum";
