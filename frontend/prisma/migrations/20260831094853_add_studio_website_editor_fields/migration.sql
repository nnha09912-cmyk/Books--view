/*
  Warnings:

  - You are about to drop the column `cover` on the `studios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "showOnWebsite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "studios" DROP COLUMN "cover",
ADD COLUMN     "coverPhotoId" UUID;
