"use client";

import { useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { api, ApiError } from "@/lib/api-client";
import { ALBUM_HERO_COMPONENTS } from "@/components/album-templates";
import { DEFAULT_ALBUM_TEMPLATE, isAlbumTemplateId } from "@/lib/album-templates";
import type { PublicAlbumInfo } from "@/lib/types";

export default function AlbumLandingPage({
  params,
}: {
  params: { linkId: string };
}) {
  const [album, setAlbum] = useState<PublicAlbumInfo | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const selectIntent = useSearchParams().get("intent") === "select";

  useEffect(() => {
    api<PublicAlbumInfo>(`/api/public/album/${params.linkId}`)
      .then(setAlbum)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundState(true);
        else if (err instanceof ApiError && err.status === 403) setClosedMessage(err.message);
      });
  }, [params.linkId]);

  if (notFoundState) notFound();
  if (closedMessage) {
    return (
      <>
        <AppHeader studioName="Books View" />
        <div className="empty-state" style={{ minHeight: "60vh" }}>
          <h3>Album đã đóng</h3>
          <p className="text-secondary">{closedMessage}</p>
        </div>
      </>
    );
  }
  if (!album) return null;

  const templateId = isAlbumTemplateId(album.template) ? album.template : DEFAULT_ALBUM_TEMPLATE;
  const Hero = ALBUM_HERO_COMPONENTS[templateId];

  return (
    <>
      <AppHeader studioName="Books View" brandHref={`/album/${params.linkId}`} />
      <Hero
        linkId={params.linkId}
        albumName={album.name}
        description={album.description}
        photoCount={album.photoCount}
        expiryDate={album.expiryDate}
        eventDate={album.eventDate}
        ctaHref={`/album/${params.linkId}/gallery${selectIntent ? "?intent=select" : ""}`}
        ctaLabel={selectIntent ? "Bắt đầu chọn ảnh" : "Bắt đầu xem ảnh"}
        coverPhotoUrl={album.coverPhotoUrl}
        coverPosY={album.coverPosY}
      />

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <p className="text-sm">
          Có thắc mắc? Liên hệ {album.studioName} — 0909 123 456 ·
          hi@booksview.vn
        </p>
      </footer>
    </>
  );
}
