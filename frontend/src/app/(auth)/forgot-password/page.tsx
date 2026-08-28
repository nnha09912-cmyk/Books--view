"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { BrandMark } from "@/components/brand-mark";
import { api, ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email") }),
      });
      setSent(true);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      imageSeed="booksview-wedding"
      quoteTitle="“Khách xem và chọn ảnh chỉ trong 10 phút, không cần cài app.”"
      quoteMeta="♥ Một quà tặng từ Trần Nhất Duy - Phóng Sự Cưới Gò Công"
    >
      <div className="brand">
        <BrandMark />
        <span className="name">Books View</span>
      </div>

      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Quên mật khẩu?</h1>
      <p className="text-secondary mb-lg">
        Nhập email của bạn, mình sẽ gửi link đặt lại mật khẩu.
      </p>

      {sent ? (
        <p className="text-secondary">
          Nếu email này có tài khoản, bạn sẽ nhận được link đặt lại mật khẩu
          trong vài phút. Nhớ kiểm tra cả mục Spam.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              type="email"
              id="email"
              name="email"
              placeholder="ban@studio.com"
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi link đặt lại"}
          </Button>
        </form>
      )}

      <p className="text-sm" style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
