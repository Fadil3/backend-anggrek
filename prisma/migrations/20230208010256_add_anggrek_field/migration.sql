-- DropForeignKey
ALTER TABLE "_Updater" DROP CONSTRAINT "_Updater_A_fkey";

-- CreateTable
CREATE TABLE "Anggrek" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "references" TEXT NOT NULL,

    CONSTRAINT "Anggrek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnggrekPhoto" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "path" TEXT NOT NULL,
    "anggrekId" TEXT NOT NULL,

    CONSTRAINT "AnggrekPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Anggrek" ADD CONSTRAINT "Anggrek_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnggrekPhoto" ADD CONSTRAINT "AnggrekPhoto_anggrekId_fkey" FOREIGN KEY ("anggrekId") REFERENCES "Anggrek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Updater" ADD CONSTRAINT "_Updater_A_fkey" FOREIGN KEY ("A") REFERENCES "Anggrek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
