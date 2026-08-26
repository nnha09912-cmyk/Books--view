"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Share2,
  Heart,
  Star,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  ArrowDownToLine,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusMenu } from "@/components/status-menu";
import { picsum } from "@/lib/mock-data";
import { useStudio } from "@/lib/use-studio";
import { api, ApiError } from "@/lib/api-client";
import { isFileSystemAccessSupported, buildSourceIndex } from "@/lib/fs-filter";
import type { AlbumDetail, AlbumPhoto } from "@/lib/types";

export default function AlbumDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { studio, loading: studioLoading } = useStudio();
  const router = useRouter();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  function reloadAlbum() {
    return api<AlbumDetail>(`/api/albums/${params.id}`)
      .then(setAlbum)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundState(true);
      });
  }

  async function handleStatusChange(status: string) {
    try {
      await api(`/api/albums/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setAlbum((prev) => (prev ? { ...prev, status } : prev));
      toast("Đã đổi trạng thái");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể đổi trạng thái");
    }
  }

  useEffect(() => {
    if (!studio) return;
    reloadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studio, params.id]);

  if (studioLoading || !studio) return null;
  if (notFoundState) {
    return (
      <>
        <AppHeader showAvatar />
        <div className="shell">
          <Sidebar />
          <main className="main">
            <div className="empty-state">
              <h3>Không tìm thấy album</h3>
              <Link href="/albums" className="text-sm" style={{ color: "var(--accent)" }}>
                ← Quay lại danh sách
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }
  if (!album) return null;

  const shareLink =
    (typeof window !== "undefined" ? window.location.origin : "") +
    `/album/${album.linkToken}`;

  return (
    <>
      <AppHeader showAvatar />
      <div className="shell">
        <Sidebar />
        <main className="main">
          <div className="breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/albums">Albums</Link>
            <span>/</span>
            <span>{album.name}</span>
          </div>
          <div className="page-head">
            <div>
              <div className="flex items-center gap-sm">
                <h1 style={{ fontSize: 26 }}>{album.name}</h1>
                <StatusMenu status={album.status} onChange={handleStatusChange} />
              </div>
              <p className="text-secondary" style={{ marginTop: 6 }}>
                {album.photoCount} ảnh · {album.customers.length} khách · Template{" "}
                {album.template} · Tạo ngày{" "}
                {new Date(album.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex gap-sm">
              <ShareDialog albumName={album.name} linkToken={album.linkToken} />
              <Button asChild>
                <Link href={`/album/${album.linkToken}/gallery`}>Xem như khách</Link>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-lg">
              <OverviewTab
                album={album}
                shareLink={shareLink}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
            <TabsContent value="gallery" className="mt-lg">
              <GalleryTab album={album} onSynced={reloadAlbum} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-lg">
              <AnalyticsTab album={album} />
            </TabsContent>
            <TabsContent value="settings" className="mt-lg">
              <SettingsTab
                album={album}
                onSaved={(updated) =>
                  setAlbum((prev) => (prev ? { ...prev, ...updated } : prev))
                }
                onDeleted={() => router.push("/albums")}
              />
            </TabsContent>
            <TabsContent value="export" className="mt-lg">
              <ExportTab album={album} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}

function ShareLinkSection({
  title,
  badge,
  description,
  link,
  qrFilename,
}: {
  title: string;
  badge?: string;
  description: string;
  link: string;
  qrFilename: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  return (
    <div className="card mb-md">
      <div className="card-body lg">
        <div className="flex items-center gap-sm mb-sm">
          <h3 style={{ margin: 0 }}>{title}</h3>
          {badge && <Badge variant="accent">{badge}</Badge>}
        </div>
        <p className="text-secondary text-sm mb-md">{description}</p>
        <div className="flex gap-sm mb-md">
          <input className="input mono" style={{ fontSize: 12 }} readOnly value={link} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast("Đã copy link");
            }}
          >
            Sao chép
          </Button>
        </div>
        <div className="flex items-center gap-md">
          <Image
            src={qrUrl}
            alt="QR"
            width={96}
            height={96}
            unoptimized
            style={{ background: "var(--muted)", borderRadius: "var(--radius-sm)" }}
          />
          <a
            href={qrUrl}
            download={`${qrFilename}.png`}
            className="inline-flex items-center gap-sm text-sm"
            style={{ color: "var(--accent)", fontWeight: 600 }}
          >
            <ArrowDownToLine size={14} />
            {qrFilename}.PNG
          </a>
        </div>
      </div>
    </div>
  );
}

function ShareDialog({
  albumName,
  linkToken,
}: {
  albumName: string;
  linkToken: string;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const selectLink = `${origin}/album/${linkToken}/gallery`;
  const viewLink = `${origin}/album/${linkToken}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Share2 size={16} />
          Chia sẻ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chia sẻ album</DialogTitle>
        </DialogHeader>
        <ShareLinkSection
          title="Khách chọn ảnh"
          badge="ƯU TIÊN"
          description="Gửi link này cho khách để họ chọn những ảnh yêu thích."
          link={selectLink}
          qrFilename={albumName}
        />
        <ShareLinkSection
          title="Chỉ xem album"
          description="Gửi link này cho khách để xem album."
          link={viewLink}
          qrFilename={`${albumName}-xem`}
        />
      </DialogContent>
    </Dialog>
  );
}

function OverviewTab({
  album,
  shareLink,
  onStatusChange,
}: {
  album: AlbumDetail;
  shareLink: string;
  onStatusChange: (status: string) => void;
}) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div className="card">
          <div className="card-body lg">
            <h3 className="mb-md">Thông tin album</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 13,
              }}
            >
              <div className="flex justify-between">
                <span className="text-secondary">Mô tả</span>
                <span style={{ textAlign: "right", maxWidth: "60%" }}>
                  {album.description || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Template</span>
                <span>{album.template}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Trạng thái</span>
                <StatusMenu status={album.status} onChange={onStatusChange} />
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Hết hạn</span>
                <span>
                  {album.expiryDate
                    ? new Date(album.expiryDate).toLocaleDateString("vi-VN")
                    : "Không giới hạn"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body lg">
            <h3 className="mb-md">Link chia sẻ</h3>
            <div className="flex gap-sm mb-md">
              <input
                className="input mono"
                style={{ fontSize: 12 }}
                readOnly
                value={shareLink}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast("Đã copy link");
                }}
              >
                Copy
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 16,
                background: "var(--muted)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareLink)}`}
                alt="QR"
                width={120}
                height={120}
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-md" style={{ marginTop: 24 }}>
        Khách hàng
      </h3>
      <div className="card">
        <div className="card-body">
          {album.customers.length === 0 ? (
            <p className="text-secondary" style={{ padding: 8 }}>
              Chưa có khách nào xem album này.
            </p>
          ) : (
            album.customers.map((c) => (
              <div className="customer-row" key={c.id}>
                <div
                  className="avatar"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{c.name}</p>
                  <span className="text-sm">
                    {c.submittedAt
                      ? "Đã nộp lựa chọn"
                      : c.lastViewedAt
                        ? `Xem lần cuối: ${new Date(c.lastViewedAt).toLocaleString("vi-VN")}`
                        : "Chưa xem"}
                  </span>
                </div>
                {c.likes === 0 && c.stars === 0 ? (
                  <Badge variant="secondary">—</Badge>
                ) : (
                  <>
                    <Badge variant="like">{c.likes} ♥</Badge>
                    <Badge variant="accent">{c.stars} ⭐</Badge>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const SYNC_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "jfif"];

function GalleryTab({
  album,
  onSynced,
}: {
  album: AlbumDetail;
  onSynced: () => void;
}) {
  const [fsSupported, setFsSupported] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState("");
  const [driveOpen, setDriveOpen] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [driveImporting, setDriveImporting] = useState(false);
  useEffect(() => setFsSupported(isFileSystemAccessSupported()), []);

  const [reordering, setReordering] = useState(false);
  const [orderedPhotos, setOrderedPhotos] = useState<AlbumPhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const lastClickedIndexRef = useRef<number | null>(null);
  const draggedIdsRef = useRef<Set<string>>(new Set());

  function enterReorderMode() {
    setOrderedPhotos([...album.photos]);
    setSelectedIds(new Set());
    lastClickedIndexRef.current = null;
    setReordering(true);
  }

  function cancelReorder() {
    setReordering(false);
    setSelectedIds(new Set());
    setDragOverIndex(null);
  }

  async function saveReorder() {
    setSavingOrder(true);
    try {
      const res = await fetch(`/api/albums/${album.id}/photos/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoIds: orderedPhotos.map((p) => p.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Lưu thứ tự thất bại");
      toast("Đã lưu thứ tự ảnh");
      setReordering(false);
      setSelectedIds(new Set());
      onSynced();
    } catch (e) {
      toast(String(e instanceof Error ? e.message : e));
    } finally {
      setSavingOrder(false);
    }
  }

  function handleTileClick(e: React.MouseEvent, photo: AlbumPhoto, index: number) {
    if (!reordering) return;
    if (e.shiftKey && lastClickedIndexRef.current !== null) {
      const [from, to] = [lastClickedIndexRef.current, index].sort((a, b) => a - b);
      const range = orderedPhotos.slice(from, to + 1).map((p) => p.id);
      setSelectedIds(new Set(range));
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(photo.id)) next.delete(photo.id);
        else next.add(photo.id);
        return next;
      });
      lastClickedIndexRef.current = index;
    } else {
      setSelectedIds(new Set([photo.id]));
      lastClickedIndexRef.current = index;
    }
  }

  function handleDragStart(e: React.DragEvent, photo: AlbumPhoto) {
    const dragged = selectedIds.has(photo.id) ? selectedIds : new Set([photo.id]);
    if (!selectedIds.has(photo.id)) setSelectedIds(dragged);
    draggedIdsRef.current = dragged;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    const dragged = draggedIdsRef.current;
    setOrderedPhotos((prev) => {
      const before = prev.slice(0, targetIndex).filter((p) => dragged.has(p.id)).length;
      const insertAt = targetIndex - before;
      const rest = prev.filter((p) => !dragged.has(p.id));
      const movedInOrder = prev.filter((p) => dragged.has(p.id));
      const next = [...rest];
      next.splice(insertAt, 0, ...movedInOrder);
      return next;
    });
    setDragOverIndex(null);
  }

  async function handleDriveImport() {
    if (!driveLink.trim()) {
      toast("Dán link folder Google Drive vào đây");
      return;
    }
    setDriveImporting(true);
    try {
      const res = await fetch(`/api/albums/${album.id}/photos/drive-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ driveLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Nhập từ Drive thất bại");
      toast(
        `Đã nhập ${data.added} ảnh mới từ Google Drive${data.skipped ? `, bỏ qua ${data.skipped} ảnh đã có` : ""}.`
      );
      setDriveOpen(false);
      setDriveLink("");
      onSynced();
    } catch (e) {
      toast(String(e instanceof Error ? e.message : e));
    } finally {
      setDriveImporting(false);
    }
  }

  async function handleDriveSync() {
    setSyncing(true);
    setSyncProgress("Đang đồng bộ với Drive...");
    try {
      const res = await fetch(`/api/albums/${album.id}/photos/drive-sync`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Đồng bộ Drive thất bại");
      toast(
        `Đồng bộ xong — thêm ${data.added} ảnh mới${
          data.removed ? `, xoá ${data.removed} ảnh không còn trong Drive` : ""
        }.`
      );
      onSynced();
    } catch (e) {
      toast(String(e instanceof Error ? e.message : e));
    } finally {
      setSyncing(false);
      setSyncProgress("");
    }
  }

  async function handleSync() {
    if (!fsSupported) {
      toast("Trình duyệt này chưa hỗ trợ chọn thư mục — hãy dùng Chrome hoặc Edge.");
      return;
    }
    let dir: FileSystemDirectoryHandle;
    try {
      dir = await window.showDirectoryPicker({ mode: "read" });
    } catch {
      return; // user cancelled
    }

    setSyncing(true);
    setSyncProgress("Đang quét thư mục...");
    try {
      const { index } = await buildSourceIndex(dir, true, "custom", SYNC_IMAGE_EXTS, (n) =>
        setSyncProgress(`Đang quét thư mục... (${n} file)`)
      );
      const entries = Array.from(index.values()).flat();
      if (entries.length === 0) {
        toast("Không tìm thấy ảnh nào (jpg/png/webp/gif) trong thư mục đã chọn.");
        return;
      }

      setSyncProgress(`Đang tải lên ${entries.length} ảnh...`);
      const form = new FormData();
      form.append("overwrite", "false");
      for (const entry of entries) {
        const file = await entry.handle.getFile();
        form.append("files", file, entry.name);
      }
      const res = await fetch(`/api/albums/${album.id}/photos/sync`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Đồng bộ thất bại");
      toast(
        `Đồng bộ xong — thêm ${data.added} ảnh mới${data.skipped ? `, bỏ qua ${data.skipped} ảnh đã có` : ""}.`
      );
      onSynced();
    } catch (e) {
      toast(String(e));
    } finally {
      setSyncing(false);
      setSyncProgress("");
    }
  }

  return (
    <>
      {!album.googleDriveFolderId && !fsSupported && (
        <div
          className="card mb-md"
          style={{
            borderColor: "var(--warning)",
            display: "flex",
            gap: 10,
            padding: 14,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm">
            Đồng bộ ảnh từ thư mục local cần Chrome hoặc Edge (bản desktop) — trình duyệt hiện tại
            chưa hỗ trợ.
          </p>
        </div>
      )}
      <div className="toolbar">
        {reordering ? (
          <>
            <span className="text-sm">
              Kéo thả để sắp xếp — giữ Cmd/Ctrl hoặc Shift để chọn nhiều ảnh cùng lúc.
            </span>
            <div className="spacer" />
            <Button variant="secondary" size="sm" onClick={cancelReorder} disabled={savingOrder}>
              Huỷ
            </Button>
            <Button size="sm" onClick={saveReorder} disabled={savingOrder}>
              {savingOrder ? "Đang lưu..." : "Xong"}
            </Button>
          </>
        ) : (
          <>
            <span className="text-sm">
              {album.photos.length} ảnh · badge hiển thị ảnh đã được khách chọn
            </span>
            <div className="spacer" />
            <Button
              variant="secondary"
              size="sm"
              onClick={enterReorderMode}
              disabled={album.photos.length < 2}
            >
              Sắp xếp lại
            </Button>
            <Button
              size="sm"
              onClick={album.googleDriveFolderId ? handleDriveSync : handleSync}
              disabled={syncing || (!album.googleDriveFolderId && !fsSupported)}
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : undefined} />
              {syncing ? syncProgress || "Đang đồng bộ..." : "Đồng bộ ảnh"}
            </Button>
            <Dialog open={driveOpen} onOpenChange={setDriveOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <HardDrive size={14} />
                  Nhập từ Google Drive
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nhập ảnh từ Google Drive</DialogTitle>
                </DialogHeader>
                <div className="field mb-md">
                  <label>Link folder Google Drive</label>
                  <input
                    className="input"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                  <p className="text-xs text-secondary mt-xs">
                    Folder cần để chế độ chia sẻ &quot;Anyone with the link&quot; (Bất kỳ ai có link) —
                    người xem có thể xem.
                  </p>
                </div>
                <DialogFooter>
                  <Button onClick={handleDriveImport} disabled={driveImporting}>
                    {driveImporting ? "Đang nhập..." : "Nhập ảnh"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      {album.photos.length === 0 ? (
        <div className="empty-state">
          <h3>Chưa có ảnh</h3>
          <p>Bấm &quot;Đồng bộ ảnh&quot; để nhập ảnh từ một thư mục trên máy bạn.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 8,
          }}
        >
          {(reordering ? orderedPhotos : album.photos).map((photo, index) => (
            <div
              key={photo.id}
              draggable={reordering}
              onClick={(e) => handleTileClick(e, photo, index)}
              onDragStart={(e) => handleDragStart(e, photo)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                aspectRatio: "1/1",
                borderRadius: 6,
                overflow: "hidden",
                position: "relative",
                cursor: reordering ? "grab" : undefined,
                outline: selectedIds.has(photo.id)
                  ? "3px solid var(--accent)"
                  : dragOverIndex === index
                    ? "3px dashed var(--accent)"
                    : "none",
                outlineOffset: -3,
                opacity: reordering && draggedIdsRef.current.has(photo.id) && dragOverIndex !== null ? 0.5 : 1,
              }}
            >
              <Image
                src={photo.thumbnailUrl ?? picsum(photo.id, 300, 300)}
                alt=""
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
              {(photo.likeCount > 0 || photo.starCount > 0) && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background:
                      photo.likeCount > 0 ? "var(--like)" : "var(--star)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photo.likeCount > 0 ? (
                    <Heart size={10} fill="#fff" color="#fff" />
                  ) : (
                    <Star size={10} fill="#1A1A1A" color="#1A1A1A" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AnalyticsTab({ album }: { album: AlbumDetail }) {
  const totalLikes = album.photos.reduce((s, p) => s + p.likeCount, 0);
  const totalStars = album.photos.reduce((s, p) => s + p.starCount, 0);
  const submittedCount = album.customers.filter((c) => c.submittedAt).length;
  const completionRate = album.customers.length
    ? Math.round((submittedCount / album.customers.length) * 100)
    : 0;
  const maxSelections = Math.max(
    1,
    ...album.customers.map((c) => c.likes + c.stars)
  );

  return (
    <>
      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(3,1fr)" }}
      >
        <div className="stat-card">
          <span className="text-sm">Tổng lượt thích ♥</span>
          <div className="num">{totalLikes}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Tổng lượt sao ⭐</span>
          <div className="num">{totalStars}</div>
        </div>
        <div className="stat-card">
          <span className="text-sm">Tỉ lệ hoàn thành</span>
          <div className="num">{completionRate}%</div>
        </div>
      </div>
      <div className="card">
        <div className="card-body lg">
          <h3 className="mb-md">Lựa chọn theo khách hàng</h3>
          {album.customers.length === 0 ? (
            <p className="text-secondary">Chưa có dữ liệu.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {album.customers.map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between mb-sm">
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {c.name}
                    </span>
                    <span className="text-sm">
                      {c.likes + c.stars === 0
                        ? "Chưa xem"
                        : `${c.likes} ♥ · ${c.stars} ⭐`}
                    </span>
                  </div>
                  <div className="bar-row">
                    <div className="track">
                      <div
                        className="fill"
                        style={{
                          width: `${((c.likes + c.stars) / maxSelections) * 100}%`,
                          background: "var(--like)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SettingsTab({
  album,
  onSaved,
  onDeleted,
}: {
  album: AlbumDetail;
  onSaved: (updated: Partial<AlbumDetail>) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(album.name);
  const [description, setDescription] = useState(album.description ?? "");
  const [template, setTemplate] = useState(album.template);
  const [expiryDate, setExpiryDate] = useState(
    album.expiryDate ? album.expiryDate.slice(0, 10) : ""
  );
  const [passwordEnabled, setPasswordEnabled] = useState(album.passwordProtected);
  const [passwordValue, setPasswordValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (passwordEnabled && !album.passwordProtected && !passwordValue.trim()) {
      toast("Nhập mật khẩu cho album trước khi bật bảo vệ.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name,
        description,
        template,
        expiryDate: expiryDate || null,
      };
      if (passwordEnabled && passwordValue.trim()) {
        body.password = passwordValue.trim();
      } else if (!passwordEnabled && album.passwordProtected) {
        body.password = null;
      }
      const res = await api<{ passwordProtected: boolean }>(`/api/albums/${album.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      onSaved({ name, description, template, expiryDate, passwordProtected: res.passwordProtected });
      setPasswordValue("");
      toast("Đã lưu thay đổi");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div
        className="card-body lg"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div className="field">
          <label>Tên album</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Mô tả</label>
          <textarea
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Template</label>
          <select
            className="input"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="classic">Classic</option>
            <option value="premium">Premium</option>
            <option value="wedding">Wedding</option>
            <option value="family">Family</option>
            <option value="editorial">Editorial</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p style={{ fontWeight: 600, fontSize: 13 }}>
              Bảo vệ bằng mật khẩu
            </p>
            <span className="text-sm">
              Bật: khách nhập 1 mật khẩu chung để xem (phù hợp cô dâu chú rể).
              Tắt: khách bắt buộc nhập tên + SĐT trước khi chọn ảnh (phù hợp kỷ yếu, nhiều khách).
            </span>
          </div>
          <Switch
            checked={passwordEnabled}
            onCheckedChange={(checked) => setPasswordEnabled(checked === true)}
          />
        </div>
        {passwordEnabled && (
          <div className="field">
            <label>
              {album.passwordProtected ? "Đổi mật khẩu (để trống nếu giữ nguyên)" : "Mật khẩu"}
            </label>
            <input
              className="input"
              type="text"
              placeholder={album.passwordProtected ? "••••••••" : "Tối thiểu 4 ký tự"}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label>Ngày hết hạn</label>
          <input
            className="input"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          <DeleteDialog albumId={album.id} onDeleted={onDeleted} />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({
  albumId,
  onDeleted,
}: {
  albumId: string;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api(`/api/albums/${albumId}`, { method: "DELETE" });
      toast("Đã xoá album");
      onDeleted();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể xoá album");
      setDeleting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Xoá album</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xoá album?</DialogTitle>
        </DialogHeader>
        <p className="text-secondary">
          Hành động này không thể hoàn tác. Toàn bộ dữ liệu lựa chọn của khách
          sẽ bị xoá.
        </p>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Đang xoá..." : "Xoá album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExportTab({ album }: { album: AlbumDetail }) {
  const likedCount = album.photos.filter((p) => p.likeCount > 0).length;
  const starredCount = album.photos.filter((p) => p.starCount > 0).length;
  const cards = [
    {
      title: "Danh sách ảnh Thích (♥)",
      desc: `${likedCount} ảnh — dùng để in / chọn album chính`,
      cta: "Tải danh sách",
    },
    {
      title: "Danh sách ảnh Sao (⭐)",
      desc: `${starredCount} ảnh — dùng cho khách tải cá nhân`,
      cta: "Tải danh sách",
    },
    {
      title: "Thống kê (CSV)",
      desc: "Toàn bộ số liệu lượt xem, thích, sao",
      cta: "Tải CSV",
    },
    {
      title: "Lựa chọn khách hàng (JSON)",
      desc: "Chi tiết theo từng khách để xử lý ảnh",
      cta: "Tải JSON",
    },
  ];
  return (
    <div className="album-grid">
      {cards.map((c) => (
        <div className="card" key={c.title}>
          <div className="card-body lg">
            <h3>{c.title}</h3>
            <p className="text-sm" style={{ margin: "6px 0 16px" }}>
              {c.desc}
            </p>
            <Button
              variant="secondary"
              onClick={() => toast("Xuất file chưa được nối trong bản demo này")}
            >
              {c.cta}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
