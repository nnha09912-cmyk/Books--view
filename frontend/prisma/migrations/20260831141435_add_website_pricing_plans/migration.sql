-- CreateTable
CREATE TABLE "website_pricing_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studioId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "features" JSONB,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "website_pricing_plans_studioId_idx" ON "website_pricing_plans"("studioId");

-- AddForeignKey
ALTER TABLE "website_pricing_plans" ADD CONSTRAINT "website_pricing_plans_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
