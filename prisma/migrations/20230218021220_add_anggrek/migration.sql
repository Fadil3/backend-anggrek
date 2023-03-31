/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Anggrek` table. All the data in the column will be lost.
  - You are about to drop the `_Updater` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Anggrek" DROP CONSTRAINT "Anggrek_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "_Updater" DROP CONSTRAINT "_Updater_A_fkey";

-- DropForeignKey
ALTER TABLE "_Updater" DROP CONSTRAINT "_Updater_B_fkey";

-- AlterTable
ALTER TABLE "Anggrek" DROP COLUMN "createdBy",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "_Updater";

-- CreateTable
CREATE TABLE "UserOnAnggrek" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anggrekId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserOnAnggrek_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserOnAnggrek" ADD CONSTRAINT "UserOnAnggrek_anggrekId_fkey" FOREIGN KEY ("anggrekId") REFERENCES "Anggrek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnAnggrek" ADD CONSTRAINT "UserOnAnggrek_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
