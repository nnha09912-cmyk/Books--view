-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "downloadEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "downloadExpiryDate" TIMESTAMP(3),
ADD COLUMN     "downloadPasswordHash" TEXT;
