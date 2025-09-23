/*
  Warnings:

  - The values [quantitative,verbal,dataInsights,mockTests] on the enum `TestCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [topicWise,sectional,readingComprehension,criticalReasoning,rcTopicWise,rcLongSittings,crTopicWise,crLongSittings,crActLongSittings,verbalSectional,integratedReasoning,dataSufficiency,irTopicWise,irSectional,dsSectional,dataInsightsSectional] on the enum `TestSubCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TestCategory_new" AS ENUM ('QUANTITATIVE', 'VERBAL', 'DATA_INSIGHTS', 'MOCK_TESTS');
ALTER TABLE "Quiz" ALTER COLUMN "category" TYPE "TestCategory_new" USING ("category"::text::"TestCategory_new");
ALTER TYPE "TestCategory" RENAME TO "TestCategory_old";
ALTER TYPE "TestCategory_new" RENAME TO "TestCategory";
DROP TYPE "TestCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TestSubCategory_new" AS ENUM ('TOPIC_WISE', 'SECTIONAL', 'RC_TOPIC', 'RC_LONG', 'CR_TOPIC', 'CR_LONG', 'CR_ACT', 'IR_TOPIC', 'IR_SECTIONAL', 'DS', 'FULL_LENGTH');
ALTER TABLE "Quiz" ALTER COLUMN "subCategory" TYPE "TestSubCategory_new" USING ("subCategory"::text::"TestSubCategory_new");
ALTER TYPE "TestSubCategory" RENAME TO "TestSubCategory_old";
ALTER TYPE "TestSubCategory_new" RENAME TO "TestSubCategory";
DROP TYPE "TestSubCategory_old";
COMMIT;
