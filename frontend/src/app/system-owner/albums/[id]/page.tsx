"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api, ApiError } from "@/lib/api-client";

interface OwnerAlbumPhoto {
  id: string;
  filename: string;
  thumbnailUrl: string | null;
  likeCount: number;
  starCount: number;
}

interface OwnerAlbumDetail {
  id: string;
  name: string;
  status: string;
  expiryDate: string | null;
  photoCount: number;
  customerCount: number;
  studio: { id: string; name: string; email: string };
  photos: OwnerAlbumPhoto[];
}

export default function SystemOwnerAlbumDetailPage({ params }: { params: { id: string } }) {
  const { owner, loading } = useSystemOwner();
  const [album, setAlbum] = useState<OwnerAlbumDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!owner) return;
    api<OwnerAlbumDetail>(`/api/admin/albums/${params.id}`)
      .then(setAlbum)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [owner, params.id]);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <Link
        href={album ? `/system-owner/users/${album.studio.id}` : "/system-owner/albums"}
        className="inline-flex items-center gap-sm text-sm mb-md"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft size={14} />
        Quay lại
      </Link>

      {notFound && (
        <div className="empty-state">
          <h3>Không tìm thấy album</h3>
        </div>
      )}

      {album && (
        <>
          <div className="page-head">
            <div>
              <h1>{album.name}</h1>
              <p className="text-secondary" style={{ marginTop: 6 }}>
                Studio: {album.studio.name} ({album.studio.email}) • {album.photoCount} ảnh •{" "}
                {album.customerCount} khách
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-sm mb-lg text-sm"
            style={{
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              borderRadius: "var(--radius-md)",
              padding: 12,
            }}
          >
            Chế độ chỉ xem — dành cho hỗ trợ/kiểm tra sự cố. Không thể sửa hoặc xoá dữ liệu từ đây.
            Lượt xem này đã được ghi Audit Log.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {album.photos.map((p) => (
              <div key={p.id} className="card">
                <div
                  style={{
                    height: 120,
                    background: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--muted-foreground)",
                    borderTopLeftRadius: "var(--radius-md)",
                    borderTopRightRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnailUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOff size={20} />
                  )}
                </div>
                <div className="card-body" style={{ padding: 8 }}>
                  <span className="text-sm">
                    ♥ {p.likeCount} · ⭐ {p.starCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </OwnerShell>
  );
}
