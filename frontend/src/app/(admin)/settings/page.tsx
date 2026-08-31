"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudio } from "@/lib/use-studio";
import { DEFAULT_AVATAR } from "@/lib/studio-name";
import { api, ApiError } from "@/lib/api-client";
import {
  WEBSITE_TEMPLATES,
  DEFAULT_WEBSITE_TEMPLATE,
  isWebsiteTemplateId,
  isWebsiteTemplateBuilt,
  type WebsiteTemplateId,
} from "@/lib/website-templates";

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

interface WebsiteAlbumRow {
  id: string;
  name: string;
  photoCount: number;
  showOnWebsite: boolean;
  coverUrl: string | null;
}
interface WebsiteFeaturedPhoto {
  id: string;
  url: string;
}
interface AlbumPhotoOption {
  id: string;
  thumbnailUrl: string | null;
}

/** Photo picker used for both "Ảnh bìa" (single-select) and "Ảnh nổi bật"
 * (multi-select) — only browses Albums already marked "hiện trên web con",
 * since picking a cover/featured photo from an Album that isn't shown on
 * the site wouldn't make sense. */
function WebsitePhotoPicker({
  open,
  mode,
  demoAlbums,
  selectedIds,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: "cover" | "featured";
  demoAlbums: WebsiteAlbumRow[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (photos: AlbumPhotoOption[]) => void;
}) {
  const [albumId, setAlbumId] = useState<string>(demoAlbums[0]?.id ?? "");
  const [photos, setPhotos] = useState<AlbumPhotoOption[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [picked, setPicked] = useState<string[]>(selectedIds);
  // Accumulates every photo seen across album switches, keyed by id, so
  // confirming can resolve a full {id, thumbnailUrl} for a photo picked
  // from an album that isn't the one currently displayed.
  const [knownPhotos, setKnownPhotos] = useState<Map<string, AlbumPhotoOption>>(new Map());

  useEffect(() => {
    if (open) {
      setPicked(selectedIds);
      setAlbumId(demoAlbums[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !albumId) return;
    setLoadingPhotos(true);
    api<{ photos: AlbumPhotoOption[] }>(`/api/albums/${albumId}`)
      .then((res) => {
        setPhotos(res.photos);
        setKnownPhotos((prev) => {
          const next = new Map(prev);
          res.photos.forEach((p) => next.set(p.id, p));
          return next;
        });
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoadingPhotos(false));
  }, [open, albumId]);

  function toggle(id: string) {
    if (mode === "cover") {
      setPicked([id]);
    } else {
      setPicked((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : prev.length >= 12 ? prev : [...prev, id]
      );
    }
  }

  function confirm() {
    onConfirm(picked.map((id) => knownPhotos.get(id) ?? { id, thumbnailUrl: null }));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent style={{ maxWidth: 640 }}>
        <DialogHeader>
          <DialogTitle>{mode === "cover" ? "Chọn ảnh bìa" : "Chọn ảnh nổi bật (tối đa 12)"}</DialogTitle>
        </DialogHeader>
        {demoAlbums.length === 0 ? (
          <p className="text-secondary text-sm">
            Chưa có album nào bật &quot;Hiện trên web con&quot; — bật ít nhất 1 album ở trên trước.
          </p>
        ) : (
          <>
            <div className="field mb-md">
              <label>Chọn từ album</label>
              <select className="input" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                {demoAlbums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            {loadingPhotos ? (
              <p className="text-secondary text-sm">Đang tải ảnh...</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8,
                  maxHeight: 320,
                  overflowY: "auto",
                }}
              >
                {photos.map((p) => {
                  const isPicked = picked.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p.id)}
                      style={{
                        position: "relative",
                        aspectRatio: "1/1",
                        borderRadius: 6,
                        overflow: "hidden",
                        border: isPicked ? "2px solid var(--accent)" : "1px solid var(--border)",
                        padding: 0,
                        cursor: "pointer",
                        background: "var(--muted)",
                      }}
                    >
                      {p.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnailUrl}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
        <div className="modal-foot" style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={confirm}>Xong</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WebsiteStudioTab() {
  const { studio } = useStudio();
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState<WebsiteTemplateId>(DEFAULT_WEBSITE_TEMPLATE);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [featured, setFeatured] = useState<WebsiteFeaturedPhoto[]>([]);
  const [albums, setAlbums] = useState<WebsiteAlbumRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<"cover" | "featured" | null>(null);

  function load() {
    api<{
      slug: string;
      templateId: string;
      coverPhotoId: string | null;
      coverUrl: string | null;
      featuredPhotos: WebsiteFeaturedPhoto[];
      albums: WebsiteAlbumRow[];
    }>("/api/website")
      .then((res) => {
        setSlug(res.slug);
        setTemplateId(isWebsiteTemplateId(res.templateId) ? res.templateId : DEFAULT_WEBSITE_TEMPLATE);
        setCoverPhotoId(res.coverPhotoId);
        setCoverUrl(res.coverUrl);
        setFeatured(res.featuredPhotos);
        setAlbums(res.albums);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function toggleAlbum(id: string) {
    setAlbums((prev) => prev.map((a) => (a.id === id ? { ...a, showOnWebsite: !a.showOnWebsite } : a)));
  }

  const demoAlbums = albums.filter((a) => a.showOnWebsite);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function handleSave() {
    setSaving(true);
    try {
      await api("/api/website", {
        method: "PATCH",
        body: JSON.stringify({
          templateId,
          coverPhotoId,
          featuredPhotoIds: featured.map((f) => f.id),
          demoAlbumIds: demoAlbums.map((a) => a.id),
        }),
      });
      toast("Đã lưu cấu hình web con");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !studio) return <p className="text-secondary">Đang tải...</p>;

  const previewUrl = `${origin}/${slug}`;

  return (
    <>
      <div className="card mb-md">
        <div className="card-body lg" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="flex justify-between items-center">
            <h3 style={{ margin: 0 }}>Web con của studio</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(previewUrl, "_blank")}
            >
              <ExternalLink size={14} />
              Xem web con
            </Button>
          </div>
          <p className="text-secondary text-sm" style={{ margin: 0 }}>
            Website riêng của studio tại <span className="mono">{previewUrl}</span> — gửi link này cho
            khách xem trước (nút &quot;Wed Studio&quot; ở sidebar).
          </p>
        </div>
      </div>

      <div className="card mb-md">
        <div className="card-body lg">
          <h3 className="mb-md">Chọn Template</h3>
          <p className="text-secondary text-sm mb-md">
            Xem trước bằng dữ liệu thật của bạn trước khi chọn — chưa lưu cho tới khi bấm &quot;Lưu
            thay đổi&quot;.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {WEBSITE_TEMPLATES.map((t) => {
              const built = isWebsiteTemplateBuilt(t.value);
              const selected = t.value === templateId;
              return (
                <div
                  key={t.value}
                  style={{
                    border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div className="flex justify-between items-start gap-sm">
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</span>
                    {!built && (
                      <Badge variant="secondary" style={{ flexShrink: 0 }}>
                        Sắp có
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-sm">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(`${previewUrl}?previewTemplate=${t.value}`, "_blank")}
                    >
                      Xem trước
                    </Button>
                    <Button
                      size="sm"
                      variant={selected ? "default" : "secondary"}
                      disabled={selected}
                      onClick={() => setTemplateId(t.value)}
                    >
                      {selected ? "Đang dùng" : "Chọn"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card mb-md">
        <div className="card-body lg">
          <h3 className="mb-md">Ảnh bìa</h3>
          <div className="flex items-center gap-md">
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--muted)",
                flexShrink: 0,
              }}
            >
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPicker("cover")}>
              Chọn ảnh bìa
            </Button>
          </div>
        </div>
      </div>

      <div className="card mb-md">
        <div className="card-body lg">
          <div className="flex justify-between items-center mb-md">
            <h3 style={{ margin: 0 }}>Ảnh nổi bật (Portfolio)</h3>
            <Button variant="secondary" size="sm" onClick={() => setPicker("featured")}>
              Chọn ảnh
            </Button>
          </div>
          {featured.length === 0 ? (
            <p className="text-secondary text-sm">Chưa chọn ảnh nào.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {featured.map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={f.id}
                  src={f.url}
                  alt=""
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 6 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mb-md">
        <div className="card-body lg">
          <h3 className="mb-md">Album demo</h3>
          <p className="text-secondary text-sm mb-md">Chọn album nào hiện trên web con.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {albums.map((a) => (
              <label
                key={a.id}
                className="flex items-center gap-sm"
                style={{ cursor: "pointer", fontSize: 13 }}
              >
                <input
                  type="checkbox"
                  checked={a.showOnWebsite}
                  onChange={() => toggleAlbum(a.id)}
                />
                {a.name}
                <span className="text-secondary">({a.photoCount} ảnh)</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="modal-foot">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <WebsitePhotoPicker
        open={picker !== null}
        mode={picker ?? "cover"}
        demoAlbums={demoAlbums}
        selectedIds={picker === "cover" ? (coverPhotoId ? [coverPhotoId] : []) : featured.map((f) => f.id)}
        onClose={() => setPicker(null)}
        onConfirm={(photos) => {
          if (picker === "cover") {
            const chosen = photos[0] ?? null;
            setCoverPhotoId(chosen?.id ?? null);
            setCoverUrl(chosen?.thumbnailUrl ?? null);
          } else {
            setFeatured(photos.map((p) => ({ id: p.id, url: p.thumbnailUrl ?? "" })));
          }
          setPicker(null);
        }}
      />
    </>
  );
}

export default function SettingsPage() {
  return (
    <AdminShell>
      <h1 className="mb-lg">Cài đặt</h1>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          <TabsTrigger value="website">Website Studio</TabsTrigger>
          <TabsTrigger value="billing">Gói dịch vụ</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="notif">Thông báo</TabsTrigger>
        </TabsList>

        <div style={{ maxWidth: 640 }}>
          <TabsContent value="profile" className="mt-lg">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="website" className="mt-lg">
            <WebsiteStudioTab />
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
