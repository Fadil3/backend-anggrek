-- DropForeignKey
ALTER TABLE "categoryOnArticle" DROP CONSTRAINT "categoryOnArticle_articleId_fkey";

-- AddForeignKey
ALTER TABLE "categoryOnArticle" ADD CONSTRAINT "categoryOnArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
