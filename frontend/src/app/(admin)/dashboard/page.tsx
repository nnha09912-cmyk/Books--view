"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AlbumCard } from "@/components/album-card";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/use-studio";
import { api } from "@/lib/api-client";
import { mockActivity, pravatar } from "@/lib/mock-data";
import type { AlbumSummary } from "@/lib/types";

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
  const totalCustomers =
    albums?.reduce((sum, a) => sum + a.customerCount, 0) ?? 0;

  return (
    <AdminShell>
      <div className="page-head">
        <div>
          <h1>Chào buổi sáng, {studio.name} 👋</h1>
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
          <span className="text-sm">Khách hàng</span>
          <div className="num">{totalCustomers}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Lượt tim / sao</span>
          <div className="num">—</div>
          <span className="text-sm">Xem chi tiết trong từng album</span>
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
