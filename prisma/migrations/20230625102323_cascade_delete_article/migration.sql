-- DropForeignKey
ALTER TABLE "Infographic" DROP CONSTRAINT "Infographic_articleId_fkey";

-- AddForeignKey
ALTER TABLE "Infographic" ADD CONSTRAINT "Infographic_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
