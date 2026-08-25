"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/layout/auth-shell";
import { BrandMark } from "@/components/brand-mark";
import { GoogleIcon, FacebookIcon } from "@/components/icons/oauth-icons";
import { api, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: form.get("identifier"),
          password: form.get("password"),
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Đăng nhập thất bại");
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

      <h1 style={{ fontSize: 26, marginBottom: 6 }}>Chào mừng trở lại</h1>
      <p className="text-secondary mb-lg">
        Đăng nhập để quản lý album của studio.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div className="field">
          <label htmlFor="identifier">Email hoặc Số điện thoại</label>
          <input
            className="input"
            type="text"
            id="identifier"
            name="identifier"
            placeholder="ban@studio.com hoặc 09xx xxx xxx"
            defaultValue="quyen@booksview.vn"
            required
          />
        </div>
        <div className="field">
          <div className="flex justify-between items-center">
            <label htmlFor="pass">Mật khẩu</label>
            <a href="#" className="text-sm" style={{ color: "var(--accent)" }}>
              Quên mật khẩu?
            </a>
          </div>
          <input
            className="input"
            type="password"
            id="pass"
            name="password"
            placeholder="••••••••"
            defaultValue="password123"
            required
          />
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="divider-or">hoặc</div>
      <div className="oauth-row">
        <button
          type="button"
          className="oauth-btn"
          onClick={() => toast("Demo OAuth Google")}
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          className="oauth-btn"
          onClick={() => toast("Demo OAuth Facebook")}
        >
          <FacebookIcon />
          Facebook
        </button>
      </div>

      <p className="text-sm" style={{ textAlign: "center", marginTop: 24 }}>
        Chưa có tài khoản?{" "}
        <Link
          href="/signup"
          style={{ color: "var(--accent)", fontWeight: 600 }}
        >
          Đăng ký
        </Link>
      </p>
    </AuthShell>
  );
}
