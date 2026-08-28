-- AlterTable
ALTER TABLE "studios" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "admin_access_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actorStudioId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_access_logs_actorStudioId_idx" ON "admin_access_logs"("actorStudioId");

-- AddForeignKey
ALTER TABLE "admin_access_logs" ADD CONSTRAINT "admin_access_logs_actorStudioId_fkey" FOREIGN KEY ("actorStudioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
