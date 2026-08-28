"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api } from "@/lib/api-client";

interface OverviewStats {
  activeStudios: number;
  totalUsers: number;
}

export default function SystemOwnerOverviewPage() {
  const { owner, loading } = useSystemOwner();
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    if (!owner) return;
    api<OverviewStats>("/api/admin/overview").then(setStats);
  }, [owner]);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Quản trị nội bộ • Chỉ dành cho System Owner
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="text-sm">Studio đang hoạt động</span>
          <div className="num">{stats ? stats.activeStudios : "—"}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Người dùng</span>
          <div className="num">{stats ? stats.totalUsers.toLocaleString("vi-VN") : "—"}</div>
          <span className="text-sm">Customer + Studio</span>
        </div>
        <div className="stat-card">
          <span className="text-sm">Ảnh chờ kiểm duyệt</span>
          <div className="num text-muted-foreground" style={{ fontSize: 22 }}>
            Chưa kết nối
          </div>
          <span className="text-sm">Cần tích hợp Content Safety Scan</span>
        </div>
        <div className="stat-card">
          <span className="text-sm">Security Alerts</span>
          <div className="num text-muted-foreground" style={{ fontSize: 22 }}>
            Chưa kết nối
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body lg">
          <h3 className="mb-sm">Nguyên tắc quyền riêng tư</h3>
          <p className="text-secondary text-sm">
            System Owner chỉ xem nội dung khi có mục đích kiểm duyệt/xử lý sự cố. Truy cập ảnh và
            dữ liệu đều được ghi Audit Log.
          </p>
          <div
            className="flex items-start gap-sm mt-md text-sm"
            style={{
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              borderRadius: "var(--radius-md)",
              padding: 12,
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent)" }} />
            <span>
              Không có quyền &quot;xem tất cả ảnh&quot; mặc định. Quyền Moderation được cấp riêng và
              có thể revoke.
            </span>
          </div>
        </div>
      </div>
    </OwnerShell>
  );
}
