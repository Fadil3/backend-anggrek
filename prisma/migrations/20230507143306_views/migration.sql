/*
  Warnings:

  - You are about to drop the column `viewsId` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `viewsId` on the `Post` table. All the data in the column will be lost.
  - The primary key for the `Views` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `viewsOf` on the `Views` table. All the data in the column will be lost.
  - You are about to drop the column `viewsOfId` on the `Views` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_viewsId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_viewsId_fkey";

-- DropIndex
DROP INDEX "Article_viewsId_key";

-- DropIndex
DROP INDEX "Post_viewsId_key";

-- DropIndex
DROP INDEX "ViewsOfIndex";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "viewsId";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "viewsId";

-- AlterTable
ALTER TABLE "Views" DROP CONSTRAINT "Views_pkey",
DROP COLUMN "viewsOf",
DROP COLUMN "viewsOfId",
ADD COLUMN     "articleId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "postId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Views_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Views_id_seq";

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Views" ADD CONSTRAINT "Views_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
