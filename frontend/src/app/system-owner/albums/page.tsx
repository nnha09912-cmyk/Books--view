"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { StatusPill } from "@/components/system-owner/status-pill";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api } from "@/lib/api-client";

interface OwnerAlbumRow {
  id: string;
  name: string;
  studio: string;
  photoCount: number;
  status: string;
  expiryDate: string | null;
}

export default function SystemOwnerAlbumsPage() {
  const { owner, loading } = useSystemOwner();
  const [albums, setAlbums] = useState<OwnerAlbumRow[] | null>(null);

  useEffect(() => {
    if (!owner) return;
    api<{ data: OwnerAlbumRow[] }>("/api/admin/albums").then((res) => setAlbums(res.data));
  }, [owner]);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Albums</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Tổng quan nền tảng, không thay thế quản lý Album của Studio
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Album</th>
                <th className="text-left font-medium px-4 py-3">Studio</th>
                <th className="text-left font-medium px-4 py-3">Ảnh</th>
                <th className="text-left font-medium px-4 py-3">Trạng thái</th>
                <th className="text-left font-medium px-4 py-3">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {albums === null ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : albums.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có album nào.
                  </td>
                </tr>
              ) : (
                albums.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/system-owner/albums/${a.id}`}
                        className="hover:underline"
                        style={{ color: "var(--accent)", fontWeight: 600 }}
                      >
                        {a.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.studio}</td>
                    <td className="px-4 py-3">{a.photoCount.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={a.status === "closed" ? "danger" : "success"}>
                        {a.status}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.expiryDate ? new Date(a.expiryDate).toLocaleDateString("vi-VN") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </OwnerShell>
  );
}
