/*
  Warnings:

  - You are about to drop the `ArticleImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArticleImage" DROP CONSTRAINT "ArticleImage_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "infographic" SET DEFAULT '';

-- DropTable
DROP TABLE "ArticleImage";

-- CreateTable
CREATE TABLE "imageUpload" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "imageUpload_pkey" PRIMARY KEY ("id")
);
