-- AlterTable
ALTER TABLE "studios" ADD COLUMN     "ownerName" TEXT,
ALTER COLUMN "name" DROP NOT NULL;
