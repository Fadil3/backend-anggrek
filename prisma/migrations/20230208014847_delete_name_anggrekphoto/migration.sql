/*
  Warnings:

  - You are about to drop the column `name` on the `AnggrekPhoto` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AnggrekPhoto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnggrekPhoto" DROP COLUMN "name",
DROP COLUMN "updatedAt";
