"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Globe, ExternalLink, Pencil, Heart, Star } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AlbumCard } from "@/components/album-card";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/use-studio";
import { api } from "@/lib/api-client";
import { mockActivity, pravatar } from "@/lib/mock-data";
import { studioDisplayName } from "@/lib/studio-name";
import { WEBSITE_TEMPLATES, EXPERIMENTAL_WEBSITE_TEMPLATES } from "@/lib/website-templates";
import type { AlbumSummary } from "@/lib/types";

const ALL_WEBSITE_TEMPLATES = [...WEBSITE_TEMPLATES, ...EXPERIMENTAL_WEBSITE_TEMPLATES];

/** Surfaces the Website Studio module right on the overview — before this,
 * a Studio had no visibility into "your site is live at guikhach.com/{slug}
 * using template X" unless they went digging in Cài đặt, which made the
 * two products (Album Proofing + Website Studio) feel bolted together
 * rather than one app. */
function WebsiteStudioCard() {
  const [state, setState] = useState<{ slug: string; templateId: string } | null>(null);

  useEffect(() => {
    api<{ slug: string; templateId: string }>("/api/website").then(setState);
  }, []);

  if (!state) return null;

  const template = ALL_WEBSITE_TEMPLATES.find((t) => t.value === state.templateId);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/${state.slug}`;

  return (
    <div className="card mb-md">
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="flex items-center gap-sm">
          <Globe size={16} className="text-secondary" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Website Studio</span>
        </div>
        <div>
          <p style={{ fontSize: 13, margin: 0 }}>{template?.label ?? state.templateId}</p>
          <span className="text-sm mono">{link}</span>
        </div>
        <div className="flex gap-sm">
          <Button asChild variant="secondary" size="sm">
            <a href={link} target="_blank" rel="noreferrer">
              <ExternalLink size={13} />
              Xem web con
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/settings?tab=website">
              <Pencil size={13} />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { studio, loading: studioLoading } = useStudio();
  const [albums, setAlbums] = useState<AlbumSummary[] | null>(null);

  useEffect(() => {
    if (!studio) return;
    api<{ data: AlbumSummary[] }>("/api/albums").then((res) =>
      setAlbums(res.data)
    );
  }, [studio]);

  if (studioLoading || !studio) return null;

  const totalPhotos = albums?.reduce((sum, a) => sum + a.photoCount, 0) ?? 0;
  const totalViews = albums?.reduce((sum, a) => sum + a.viewCount, 0) ?? 0;
  const totalLikes = albums?.reduce((sum, a) => sum + a.totalLikes, 0) ?? 0;
  const totalStars = albums?.reduce((sum, a) => sum + a.totalStars, 0) ?? 0;

  return (
    <AdminShell>
      <div className="page-head">
        <div>
          <h1>Chào buổi sáng, {studioDisplayName(studio)} 👋</h1>
          <p className="text-secondary mb-sm" style={{ marginTop: 6 }}>
            Đây là tổng quan hoạt động studio của bạn.
          </p>
        </div>
        <Button asChild>
          <Link href="/albums/create">
            <Plus size={16} />
            Tạo Album
          </Link>
        </Button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="text-sm">Tổng album</span>
          <div className="num">{albums?.length ?? "—"}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Tổng ảnh</span>
          <div className="num">{totalPhotos.toLocaleString("vi-VN")}</div>
          <span className="text-sm">trong {albums?.length ?? 0} album</span>
        </div>
        <div className="stat-card">
          <span className="text-sm">Lượt truy cập link</span>
          <div className="num">{totalViews.toLocaleString("vi-VN")}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Lượt Tim / Sao</span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginTop: 4,
              fontFamily: '"UTM Centur", var(--font-heading)',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <span className="flex items-center gap-sm">
              <Heart size={16} fill="currentColor" />
              {totalLikes.toLocaleString("vi-VN")}
            </span>
            <span className="flex items-center gap-sm">
              <Star size={16} fill="currentColor" />
              {totalStars.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section>
          <div className="flex justify-between items-center mb-md">
            <h2>Album gần đây</h2>
            <Link
              href="/albums"
              className="text-sm"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              Xem tất cả →
            </Link>
          </div>
          {albums === null ? (
            <p className="text-secondary">Đang tải...</p>
          ) : albums.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có album nào.</p>
            </div>
          ) : (
            <div className="album-grid">
              {albums.slice(0, 4).map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          )}
        </section>

        <section>
          <WebsiteStudioCard />

          <h2 className="mb-md">Hoạt động mới</h2>
          <div className="card">
            <div
              className="card-body"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {mockActivity.map((item, i) => (
                <div className="flex gap-sm" key={i}>
                  <Image
                    className="avatar"
                    style={{ width: 32, height: 32 }}
                    src={pravatar(item.avatarSeed)}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                  />
                  <div>
                    <p style={{ fontSize: 13 }}>{item.text}</p>
                    <span className="text-sm">{item.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
