"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudio } from "@/lib/use-studio";
import { DEFAULT_AVATAR } from "@/lib/studio-name";
import { api, ApiError } from "@/lib/api-client";

function ProfileTab() {
  const router = useRouter();
  const { studio, loading } = useStudio();
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [studioName, setStudioName] = useState("");
  const [saving, setSaving] = useState(false);

  const [logoUrl, setLogoUrl] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!studio) return;
    setPhone(studio.phone ?? "");
    setDescription(studio.description ?? "");
    setStudioName(studio.name ?? "");
    setLogoUrl(studio.logoUrl ?? "");
  }, [studio]);

  if (loading || !studio) return <p className="text-secondary">Đang tải...</p>;

  async function handleSave() {
    setSaving(true);
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: studioName, phone, description }),
      });
      toast("Đã lưu hồ sơ");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSavingAvatar(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Không thể đổi ảnh đại diện");
      setLogoUrl(data.logoUrl);
      toast("Đã đổi ảnh đại diện");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Không thể đổi ảnh đại diện");
    } finally {
      setSavingAvatar(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Xác nhận mật khẩu mới không khớp");
      return;
    }
    setSavingPassword(true);
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toast("Đã đổi mật khẩu");
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể đổi mật khẩu");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="card">
      <div
        className="card-body lg"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div className="flex items-center gap-md mb-sm">
          <Image
            className="avatar"
            style={{ width: 64, height: 64 }}
            src={logoUrl || DEFAULT_AVATAR}
            alt=""
            width={64}
            height={64}
            unoptimized
          />
          <input
            ref={avatarFileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => avatarFileRef.current?.click()}
            disabled={savingAvatar}
          >
            {savingAvatar ? "Đang tải lên..." : "Đổi ảnh đại diện"}
          </Button>
        </div>
        <div className="field">
          <label>Tên studio</label>
          <input
            className="input"
            value={studioName}
            onChange={(e) => setStudioName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={studio.email} disabled />
        </div>
        <div className="field">
          <label>Số điện thoại</label>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Giới thiệu ngắn</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border)",
            margin: "4px 0",
          }}
        />
        <div className="flex justify-between items-center">
          <div>
            <p style={{ fontWeight: 600, fontSize: 13 }}>
              Xác thực 2 lớp (2FA)
            </p>
            <span className="text-sm">Bảo mật thêm cho tài khoản</span>
          </div>
          <Switch disabled />
        </div>
        {!changingPassword ? (
          <Button
            variant="ghost"
            style={{ alignSelf: "flex-start" }}
            onClick={() => setChangingPassword(true)}
          >
            Đổi mật khẩu
          </Button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label>Mật khẩu hiện tại</label>
              <input
                className="input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="field">
              <label>Mật khẩu mới</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                minLength={8}
              />
            </div>
            <div className="field">
              <label>Xác nhận mật khẩu mới</label>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <div className="flex gap-sm">
              <Button
                variant="secondary"
                onClick={() => {
                  setChangingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Huỷ
              </Button>
              <Button onClick={handleChangePassword} disabled={savingPassword}>
                {savingPassword ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
              </Button>
            </div>
          </div>
        )}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--border)",
            margin: "4px 0",
          }}
        />
        <Button
          variant="ghost"
          style={{ alignSelf: "flex-start", color: "var(--destructive)" }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Đăng xuất
        </Button>
        <div className="modal-foot">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminShell>
      <h1 className="mb-lg">Cài đặt</h1>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="billing">Gói dịch vụ</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notif">Thông báo</TabsTrigger>
        </TabsList>

        <div style={{ maxWidth: 640 }}>
          <TabsContent value="profile" className="mt-lg">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="billing" className="mt-lg">
            <div className="card">
              <div className="card-body lg">
                <div className="flex justify-between items-center mb-md">
                  <div>
                    <h3>Gói Pro</h3>
                    <span className="text-sm">Gia hạn ngày 01/09/2026</span>
                  </div>
                  <Badge variant="accent">Đang hoạt động</Badge>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-secondary">Dung lượng đã dùng</span>
                    <span>42 GB / 100 GB</span>
                  </div>
                  <div className="bar-row" style={{ marginTop: -4 }}>
                    <div className="track">
                      <div
                        style={{
                          width: "42%",
                          height: "100%",
                          background: "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">
                      Lượt gọi API tháng này
                    </span>
                    <span>1,204 / 10,000</span>
                  </div>
                </div>
                <Button variant="secondary">Nâng cấp gói</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-lg">
            <div className="card">
              <div className="card-body lg">
                <h3 className="mb-md">API keys</h3>
                <div className="flex gap-sm mb-md">
                  <input
                    className="input mono"
                    style={{ fontSize: 12 }}
                    readOnly
                    value="bv_live_sk_••••••••••••3f2a"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast("Đã copy")}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: "var(--destructive)" }}
                  >
                    Thu hồi
                  </Button>
                </div>
                <Button variant="secondary" size="sm">
                  + Tạo key mới
                </Button>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    margin: "20px 0",
                  }}
                />
                <div className="field">
                  <label>Webhook URL</label>
                  <input
                    className="input"
                    placeholder="https://yourapp.com/webhook"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notif" className="mt-lg">
            <div className="card">
              <div
                className="card-body lg"
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>
                      Thông báo qua email
                    </p>
                    <span className="text-sm">Khi khách nộp lựa chọn</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>
                      Thông báo qua SMS
                    </p>
                    <span className="text-sm">Cảnh báo tức thời</span>
                  </div>
                  <Switch />
                </div>
                <div className="field">
                  <label>Tần suất tổng hợp</label>
                  <select className="input">
                    <option>Ngay lập tức</option>
                    <option>Tổng hợp hàng ngày</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </AdminShell>
  );
}
