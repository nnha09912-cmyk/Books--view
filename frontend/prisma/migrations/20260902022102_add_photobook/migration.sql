-- CreateTable
CREATE TABLE "photobooks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "studioId" UUID NOT NULL,
    "shareId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "albumType" TEXT NOT NULL,
    "pageMode" TEXT NOT NULL,
    "cover" JSONB,
    "pages" JSONB NOT NULL,
    "pageWidthPx" INTEGER NOT NULL,
    "pageHeightPx" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photobooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photobooks_shareId_key" ON "photobooks"("shareId");

-- CreateIndex
CREATE INDEX "photobooks_studioId_idx" ON "photobooks"("studioId");

-- AddForeignKey
ALTER TABLE "photobooks" ADD CONSTRAINT "photobooks_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
