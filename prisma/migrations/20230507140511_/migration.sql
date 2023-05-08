/*
  Warnings:

  - The primary key for the `Views` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Views` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Views` table. All the data in the column will be lost.
  - The `id` column on the `Views` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[viewsId]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[viewsId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `viewsOf` to the `Views` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewsOfId` to the `Views` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Views" DROP CONSTRAINT "Views_postId_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "viewsId" INTEGER;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "viewsId" INTEGER;

-- AlterTable
ALTER TABLE "Views" DROP CONSTRAINT "Views_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "postId",
ADD COLUMN     "viewsOf" TEXT NOT NULL,
ADD COLUMN     "viewsOfId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "count" DROP DEFAULT,
ADD CONSTRAINT "Views_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Article_viewsId_key" ON "Article"("viewsId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_viewsId_key" ON "Post"("viewsId");

-- CreateIndex
CREATE INDEX "ViewsOfIndex" ON "Views"("viewsOf", "viewsOfId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_viewsId_fkey" FOREIGN KEY ("viewsId") REFERENCES "Views"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_viewsId_fkey" FOREIGN KEY ("viewsId") REFERENCES "Views"("id") ON DELETE SET NULL ON UPDATE CASCADE;
