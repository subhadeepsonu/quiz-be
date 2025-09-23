-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "sectionId" TEXT,
ADD COLUMN     "topicId" TEXT;

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "questionId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "questionId" TEXT;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
