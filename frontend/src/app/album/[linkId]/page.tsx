"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { picsum } from "@/lib/mock-data";
import { api, ApiError } from "@/lib/api-client";
import type { PublicAlbumInfo } from "@/lib/types";

export default function AlbumLandingPage({
  params,
}: {
  params: { linkId: string };
}) {
  const [album, setAlbum] = useState<PublicAlbumInfo | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    api<PublicAlbumInfo>(`/api/public/album/${params.linkId}`)
      .then(setAlbum)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundState(true);
      });
  }, [params.linkId]);

  if (notFoundState) notFound();
  if (!album) return null;

  return (
    <>
      <AppHeader studioName="Books View" brandHref={`/album/${params.linkId}`} />
      <div className="landing-hero">
        <div className="bg">
          <Image
            src={picsum(`hero-${params.linkId}`, 1600, 1000)}
            alt=""
            fill
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="content">
          <span className="eyebrow">Album ảnh cưới</span>
          <h1>{album.name}</h1>
          <p className="desc">
            {album.photoCount} khoảnh khắc đã sẵn sàng. Chọn những tấm ảnh anh
            chị yêu thích nhất — tim ♥ để in album, sao ⭐ để tải về lưu giữ
            riêng.
          </p>
          <Button
            asChild
            size="lg"
            style={{ width: "auto", padding: "0 40px" }}
          >
            <Link href={`/album/${params.linkId}/gallery`}>
              Bắt đầu xem ảnh →
            </Link>
          </Button>
          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,.55)", marginTop: 16 }}
          >
            {album.expiryDate
              ? `Hạn chọn ảnh: ${new Date(album.expiryDate).toLocaleDateString("vi-VN")} · `
              : ""}
            Không cần đăng nhập
          </p>
        </div>
      </div>

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
