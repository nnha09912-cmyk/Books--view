"use client";

import { useEffect, useState } from "react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { useSystemOwner } from "@/lib/use-system-owner";
import { api } from "@/lib/api-client";

interface AuditRow {
  id: string;
  time: string;
  actor: string;
  actorEmail: string;
  action: string;
  resource: string;
}

export default function SystemOwnerAuditPage() {
  const { owner, loading } = useSystemOwner();
  const [rows, setRows] = useState<AuditRow[] | null>(null);

  useEffect(() => {
    if (!owner) return;
    api<{ data: AuditRow[] }>("/api/admin/audit").then((res) => setRows(res.data));
  }, [owner]);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Audit Log</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Mọi thao tác nhạy cảm đều phải có dấu vết
          </p>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Thời gian</th>
                <th className="text-left font-medium px-4 py-3">Người thực hiện</th>
                <th className="text-left font-medium px-4 py-3">Hành động</th>
                <th className="text-left font-medium px-4 py-3">Resource</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Đang tải...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có hoạt động nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(row.time).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      {row.actor}
                      <div className="text-sm text-muted-foreground">{row.actorEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                    <td className="px-4 py-3">{row.resource}</td>
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
