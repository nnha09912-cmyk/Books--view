"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { StatusPill } from "@/components/system-owner/status-pill";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api } from "@/lib/api-client";

interface OwnerUserRow {
  id: string;
  name: string;
  email: string;
  albumCount: number;
  lastLoginAt: string | null;
  status: "Active" | "Suspended";
}

export default function SystemOwnerUsersPage() {
  const { owner, loading } = useSystemOwner();
  const [users, setUsers] = useState<OwnerUserRow[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!owner) return;
    api<{ data: OwnerUserRow[] }>("/api/admin/users").then((res) => setUsers(res.data));
  }, [owner]);

  if (loading || !owner) return null;

  const q = query.trim().toLowerCase();
  const rows = (users ?? []).filter(
    (u) => !q || [u.name, u.email].some((f) => f.toLowerCase().includes(q))
  );

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Người dùng</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Thông tin đăng nhập được giới hạn theo nhu cầu quản trị
          </p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <Search size={16} />
            <input
              className="input"
              placeholder="Tìm tên, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Tên</th>
                <th className="text-left font-medium px-4 py-3">Email</th>
                <th className="text-left font-medium px-4 py-3">Album</th>
                <th className="text-left font-medium px-4 py-3">Đăng nhập cuối</th>
                <th className="text-left font-medium px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users === null ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Không tìm thấy kết quả phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/system-owner/users/${u.id}`}
                        className="hover:underline"
                        style={{ color: "var(--accent)", fontWeight: 600 }}
                      >
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{u.albumCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={u.status === "Active" ? "success" : "danger"}>
                        {u.status}
                      </StatusPill>
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
