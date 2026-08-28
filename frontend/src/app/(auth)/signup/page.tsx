"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { BrandMark } from "@/components/brand-mark";
import { api, ApiError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          studioName: form.get("studio") || undefined,
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          password: form.get("password"),
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Đăng ký thất bại");
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

      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Tạo tài khoản studio</h1>
      <p className="text-secondary mb-lg">
        Vài bước là có thể gửi album đầu tiên cho khách.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div className="field">
          <label htmlFor="name">Họ tên</label>
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            placeholder="Nguyễn Văn A"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="studio">Tên studio</label>
          <input
            className="input"
            type="text"
            id="studio"
            name="studio"
            placeholder="Books View"
          />
          <span className="hint">Không bắt buộc</span>
        </div>
        <div className="field">
          <label htmlFor="email2">Email</label>
          <input
            className="input"
            type="email"
            id="email2"
            name="email"
            placeholder="ban@studio.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="phone">
            Số điện thoại <span className="text-sm">(tuỳ chọn)</span>
          </label>
          <input
            className="input"
            type="tel"
            id="phone"
            name="phone"
            placeholder="09xx xxx xxx"
          />
        </div>
        <div className="field">
          <label htmlFor="pass2">Mật khẩu</label>
          <input
            className="input"
            type="password"
            id="pass2"
            name="password"
            placeholder="Tối thiểu 8 ký tự"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" size="lg" style={{ marginTop: 4 }} disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </Button>
      </form>

      <p className="text-sm" style={{ textAlign: "center", marginTop: 20 }}>
        Đã có tài khoản?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
