"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { BrandMark } from "@/components/brand-mark";
import { api, ApiError } from "@/lib/api-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Xác nhận mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      toast("Đã đặt lại mật khẩu, đăng nhập lại nhé");
      router.push("/login");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      imageSeed="booksview-studio"
      quoteTitle="Bắt đầu miễn phí — 1 album đầu tiên không giới hạn số ảnh."
      quoteMeta="Không cần thẻ tín dụng."
    >
      <div className="brand">
        <BrandMark />
        <span className="name">Books View</span>
      </div>

      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Đặt lại mật khẩu</h1>

      {!token ? (
        <p className="text-secondary">
          Link không hợp lệ. Vui lòng dùng link mới nhất từ email, hoặc{" "}
          <Link href="/forgot-password" style={{ color: "var(--accent)", fontWeight: 600 }}>
            yêu cầu lại
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="text-secondary mb-lg">Nhập mật khẩu mới cho tài khoản.</p>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="field">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                className="input"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input
                className="input"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
