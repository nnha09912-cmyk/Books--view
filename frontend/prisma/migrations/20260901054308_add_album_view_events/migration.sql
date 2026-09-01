-- CreateTable
CREATE TABLE "album_view_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "albumId" UUID NOT NULL,
    "customerId" UUID,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "album_view_events_albumId_idx" ON "album_view_events"("albumId");

-- CreateIndex
CREATE INDEX "album_view_events_albumId_createdAt_idx" ON "album_view_events"("albumId", "createdAt");

-- AddForeignKey
ALTER TABLE "album_view_events" ADD CONSTRAINT "album_view_events_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_view_events" ADD CONSTRAINT "album_view_events_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
