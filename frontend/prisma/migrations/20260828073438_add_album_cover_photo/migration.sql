-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "coverPhotoId" UUID,
ADD COLUMN     "coverPosY" INTEGER DEFAULT 50;
