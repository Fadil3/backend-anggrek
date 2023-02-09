/*
  Warnings:

  - You are about to drop the `_GlosariumToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GlosariumToUser" DROP CONSTRAINT "_GlosariumToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GlosariumToUser" DROP CONSTRAINT "_GlosariumToUser_B_fkey";

-- DropTable
DROP TABLE "_GlosariumToUser";

-- CreateTable
CREATE TABLE "UserOnGlosarium" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "glosariumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserOnGlosarium_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserOnGlosarium" ADD CONSTRAINT "UserOnGlosarium_glosariumId_fkey" FOREIGN KEY ("glosariumId") REFERENCES "Glosarium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnGlosarium" ADD CONSTRAINT "UserOnGlosarium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
