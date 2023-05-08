/*
  Warnings:

  - You are about to drop the `Views` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Views" DROP CONSTRAINT "Views_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Views" DROP CONSTRAINT "Views_postId_fkey";

-- DropTable
DROP TABLE "Views";
