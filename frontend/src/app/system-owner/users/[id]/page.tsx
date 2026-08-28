"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { StatusPill } from "@/components/system-owner/status-pill";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api, ApiError } from "@/lib/api-client";

interface OwnerUserAlbum {
  id: string;
  name: string;
  photoCount: number;
  status: string;
  expiryDate: string | null;
}

interface OwnerUserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "Active" | "Suspended";
  lastLoginAt: string | null;
  createdAt: string;
  albums: OwnerUserAlbum[];
}

export default function SystemOwnerUserDetailPage({ params }: { params: { id: string } }) {
  const { owner, loading } = useSystemOwner();
  const [detail, setDetail] = useState<OwnerUserDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!owner) return;
    api<OwnerUserDetail>(`/api/admin/users/${params.id}`)
      .then(setDetail)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [owner, params.id]);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <Link
        href="/system-owner/users"
        className="inline-flex items-center gap-sm text-sm mb-md"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft size={14} />
        Quay lại Người dùng
      </Link>

      {notFound && (
        <div className="empty-state">
          <h3>Không tìm thấy người dùng</h3>
        </div>
      )}

      {detail && (
        <>
          <div className="page-head">
            <div>
              <h1>{detail.name}</h1>
              <p className="text-secondary" style={{ marginTop: 6 }}>
                {detail.email} {detail.phone ? `• ${detail.phone}` : ""}
              </p>
            </div>
            <StatusPill tone={detail.status === "Active" ? "success" : "danger"}>
              {detail.status}
            </StatusPill>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="stat-card">
              <span className="text-sm">Số Album</span>
              <div className="num">{detail.albums.length}</div>
            </div>
            <div className="stat-card">
              <span className="text-sm">Đăng nhập gần nhất</span>
              <div className="num" style={{ fontSize: 18 }}>
                {detail.lastLoginAt ? new Date(detail.lastLoginAt).toLocaleString("vi-VN") : "—"}
              </div>
            </div>
            <div className="stat-card">
              <span className="text-sm">Ngày tạo</span>
              <div className="num" style={{ fontSize: 18 }}>
                {new Date(detail.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="mb-sm">Albums</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground">
                    <th className="text-left font-medium px-4 py-3">Album</th>
                    <th className="text-left font-medium px-4 py-3">Ảnh</th>
                    <th className="text-left font-medium px-4 py-3">Trạng thái</th>
                    <th className="text-left font-medium px-4 py-3">Hết hạn</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.albums.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        Chưa có album nào.
                      </td>
                    </tr>
                  ) : (
                    detail.albums.map((a) => (
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
                        <td className="px-4 py-3">{a.photoCount}</td>
                        <td className="px-4 py-3">{a.status}</td>
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
        </>
      )}
    </OwnerShell>
  );
}
