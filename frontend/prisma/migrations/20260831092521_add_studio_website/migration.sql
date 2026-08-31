-- CreateTable
CREATE TABLE "studio_websites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studioId" UUID NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "websiteId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studio_websites_studioId_key" ON "studio_websites"("studioId");

-- CreateIndex
CREATE INDEX "website_sections_websiteId_idx" ON "website_sections"("websiteId");

-- AddForeignKey
ALTER TABLE "studio_websites" ADD CONSTRAINT "studio_websites_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_sections" ADD CONSTRAINT "website_sections_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "studio_websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
