"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  Heart,
  Star,
  MessageSquare,
  MessageSquareMore,
  QrCode,
  Share2,
  Download,
  Folder,
  Plus,
  Grid3x3,
  Grid2x2,
  LayoutDashboard,
  RefreshCw,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { picsum } from "@/lib/mock-data";
import { api, ApiError } from "@/lib/api-client";
import { getCarouselState, shortestDistance } from "@/lib/carousel-position";
import type { AlbumPhoto, PublicAlbumInfo } from "@/lib/types";

type ViewMode = "masonry" | "grid" | "carousel";

interface CustomFolder {
  id: string;
  name: string;
  photoIds: string[];
}
type SortMode = "creation" | "filename" | "upload";

// Masonry needs photos with varying aspect ratios to actually look like a
// waterfall — deterministic per-photo ratio so it's stable across re-renders.
const MASONRY_RATIOS = [1, 1.35, 0.72, 1.15, 0.85, 1.5, 0.65, 1.05];
function masonryRatio(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return MASONRY_RATIOS[hash % MASONRY_RATIOS.length];
}

export default function GalleryPage({
  params,
}: {
  params: { linkId: string };
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [album, setAlbum] = useState<PublicAlbumInfo | null>(null);
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("masonry");
  const [sort, setSort] = useState<SortMode>("creation");
  // null = follow the responsive CSS default; set once the user drags the
  // size slider (Masonry/Grid only — fewer columns = bigger photos).
  const [gridSize, setGridSize] = useState<number | null>(null);
  const [filterLike, setFilterLike] = useState(false);
  const [filterStar, setFilterStar] = useState(false);

  // Custom photo groups (e.g. "Buổi sáng" / "Buổi tối") — local to this
  // session for now (no backend persistence yet), created by whoever is
  // organizing the album via the "+" button next to "All".
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [folderSelectedIds, setFolderSelectedIds] = useState<Set<string>>(new Set());
  const [folderLastClickedIndex, setFolderLastClickedIndex] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const lastWheelTimeRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const prevViewRef = useRef<ViewMode>("masonry");
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [recCount, setRecCount] = useState(0);
  // Comments are local-only (no backend persistence yet, matching Recommend)
  // — tracked per-photo just to show a "commented" badge like Like/Star.
  const [commentedIds, setCommentedIds] = useState<Set<string>>(new Set());
  const [recText, setRecText] = useState("");
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  // Gallery is browsable by anyone with no gate. The gate only appears as a
  // modal the first time someone tries to Like/Star/Submit — identifying
  // then replays whatever action triggered it. A ref (not state) so the
  // replay call right after identifying reads the up-to-date value instead
  // of a stale closure from the render that opened the gate.
  const identifiedRef = useRef(false);
  // Only customers who identified with the album's password (the couple) can
  // Star — everyone else (name+phone guests) can only Like. Defaults to true
  // so Star stays visible pre-identification; narrows once we know who it is.
  const [canStar, setCanStar] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateError, setGateError] = useState("");
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const pendingAction = useRef<
    | { kind: "like" | "star"; id: string }
    | { kind: "submit" }
    | null
  >(null);

  async function loadPhotos() {
    const photosRes = await api<{ data: AlbumPhoto[] }>(
      `/api/public/album/${params.linkId}/photos`
    );
    setPhotos(photosRes.data);
    setActiveId(photosRes.data[0]?.id ?? null);
    setCoverPhotoId(photosRes.data[2]?.id ?? photosRes.data[0]?.id ?? null);
  }

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const info = await api<PublicAlbumInfo>(
        `/api/public/album/${params.linkId}`
      );
      if (cancelled) return;
      setAlbum(info);
      await loadPhotos();

      // Silent probe: succeeds immediately if this browser already has a
      // valid guest session for this album — no modal needed. Failure just
      // means "not identified yet", which is fine until they try to select.
      try {
        const res = await api<{ customerId: string; isPrimary: boolean }>(
          `/api/public/album/${params.linkId}/customers`,
          { method: "POST", body: JSON.stringify({}) }
        );
        if (!cancelled) {
          identifiedRef.current = true;
          setCanStar(res.isPrimary);
        }
      } catch {
        /* not identified yet — gate opens lazily on first selection */
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.linkId]);

  function requireIdentity(action: { kind: "like" | "star"; id: string } | { kind: "submit" }) {
    pendingAction.current = action;
    setGateError("");
    setGateOpen(true);
  }

  async function submitGate(fields: { name?: string; phone?: string; password?: string }) {
    setGateError("");
    setGateSubmitting(true);
    try {
      const res = await api<{ customerId: string; isPrimary: boolean }>(
        `/api/public/album/${params.linkId}/customers`,
        { method: "POST", body: JSON.stringify(fields) }
      );
      identifiedRef.current = true;
      setCanStar(res.isPrimary);
      setGateOpen(false);
      const action = pendingAction.current;
      pendingAction.current = null;
      if (action?.kind === "like") await toggleLike(action.id);
      else if (action?.kind === "star") {
        if (res.isPrimary) await toggleStar(action.id);
        else toast("Chỉ Cô dâu & Chú rể mới đánh dấu Sao ⭐ được — bạn có thể dùng ♥ Thích nhé.");
      } else if (action?.kind === "submit") await handleFinalSubmit();
    } catch (e) {
      setGateError(e instanceof ApiError ? e.message : "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setGateSubmitting(false);
    }
  }

  const likeCount = photos.filter((p) => p.liked).length;
  const starCount = photos.filter((p) => p.starred).length;

  const sortedPhotos = useMemo(() => {
    const arr = [...photos];
    if (sort === "filename") {
      arr.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
    } else if (sort === "upload") {
      arr.reverse();
    }
    return arr;
  }, [photos, sort]);

  const activeFolder = activeFolderId ? folders.find((f) => f.id === activeFolderId) ?? null : null;
  const folderPhotos = activeFolder
    ? sortedPhotos.filter((p) => activeFolder.photoIds.includes(p.id))
    : sortedPhotos;

  // Clicking "Like {n}" / "Star {n}" filters the grid below to just those
  // photos (union when both are on) and scopes "Copy Name" to that set.
  const anyStatFilter = filterLike || filterStar;
  const visiblePhotos = anyStatFilter
    ? folderPhotos.filter((p) => (filterLike && p.liked) || (filterStar && p.starred))
    : folderPhotos;

  function toast(msg: string) {
    setToastMsg(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200);
  }

  async function toggleLike(id: string) {
    if (!identifiedRef.current) {
      requireIdentity({ kind: "like", id });
      return;
    }
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const nextLiked = !photo.liked;
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: nextLiked } : p))
    );
    toast(nextLiked ? "Đã thêm vào Thích ♥" : "Đã bỏ chọn");
    try {
      if (nextLiked) {
        await api(`/api/public/album/${params.linkId}/selections`, {
          method: "POST",
          body: JSON.stringify({ photoId: id, type: "like" }),
        });
      } else {
        await api(
          `/api/public/album/${params.linkId}/selections/${id}?type=like`,
          { method: "DELETE" }
        );
      }
    } catch (e) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, liked: !nextLiked } : p))
      );
      if (e instanceof ApiError && e.status === 401) {
        identifiedRef.current = false;
        requireIdentity({ kind: "like", id });
      } else {
        toast(e instanceof ApiError ? e.message : "Có lỗi xảy ra, thử lại nhé");
      }
    }
  }

  async function toggleStar(id: string) {
    if (!identifiedRef.current) {
      requireIdentity({ kind: "star", id });
      return;
    }
    if (!canStar) {
      toast("Chỉ Cô dâu & Chú rể mới đánh dấu Sao ⭐ được — bạn có thể dùng ♥ Thích nhé.");
      return;
    }
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    const nextStarred = !photo.starred;
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, starred: nextStarred } : p))
    );
    toast(nextStarred ? "Đã đánh dấu Sao ⭐" : "Đã bỏ chọn");
    try {
      if (nextStarred) {
        await api(`/api/public/album/${params.linkId}/selections`, {
          method: "POST",
          body: JSON.stringify({ photoId: id, type: "star" }),
        });
      } else {
        await api(
          `/api/public/album/${params.linkId}/selections/${id}?type=star`,
          { method: "DELETE" }
        );
      }
    } catch (e) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, starred: !nextStarred } : p))
      );
      if (e instanceof ApiError && e.status === 401) {
        identifiedRef.current = false;
        requireIdentity({ kind: "star", id });
      } else {
        toast("Có lỗi xảy ra, thử lại nhé");
      }
    }
  }

  const lightboxIndex = sortedPhotos.findIndex((p) => p.id === lightboxId);
  const lightboxPhoto = lightboxIndex >= 0 ? sortedPhotos[lightboxIndex] : null;

  function openLightbox(id: string) {
    setActiveId(id);
    setLightboxId(id);
  }
  function closeLightbox() {
    setLightboxId(null);
  }
  function lbStep(dir: number) {
    if (lightboxIndex < 0) return;
    const next = (lightboxIndex + dir + sortedPhotos.length) % sortedPhotos.length;
    const nextPhoto = sortedPhotos[next];
    setActiveId(nextPhoto.id);
    setLightboxId(nextPhoto.id);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxId) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") lbStep(1);
        if (e.key === "ArrowLeft") lbStep(-1);
        return;
      }
      if (view === "carousel" && sortedPhotos.length > 0) {
        if (e.key === "ArrowRight") {
          setCarouselIndex((i) => (i + 1) % sortedPhotos.length);
        }
        if (e.key === "ArrowLeft") {
          setCarouselIndex((i) => (i - 1 + sortedPhotos.length) % sortedPhotos.length);
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxId, sortedPhotos, view]);

  // Lightbox is a fullscreen image viewer — lock page scroll behind it,
  // same as the 3D Carousel overlay.
  useEffect(() => {
    if (!lightboxId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxId]);

  function handleFolderPhotoClick(e: React.MouseEvent, index: number, id: string) {
    if (e.shiftKey && folderLastClickedIndex !== null) {
      const [start, end] =
        folderLastClickedIndex < index ? [folderLastClickedIndex, index] : [index, folderLastClickedIndex];
      setFolderSelectedIds((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) next.add(sortedPhotos[i].id);
        return next;
      });
    } else {
      setFolderSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    setFolderLastClickedIndex(index);
  }

  function openFolderModal() {
    setFolderNameInput("");
    setFolderSelectedIds(new Set());
    setFolderLastClickedIndex(null);
    setFolderModalOpen(true);
  }

  function saveFolder() {
    if (!folderNameInput.trim()) {
      toast("Nhập tên nhóm ảnh");
      return;
    }
    if (folderSelectedIds.size === 0) {
      toast("Chưa chọn ảnh nào");
      return;
    }
    const folder: CustomFolder = {
      id: `f-${Date.now()}`,
      name: folderNameInput.trim(),
      photoIds: Array.from(folderSelectedIds),
    };
    setFolders((prev) => [...prev, folder]);
    setActiveFolderId(folder.id);
    setFolderModalOpen(false);
    toast(`Đã tạo nhóm "${folder.name}" — ${folder.photoIds.length} ảnh`);
  }

  function copyName() {
    if (anyStatFilter) {
      const names = visiblePhotos.map((p) => p.filename);
      if (names.length === 0) {
        toast("Không có ảnh nào để copy");
        return;
      }
      navigator.clipboard?.writeText(names.join("\n")).then(
        () => toast(`Đã copy tên ${names.length} ảnh`),
        () => toast("Không thể copy")
      );
      return;
    }
    const photo = photos.find((p) => p.id === activeId);
    const name = photo?.filename ?? "photo.jpg";
    navigator.clipboard?.writeText(name).then(
      () => toast(`Đã copy tên: ${name}`),
      () => toast("Không thể copy")
    );
  }
  function share() {
    if (navigator.share) {
      navigator.share({ title: document.title, url: location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(location.href).then(() =>
        toast("Đã copy link chia sẻ")
      );
    }
  }
  function download() {
    const photo = photos.find((p) => p.id === activeId) ?? photos[0];
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo.originalUrl ?? photo.previewUrl ?? picsum(photo.id, 1200, 1200);
    a.download = photo.filename;
    a.target = "_blank";
    a.click();
  }
  function submitRecommend() {
    if (recText.trim()) {
      setRecCount((c) => c + 1);
      if (activeId) setCommentedIds((prev) => new Set(prev).add(activeId));
      toast("Đã gửi nhận xét");
    }
    setRecOpen(false);
    setRecText("");
  }

  async function handleFinalSubmit() {
    if (!identifiedRef.current) {
      requireIdentity({ kind: "submit" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<{ liked: number; starred: number }>(
        `/api/public/album/${params.linkId}/submit`,
        { method: "POST" }
      );
      router.push(
        `/album/${params.linkId}/confirm?liked=${res.liked}&starred=${res.starred}`
      );
    } catch {
      toast("Không thể nộp lựa chọn, thử lại nhé");
      setSubmitting(false);
    }
  }

  const carouselPhotos = sortedPhotos;
  const coverPhoto = photos.find((p) => p.id === coverPhotoId) ?? photos[0];

  function carouselStep(dir: 1 | -1) {
    if (carouselPhotos.length === 0) return;
    setCarouselIndex((i) => (i + dir + carouselPhotos.length) % carouselPhotos.length);
  }

  // Touch swipe (mobile) — swipe left advances, swipe right goes back.
  function handleCarouselTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }
  function handleCarouselTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    carouselStep(dx < 0 ? 1 : -1);
  }

  // Mouse wheel / trackpad over the carousel steps one card per "tick" —
  // attached as a native, non-passive listener (React's synthetic onWheel
  // can't reliably preventDefault) so scrolling the wheel drives the
  // carousel instead of also scrolling the page underneath it.
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || view !== "carousel") return;
    function onWheel(e: WheelEvent) {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 12) return;
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 240) return;
      lastWheelTimeRef.current = now;
      carouselStep(delta > 0 ? 1 : -1);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, carouselPhotos.length]);

  function closeCarousel() {
    setView(prevViewRef.current);
  }

  // 3D Carousel takes over the whole screen while active — Esc closes it
  // back to whichever view was showing before, and the page behind can't
  // scroll while it's up (nothing to leak the wheel to).
  useEffect(() => {
    if (view !== "carousel") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCarousel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if (!album) return null;

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <BrandMark />
          <span className="name">Books View</span>
        </div>
        <div className="header-actions">
          <div
            className="progress-track"
            title={`Đã xem ${photos.length}/${album.photoCount} ảnh`}
          >
            <div
              className="progress-fill"
              style={{
                width: `${album.photoCount ? Math.round((photos.length / album.photoCount) * 100) : 0}%`,
              }}
            />
          </div>
          <button
            className="icon-btn"
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Cover */}
      <div className="gh-cover">
        <Image
          src={coverPhoto?.previewUrl ?? picsum(`hero-${params.linkId}`, 1600, 1000)}
          alt="Cover"
          fill
          unoptimized
          style={{ objectFit: "cover" }}
        />
        <div className="gh-cover-top">
          <Link href={`/album/${params.linkId}`} className="gh-back">
            <ChevronLeft size={15} />
            Back
          </Link>
          <button className="gh-lang" type="button">
            EN
          </button>
        </div>
        <div className="gh-cover-bottom">
          <div className="gh-cover-title">
            <h1>{album.name}</h1>
            <p>{album.name}</p>
          </div>
          <button
            className="gh-change-cover"
            type="button"
            onClick={() => setCoverOpen(true)}
          >
            <Grid3x3 size={15} />
            Change Cover
          </button>
        </div>
      </div>

      {/* Stats / actions */}
      <div className="gh-toolbar">
        <div className="gh-stats">
          <span className="gh-stat gh-stat-total">
            Total {photos.length} / {photos.length}
          </span>
          <button
            type="button"
            className="gh-stat gh-stat-like"
            style={{
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              borderBottom: filterLike ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 2,
            }}
            onClick={() => setFilterLike((f) => !f)}
          >
            <Heart size={16} /> Like {likeCount}
          </button>
          <button
            type="button"
            className="gh-stat gh-stat-star"
            style={{
              cursor: "pointer",
              border: "none",
              background: "transparent",
              fontFamily: "inherit",
              borderBottom: filterStar ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 2,
            }}
            onClick={() => setFilterStar((f) => !f)}
          >
            <Star size={16} /> Star {starCount}
          </button>
          <span
            className="gh-stat gh-stat-rec"
            style={{ cursor: "pointer" }}
            onClick={() => setRecOpen(true)}
          >
            <MessageSquare size={16} /> Recommend {recCount}
          </span>
        </div>
        <div className="gh-actions">
          <button className="gh-btn" type="button" onClick={() => setQrOpen(true)}>
            <QrCode size={15} />
            QR Code
          </button>
          <button className="gh-btn" type="button" onClick={copyName}>
            Copy Name
          </button>
          <button className="gh-btn" type="button" onClick={share}>
            <Share2 size={15} />
            Share
          </button>
          <button className="gh-btn" type="button" onClick={download}>
            <Download size={15} />
            Download
          </button>
        </div>
      </div>

      {/* Folder filter */}
      <div className="gh-folders">
        <button
          className={`gh-folder-btn${activeFolderId === null ? " active" : ""}`}
          type="button"
          onClick={() => setActiveFolderId(null)}
        >
          <Folder size={16} />
          All
        </button>
        {folders.map((f) => (
          <button
            key={f.id}
            className={`gh-folder-btn${activeFolderId === f.id ? " active" : ""}`}
            type="button"
            onClick={() => setActiveFolderId(f.id)}
          >
            <Folder size={16} />
            {f.name} ({f.photoIds.length})
          </button>
        ))}
        <button
          className="gh-folder-btn"
          type="button"
          onClick={openFolderModal}
          title="Thêm nhóm ảnh"
          aria-label="Thêm nhóm ảnh"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* View switcher + sort */}
      <div className="gh-viewbar">
        {(view === "masonry" || view === "grid") && (
          <div
            className="flex items-center gap-sm"
            style={{ color: "rgba(255,255,255,.7)" }}
            title="Cỡ ảnh"
          >
            <button
              type="button"
              className="gh-view-btn"
              onClick={() =>
                setGridSize(Math.min(6, (gridSize ?? (view === "masonry" ? 4 : 5)) + 1))
              }
              title="Thu nhỏ ảnh"
              aria-label="Thu nhỏ ảnh"
            >
              <ZoomOut size={14} />
            </button>
            <Grid3x3 size={12} />
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={8 - (gridSize ?? (view === "masonry" ? 4 : 5))}
              onChange={(e) => setGridSize(8 - Number(e.target.value))}
              style={{ width: 90 }}
              aria-label="Cỡ ảnh — kéo sang phải để phóng to"
            />
            <Grid2x2 size={14} />
            <button
              type="button"
              className="gh-view-btn"
              onClick={() =>
                setGridSize(Math.max(2, (gridSize ?? (view === "masonry" ? 4 : 5)) - 1))
              }
              title="Phóng to ảnh"
              aria-label="Phóng to ảnh"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        )}
        <div className="gh-view-switch">
          <button
            className={`gh-view-btn${view === "masonry" ? " active" : ""}`}
            title="Masonry Grid"
            type="button"
            onClick={() => setView("masonry")}
          >
            <LayoutDashboard size={16} />
          </button>
          <button
            className={`gh-view-btn${view === "grid" ? " active" : ""}`}
            title="Grid"
            type="button"
            onClick={() => setView("grid")}
          >
            <Grid3x3 size={16} />
          </button>
          <button
            className={`gh-view-btn${view === "carousel" ? " active" : ""}`}
            title="3D Carousel"
            type="button"
            onClick={() => {
              if (view !== "carousel") prevViewRef.current = view;
              setView("carousel");
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className={`gh-sort${sortOpen ? " open" : ""}`}>
          <button
            className="gh-sort-btn"
            type="button"
            onClick={() => setSortOpen((o) => !o)}
          >
            <ChevronDown size={16} />
            <span>
              {sort === "creation"
                ? "Creation Time"
                : sort === "filename"
                  ? "File Name"
                  : "Last Upload"}
            </span>
          </button>
          <div className="gh-sort-menu">
            {(
              [
                ["creation", "Creation Time"],
                ["filename", "File Name"],
                ["upload", "Last Upload"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                className={`gh-sort-opt${sort === value ? " active" : ""}`}
                type="button"
                onClick={() => {
                  setSort(value);
                  setSortOpen(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Carousel — geometry per docs/3d-carousel reference spec.
          Takes over the whole screen while active (fixed overlay) so the
          wheel-lock covers the entire visible frame with nothing behind it
          to leak a scroll to — X button or Esc returns to the prior view. */}
      {view === "carousel" && (
        <div ref={carouselRef} className="gh-carousel-overlay">
        <button
          type="button"
          className="gh-carousel-overlay-close"
          aria-label="Đóng 3D Carousel"
          onClick={closeCarousel}
        >
          <X size={20} />
        </button>
        <div
          className="gh-carousel active"
          onTouchStart={handleCarouselTouchStart}
          onTouchEnd={handleCarouselTouchEnd}
        >
          <button
            className="gh-carousel-nav gh-carousel-prev"
            type="button"
            aria-label="Ảnh trước"
            onClick={() =>
              setCarouselIndex(
                (i) => (i - 1 + carouselPhotos.length) % carouselPhotos.length
              )
            }
          >
            ‹
          </button>
          <div className="gh-carousel-track">
            {carouselPhotos.map((photo, i) => {
              const distance = shortestDistance(i, carouselIndex, carouselPhotos.length);
              const abs = Math.abs(distance);
              // Windowed DOM: only mount active ±4 (Center..Hidden) — a 5000-photo
              // album shouldn't mount 5000 absolutely-positioned 3D cards.
              if (abs > 4) return null;
              const s = getCarouselState(distance);
              // Pull each side card 5px closer to Center so the two cards'
              // rounded edges don't leave a visible background seam between
              // them (more noticeable now that the cards are bigger).
              const dirSign = Math.sign(s.translateXPct);
              const translateX = dirSign === 0 ? "0%" : `calc(${s.translateXPct}% - ${dirSign * 5}px)`;
              return (
                <div
                  key={photo.id}
                  className="gh-carousel-item"
                  style={{
                    transform: `translate(-50%,-50%) translateX(${translateX}) rotateY(${s.rotateYDeg}deg) scale(${s.scale})`,
                    zIndex: s.zIndex,
                    opacity: s.opacity,
                    filter: s.brightness === 1 ? "none" : `brightness(${s.brightness})`,
                    pointerEvents: s.pointerEvents,
                  }}
                  onClick={() => {
                    // Carousel is browse-only: side cards recenter, the
                    // active card does nothing — no lightbox from here.
                    if (i !== carouselIndex) setCarouselIndex(i);
                  }}
                >
                  <Image
                    src={photo.previewUrl ?? picsum(photo.id, 400, 500)}
                    alt=""
                    width={520}
                    height={660}
                    unoptimized
                    priority={abs === 0}
                    loading={abs === 0 ? undefined : "lazy"}
                  />
                  {(photo.liked || photo.starred || commentedIds.has(photo.id)) && (
                    <div className="tile-badges">
                      {photo.liked && (
                        <span className="b b-like">
                          <Heart size={12} fill="#fff" color="#fff" />
                        </span>
                      )}
                      {photo.starred && (
                        <span className="b b-star" style={{ background: "rgba(212,165,116,.9)" }}>
                          <Star size={12} fill="#1A1A1A" color="#1A1A1A" />
                        </span>
                      )}
                      {commentedIds.has(photo.id) && (
                        <span className="b b-comment" style={{ background: "rgba(76,139,245,.9)" }}>
                          <MessageSquareMore size={12} color="#fff" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            className="gh-carousel-nav gh-carousel-next"
            type="button"
            aria-label="Ảnh sau"
            onClick={() =>
              setCarouselIndex((i) => (i + 1) % carouselPhotos.length)
            }
          >
            ›
          </button>
        </div>

        {/* Active-photo actions — a fixed row below the carousel (not an
            overlay on the card itself) so Like/Star/Comment stay reachable
            regardless of how tall the centered card is or how far scrolled. */}
        {carouselPhotos[carouselIndex] && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--sp-md)",
            padding: "var(--sp-lg)",
            marginTop: 16,
            // Fixed dark background (like the rest of the gallery's photo-
            // viewing chrome) so the white icon/label stay visible even when
            // the site is switched to light mode — the body behind this row
            // would otherwise turn white and swallow them.
            background: "#111214",
          }}
        >
          <div className="lb-action">
            <button
              className={`pill-btn js-like${carouselPhotos[carouselIndex].liked ? " liked" : ""}`}
              onClick={() => toggleLike(carouselPhotos[carouselIndex].id)}
            >
              <Heart size={22} fill={carouselPhotos[carouselIndex].liked ? "currentColor" : "none"} />
            </button>
            Thích
          </div>
          {canStar && (
            <div className="lb-action">
              <button
                className={`pill-btn js-star${carouselPhotos[carouselIndex].starred ? " starred" : ""}`}
                onClick={() => toggleStar(carouselPhotos[carouselIndex].id)}
              >
                <Star size={22} />
              </button>
              Sao
            </div>
          )}
          <div className="lb-action">
            <button
              className="pill-btn"
              onClick={() => {
                setActiveId(carouselPhotos[carouselIndex].id);
                setRecOpen(true);
              }}
            >
              <MessageSquareMore size={22} />
            </button>
            Bình luận
          </div>
        </div>
        )}
        </div>
      )}

      {/* Grid / Masonry */}
      {view !== "carousel" && (
        <div className="container" style={{ paddingTop: 24 }}>
          <div
            className={`gallery-grid gh-view-${view}`}
            style={
              gridSize
                ? view === "masonry"
                  ? { columnCount: gridSize }
                  : { gridTemplateColumns: `repeat(${gridSize}, 1fr)` }
                : undefined
            }
          >
            {visiblePhotos.map((photo) => {
              const width = 700;
              const height =
                view === "masonry"
                  ? Math.round(width * masonryRatio(photo.id))
                  : 700;
              return (
              <div
                key={photo.id}
                className="photo-tile"
                onClick={() => openLightbox(photo.id)}
              >
                <Image
                  src={photo.previewUrl ?? picsum(photo.id, width, height)}
                  alt=""
                  width={width}
                  height={height}
                  unoptimized
                />
                {(photo.liked || photo.starred || commentedIds.has(photo.id)) && (
                  <div className="tile-badges">
                    {photo.liked && (
                      <span className="b b-like">
                        <Heart size={12} fill="#fff" color="#fff" />
                      </span>
                    )}
                    {photo.starred && (
                      <span
                        className="b b-star"
                        style={{ background: "rgba(212,165,116,.9)" }}
                      >
                        <Star size={12} fill="#1A1A1A" color="#1A1A1A" />
                      </span>
                    )}
                    {commentedIds.has(photo.id) && (
                      <span className="b b-comment" style={{ background: "rgba(76,139,245,.9)" }}>
                        <MessageSquareMore size={12} color="#fff" />
                      </span>
                    )}
                  </div>
                )}
                <div className="tile-actions">
                  <button
                    className={`pill-btn js-like${photo.liked ? " liked" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(photo.id);
                      toggleLike(photo.id);
                    }}
                  >
                    <Heart size={18} fill={photo.liked ? "currentColor" : "none"} />
                  </button>
                  {canStar && (
                    <button
                      className={`pill-btn js-star${photo.starred ? " starred" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveId(photo.id);
                        toggleStar(photo.id);
                      }}
                    >
                      <Star size={18} />
                    </button>
                  )}
                  <button
                    className="pill-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(photo.id);
                      setRecOpen(true);
                    }}
                  >
                    <MessageSquareMore size={18} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="sticky-bar">
        <span className="text-sm">
          {likeCount} ảnh ♥ thích · {starCount} ảnh ⭐ sao
        </span>
        <Button onClick={handleFinalSubmit} disabled={submitting}>
          {submitting ? "Đang gửi..." : "Hoàn tất & Chọn ảnh"}
        </Button>
      </div>

      {/* QR modal */}
      {qrOpen && (
        <div
          className="gh-modal-backdrop open"
          onClick={(e) => e.target === e.currentTarget && setQrOpen(false)}
        >
          <div className="gh-modal">
            <h3>Quét mã để mở Gallery</h3>
            <div className="gh-qr-box">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(location.href ?? "")}`}
                alt="QR"
                width={160}
                height={160}
                unoptimized
              />
            </div>
            <button
              className="gh-modal-close"
              type="button"
              onClick={() => setQrOpen(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Cover picker modal */}
      {coverOpen && (
        <div
          className="gh-modal-backdrop open"
          onClick={(e) => e.target === e.currentTarget && setCoverOpen(false)}
        >
          <div className="gh-modal" style={{ maxWidth: 420 }}>
            <h3>Chọn ảnh làm Cover</h3>
            <div className="gh-cover-picker">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`gh-cover-pick-item${coverPhotoId === photo.id ? " selected" : ""}`}
                  onClick={() => {
                    setCoverPhotoId(photo.id);
                    setCoverOpen(false);
                    toast("Đã cập nhật Cover (demo)");
                  }}
                >
                  <Image
                    src={photo.thumbnailUrl ?? picsum(photo.id, 200, 200)}
                    alt=""
                    width={100}
                    height={100}
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <button
              className="gh-modal-close"
              type="button"
              onClick={() => setCoverOpen(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Add folder/group modal — name + multi-select from "All" */}
      {folderModalOpen && (
        <div
          className="gh-modal-backdrop open"
          onClick={(e) => e.target === e.currentTarget && setFolderModalOpen(false)}
        >
          <div
            className="gh-modal gh-modal-resizable"
            style={{ maxWidth: 480, textAlign: "left" }}
          >
            <h3 style={{ textAlign: "center" }}>Thêm nhóm ảnh</h3>
            <div className="field mt-sm">
              <label style={{ color: "#fff" }}>Tên nhóm</label>
              <input
                className="input"
                placeholder="Ví dụ: Buổi sáng, Tiệc tối…"
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                autoFocus
              />
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,.6)", margin: "10px 0 4px" }}>
              Chọn ảnh cho nhóm này — Click chọn 1 · Shift+Click chọn khoảng đầu-cuối ·
              Cmd/Ctrl+Click chọn rời từng ảnh. Đã chọn: {folderSelectedIds.size}
            </p>
            <div className="gh-cover-picker" style={{ maxHeight: 320 }}>
              {sortedPhotos.map((photo, i) => (
                <div
                  key={photo.id}
                  className={`gh-cover-pick-item${folderSelectedIds.has(photo.id) ? " selected" : ""}`}
                  onClick={(e) => handleFolderPhotoClick(e, i, photo.id)}
                >
                  <Image
                    src={photo.thumbnailUrl ?? picsum(photo.id, 200, 200)}
                    alt=""
                    width={100}
                    height={100}
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Button onClick={saveFolder} style={{ flex: 1 }}>
                Tạo nhóm
              </Button>
              <button
                className="gh-modal-close"
                type="button"
                style={{
                  flex: 1,
                  marginTop: 0,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setFolderModalOpen(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommend modal */}
      {recOpen && (
        <div
          className="gh-modal-backdrop open"
          onClick={(e) => e.target === e.currentTarget && setRecOpen(false)}
        >
          <div className="gh-modal">
            <h3>Nhận xét / Đề xuất ảnh</h3>
            <textarea
              value={recText}
              onChange={(e) => setRecText(e.target.value)}
              placeholder="Viết nhận xét của bạn..."
              style={{
                width: "100%",
                minHeight: 90,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 8,
                color: "#fff",
                padding: 10,
                fontFamily: "inherit",
                fontSize: 13,
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "center",
              }}
            >
              <button
                className="gh-modal-close"
                type="button"
                onClick={submitRecommend}
                style={{
                  background: "var(--accent)",
                  borderColor: "var(--accent)",
                  color: "#1a1a1a",
                }}
              >
                Gửi
              </button>
              <button
                className="gh-modal-close"
                type="button"
                onClick={() => setRecOpen(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Identify gate modal — opens lazily on first Like/Star/Submit */}
      {gateOpen && (
        <IdentifyGate
          album={album}
          submitting={gateSubmitting}
          error={gateError}
          onSubmit={submitGate}
          onClose={() => {
            pendingAction.current = null;
            setGateOpen(false);
          }}
        />
      )}

      {toastMsg && <div className="gh-toast show">{toastMsg}</div>}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="lightbox open">
          <div className="lb-top">
            <span className="text-sm" style={{ color: "rgba(255,255,255,.7)" }}>
              {album.name}
            </span>
            <button className="lb-close" type="button" onClick={closeLightbox}>
              <X size={18} />
            </button>
          </div>
          <button className="lb-nav lb-prev" type="button" onClick={() => lbStep(-1)}>
            <ChevronLeft size={22} />
          </button>
          <button className="lb-nav lb-next" type="button" onClick={() => lbStep(1)}>
            <ChevronRight size={22} />
          </button>

          <div className="lb-img-wrap">
            {/* previewUrl first — same URL the grid tile already loaded, so
                the browser serves it from cache and the lightbox opens
                instantly instead of fetching the full-res original. */}
            <Image
              src={lightboxPhoto.previewUrl ?? lightboxPhoto.originalUrl ?? picsum(lightboxPhoto.id, 1200, 1200)}
              alt=""
              width={1000}
              height={1000}
              unoptimized
            />
          </div>

          <span className="lb-count" style={{ left: "auto", right: 24 }}>
            {lightboxIndex + 1} / {photos.length}
          </span>

          <div className="lb-bottom">
            <div className="lb-action">
              <button
                className={`pill-btn js-like${lightboxPhoto.liked ? " liked" : ""}`}
                onClick={() => toggleLike(lightboxPhoto.id)}
              >
                <Heart size={22} fill={lightboxPhoto.liked ? "currentColor" : "none"} />
              </button>
              Thích
            </div>
            <div className="lb-action">
              <button className="pill-btn" onClick={() => setRecOpen(true)}>
                <MessageSquareMore size={22} />
              </button>
              Bình luận
            </div>
            {canStar && (
              <div className="lb-action">
                <button
                  className={`pill-btn js-star${lightboxPhoto.starred ? " starred" : ""}`}
                  onClick={() => toggleStar(lightboxPhoto.id)}
                >
                  <Star size={22} />
                </button>
                Sao
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IdentifyGate({
  album,
  submitting,
  error,
  onSubmit,
  onClose,
}: {
  album: PublicAlbumInfo;
  submitting: boolean;
  error: string;
  onSubmit: (fields: { name?: string; phone?: string; password?: string }) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ password });
  }
  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, phone });
  }

  return (
    <div
      className="gh-modal-backdrop open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gh-modal" style={{ maxWidth: 380 }}>
        <h3>{album.name}</h3>
        <p className="text-secondary text-sm mb-md">
          Xác nhận để lưu lựa chọn ảnh của riêng bạn.
        </p>
        {error && (
          <p className="text-sm" style={{ color: "var(--destructive)", marginBottom: 10 }}>
            {error}
          </p>
        )}

        {album.requiresPassword && (
          <>
            <form
              onSubmit={handlePasswordSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}
            >
              <div className="field">
                <label htmlFor="gate-password">Mật khẩu (dành cho Cô dâu &amp; Chú rể)</label>
                <input
                  id="gate-password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Xác nhận mật khẩu"}
              </Button>
            </form>
            <div className="text-sm text-secondary" style={{ textAlign: "center", margin: "16px 0" }}>
              — hoặc —
            </div>
          </>
        )}

        <form
          onSubmit={handleLoginSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}
        >
          <div className="field">
            <label htmlFor="gate-name">Tên đăng nhập</label>
            <input
              id="gate-name"
              className="input"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!album.requiresPassword}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="gate-phone">Mật khẩu</label>
            <input
              id="gate-phone"
              className="input"
              type="tel"
              placeholder="Số điện thoại của bạn"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>

        <button className="gh-modal-close" type="button" onClick={onClose} style={{ marginTop: 12 }}>
          Đóng
        </button>
      </div>
    </div>
  );
}
