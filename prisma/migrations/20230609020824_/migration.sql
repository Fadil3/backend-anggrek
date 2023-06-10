-- AlterTable
ALTER TABLE "Glosarium" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proposeTo" TEXT DEFAULT '';
