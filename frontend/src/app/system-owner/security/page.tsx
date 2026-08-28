"use client";

import { OwnerShell } from "@/components/system-owner/owner-shell";
import { useSystemOwner } from "@/lib/use-system-owner";
import { securityPermissions } from "@/lib/system-owner-mock-data";

export default function SystemOwnerSecurityPage() {
  const { owner, loading } = useSystemOwner();
  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Bảo mật</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Các quyền nhạy cảm được tách riêng
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {securityPermissions.map((perm) => (
          <div className="stat-card" key={perm.label}>
            <span className="text-sm">{perm.label}</span>
            <div
              className="num"
              style={{
                fontSize: 22,
                color: perm.enabled ? "var(--success)" : "var(--muted-foreground)",
              }}
            >
              {perm.enabled ? "ON" : "OFF"}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-body lg">
          <h3 className="mb-sm">Permission model</h3>
          <p className="text-secondary text-sm font-mono">
            moderation.preview • moderation.original • moderation.download • audit.view
          </p>
        </div>
      </div>
    </OwnerShell>
  );
}
