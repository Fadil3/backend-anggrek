/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Anggrek` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Anggrek" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Anggrek_slug_key" ON "Anggrek"("slug");
