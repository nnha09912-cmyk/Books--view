"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AlbumCard } from "@/components/album-card";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/use-studio";
import { api } from "@/lib/api-client";
import type { AlbumSummary } from "@/lib/types";

export default function AlbumsPage() {
  const { studio, loading: studioLoading } = useStudio();
  const [albums, setAlbums] = useState<AlbumSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"newest" | "name" | "photos">("newest");

  useEffect(() => {
    if (!studio) return;
    api<{ data: AlbumSummary[] }>("/api/albums").then((res) =>
      setAlbums(res.data)
    );
  }, [studio]);

  if (studioLoading || !studio) return null;

  const filtered = (albums ?? [])
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => status === "all" || a.status === status)
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "photos") return b.photoCount - a.photoCount;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  return (
    <AdminShell>
      <div className="page-head">
        <h1>Album của tôi</h1>
        <Button asChild>
          <Link href="/albums/create">
            <Plus size={16} />
            Tạo Album
          </Link>
        </Button>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            className="input"
            placeholder="Tìm theo tên album..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          style={{ width: "auto" }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang mở</option>
          <option value="expired">Hết hạn</option>
          <option value="archived">Lưu trữ</option>
          <option value="completed">Hoàn tất</option>
        </select>
        <select
          className="input"
          style={{ width: "auto" }}
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="newest">Sắp xếp: Mới nhất</option>
          <option value="name">Tên album</option>
          <option value="photos">Số ảnh</option>
        </select>
      </div>

      {albums === null ? (
        <p className="text-secondary">Đang tải...</p>
      ) : (
        <div className="album-grid">
          {filtered.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}

          <Link
            className="card flat"
            href="/albums/create"
            style={{
              borderStyle: "dashed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              color: "var(--muted-foreground)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  color: "var(--accent)",
                }}
              >
                <Plus size={20} />
              </div>
              <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                Tạo album mới
              </span>
            </div>
          </Link>
        </div>
      )}
    </AdminShell>
  );
}
