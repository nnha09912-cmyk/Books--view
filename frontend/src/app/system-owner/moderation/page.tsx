"use client";

import { useState } from "react";
import { ImageOff, ShieldAlert } from "lucide-react";
import { OwnerShell } from "@/components/system-owner/owner-shell";
import { StatusPill } from "@/components/system-owner/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { moderationQueue, type ModerationPhoto } from "@/lib/system-owner-mock-data";
import { useSystemOwner } from "@/lib/use-system-owner";

export default function SystemOwnerModerationPage() {
  const { owner, loading } = useSystemOwner();
  const [active, setActive] = useState<ModerationPhoto | null>(null);

  if (loading || !owner) return null;

  return (
    <OwnerShell>
      <div className="page-head">
        <div>
          <h1>Kiểm duyệt nội dung</h1>
          <p className="text-secondary" style={{ marginTop: 6 }}>
            Chỉ hiển thị ảnh nằm trong hàng đợi kiểm tra
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {moderationQueue.map((photo) => (
          <div key={photo.id} className="card">
            <div
              style={{
                height: 160,
                background: "var(--muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted-foreground)",
                borderTopLeftRadius: "var(--radius-md)",
                borderTopRightRadius: "var(--radius-md)",
              }}
            >
              <ImageOff size={28} />
            </div>
            <div className="card-body">
              <b style={{ display: "block", fontSize: 13 }}>Photo #{photo.id}</b>
              <span className="text-sm">Album: {photo.album}</span>
              <div className="flex items-center justify-between mt-sm">
                <StatusPill tone="warning">{photo.label}</StatusPill>
                <Button variant="ghost" size="sm" onClick={() => setActive(photo)}>
                  Xem
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderation Preview</DialogTitle>
          </DialogHeader>
          {active && (
            <>
              <p className="text-secondary text-sm" style={{ marginTop: -8 }}>
                Photo #{active.id} • Access: moderation.preview
              </p>
              <div
                style={{
                  height: 280,
                  background: "var(--muted)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted-foreground)",
                  marginTop: 12,
                }}
              >
                <ImageOff size={32} />
                <span style={{ marginLeft: 8 }}>Ảnh xem kiểm duyệt — demo</span>
              </div>
              <div
                className="flex items-start gap-sm mt-md text-sm"
                style={{
                  background: "color-mix(in srgb, var(--warning) 15%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--warning) 40%, transparent)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2, color: "var(--warning)" }} />
                <span>
                  Truy cập này được ghi Audit Log. Chỉ sử dụng cho mục đích kiểm duyệt nội bộ.
                </span>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setActive(null)}>
                  ✓ Safe
                </Button>
                <Button variant="destructive" onClick={() => setActive(null)}>
                  ⚑ Vi phạm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </OwnerShell>
  );
}
