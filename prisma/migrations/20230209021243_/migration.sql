/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Glosarium` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Glosarium" DROP CONSTRAINT "Glosarium_createdBy_fkey";

-- AlterTable
ALTER TABLE "Glosarium" DROP COLUMN "createdBy";

-- CreateTable
CREATE TABLE "_GlosariumToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GlosariumToUser_AB_unique" ON "_GlosariumToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GlosariumToUser_B_index" ON "_GlosariumToUser"("B");

-- AddForeignKey
ALTER TABLE "_GlosariumToUser" ADD CONSTRAINT "_GlosariumToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Glosarium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GlosariumToUser" ADD CONSTRAINT "_GlosariumToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
