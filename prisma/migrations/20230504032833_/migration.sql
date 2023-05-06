/*
  Warnings:

  - You are about to drop the `_ArticleToArticleCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArticleToArticleCategory" DROP CONSTRAINT "_ArticleToArticleCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToArticleCategory" DROP CONSTRAINT "_ArticleToArticleCategory_B_fkey";

-- DropTable
DROP TABLE "_ArticleToArticleCategory";

-- CreateTable
CREATE TABLE "categoryOnArticle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "categoryOnArticle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "categoryOnArticle" ADD CONSTRAINT "categoryOnArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoryOnArticle" ADD CONSTRAINT "categoryOnArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ArticleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
