"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, HardDrive } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/use-studio";
import { api, ApiError } from "@/lib/api-client";

const steps = [
  { label: "Nguồn ảnh", state: "done" as const },
  { label: "Thông tin", state: "active" as const },
  { label: "Cấu hình", state: "pending" as const },
  { label: "Xác nhận", state: "pending" as const },
];

export default function AlbumCreatePage() {
  const { studio, loading: studioLoading } = useStudio();
  const router = useRouter();
  const [name, setName] = useState("Đám cưới An & Minh");
  const [description, setDescription] = useState(
    "Cảm ơn anh chị đã tin tưởng Books View. Vui lòng chọn ảnh yêu thích trước ngày 20/09."
  );
  const [creating, setCreating] = useState(false);

  if (studioLoading || !studio) return null;

  async function handleCreate() {
    if (!name.trim()) {
      toast("Vui lòng nhập tên album");
      return;
    }
    setCreating(true);
    try {
      const res = await api<{ id: string }>("/api/albums", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      toast("Đã tạo album");
      router.push(`/albums/${res.id}`);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể tạo album");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <AppHeader showAvatar />
      <main className="main" style={{ paddingTop: 48 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="breadcrumb" style={{ justifyContent: "center" }}>
            <Link href="/albums">Albums</Link>
            <span>/</span>
            <span>Tạo album</span>
          </div>
          <h1 style={{ textAlign: "center", marginBottom: 36 }}>
            Tạo album mới
          </h1>

          <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
            {steps.map((step, i) => (
              <div key={step.label} style={{ display: "contents" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `2px solid ${
                        step.state === "pending" ? "var(--border)" : "var(--accent)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                      background: step.state === "done" ? "var(--accent)" : "transparent",
                      color:
                        step.state === "done"
                          ? "#1A1A1A"
                          : step.state === "active"
                            ? "var(--accent)"
                            : "var(--muted-foreground)",
                    }}
                  >
                    {step.state === "done" ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      whiteSpace: "nowrap",
                      color:
                        step.state === "pending"
                          ? "var(--muted-foreground)"
                          : "var(--foreground)",
                      fontWeight: step.state === "pending" ? 400 : 600,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{ flex: 1, height: 2, background: "var(--border)", margin: "0 8px" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <div
              className="card-body lg"
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              <div
                className="flex items-start gap-md"
                style={{
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                  background: "color-mix(in srgb, var(--accent) 6%, transparent)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--muted)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <HardDrive size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>Google Drive folder đã liên kết</p>
                  <p className="text-sm mono" style={{ marginTop: 2 }}>
                    drive.google.com/drive/folders/1AbC…xyz
                  </p>
                  <p className="text-sm" style={{ color: "var(--muted-foreground)", marginTop: 4 }}>
                    Đồng bộ Google Drive chưa được nối (Phase kế tiếp)
                  </p>
                </div>
                <Button variant="ghost" size="sm" disabled>
                  Đổi
                </Button>
              </div>

              <div className="field">
                <label htmlFor="al-name">
                  Tên album <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <input
                  className="input"
                  id="al-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Đám cưới An & Minh"
                />
              </div>
              <div className="field">
                <label htmlFor="al-desc">
                  Mô tả <span className="text-sm">(tuỳ chọn)</span>
                </label>
                <textarea
                  className="input"
                  id="al-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú cho khách hàng..."
                />
              </div>
              <div className="field">
                <label htmlFor="al-client">
                  Tên khách hàng{" "}
                  <span className="text-sm">(tuỳ chọn — điền sau)</span>
                </label>
                <input
                  className="input"
                  id="al-client"
                  placeholder="VD: Anh An & Chị Minh"
                />
              </div>

              <div className="modal-foot" style={{ marginTop: 8 }}>
                <Button variant="secondary" asChild>
                  <Link href="/albums">← Quay lại</Link>
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Đang tạo..." : "Tiếp tục →"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
