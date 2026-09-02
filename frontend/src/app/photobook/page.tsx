"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, UploadCloud, X, Image as ImageIcon, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type AlbumOrientation,
  type AlbumSizeOption,
  type DemoPhoto,
  type CoverSpec,
  sizesForOrientation,
  computePageSpread,
  buildAlbumBook,
  COVER_MATERIALS,
  type AlbumBook,
} from "./layoutEngine";
import { AlbumBookViewer } from "./AlbumBookViewer";
import {
  type PhotobookRecord,
  fetchHistory,
  createPhotobook,
  deletePhotobook,
  toAlbumBook,
  formatCreatedAt,
  formatExpiry,
} from "./photobookApi";
import styles from "./album-book.module.css";

const ORIENTATIONS: { id: AlbumOrientation; label: string }[] = [
  { id: "portrait", label: "Album đứng" },
  { id: "square", label: "Album vuông" },
  { id: "landscape", label: "Album ngang" },
];

const MAX_PAGE_PX = { w: 420, h: 560 };
const THUMB_PREVIEW_LIMIT = 6;

/** Draws a File onto a canvas at a capped resolution and re-encodes it —
 * shared by both the editor's own working copy (point 8: real camera
 * photos are multiple MB each, way more than a flipbook needs on
 * screen) and the localStorage snapshot (point 4/6: base64 inflates
 * another ~33%, so the share copy is capped even smaller). Aspect ratio
 * is always preserved — this only ever shrinks, never crops or stretches. */
function drawScaled(imgSrc: string, maxDim: number, quality: number): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Không tạo được canvas"));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Không nén được ảnh"));
          resolve({ url: URL.createObjectURL(blob), width: w, height: h });
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Không đọc được ảnh"));
    img.src = imgSrc;
  });
}

/** Original file is never modified — this only ever reads it into an
 * in-memory canvas and produces a NEW, separate optimized blob. Kept at
 * 1600px long edge / q0.85: plenty sharp for on-screen flipbook viewing,
 * a fraction of a real camera file's size. */
async function loadImageDims(file: File): Promise<DemoPhoto> {
  const rawUrl = URL.createObjectURL(file);
  try {
    const { url, width, height } = await drawScaled(rawUrl, 1600, 0.85);
    return { id: crypto.randomUUID(), url, width, height };
  } finally {
    URL.revokeObjectURL(rawUrl);
  }
}

/** PHOTOBOOK — demo of docs "XemAlbum.md", now a real server-persisted
 * feature. Editing itself stays exactly as before — photos live as object
 * URLs in component state, arranging/cover-picking never touches the
 * network — this proves the auto-layout + page-flip concept without
 * touching Gallery, Photo Proofing, Selection Manager, Filter & Copy, or
 * the 3D Carousel, per the spec's own module-boundary rule. This page is
 * always the full editor; the "Chia sẻ" link points clients to the
 * dedicated /photobook/album/[albumId] route instead of hiding panels
 * here. */
export default function PhotobookPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<DemoPhoto[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [orientation, setOrientation] = useState<AlbumOrientation | null>(null);
  const [selectedSize, setSelectedSize] = useState<AlbumSizeOption | null>(null);
  const [book, setBook] = useState<AlbumBook | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [pagePx, setPagePx] = useState({ w: 340, h: 480 });
  // Default is Trang đôi (spread) — user must actively tick Trang đơn.
  // Never inferred from filename, orientation, dimensions, or source.
  const [singleMode, setSingleMode] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState(false);
  const [photobookName, setPhotobookName] = useState("");
  // Bìa da (material) is the default per the spec: a Studio that never
  // picks one of their own photos as Bìa hình still gets a real cover,
  // not a blank one.
  const [coverType, setCoverType] = useState<"photo" | "material">("material");
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [coverMaterialId, setCoverMaterialId] = useState(COVER_MATERIALS[0].id);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [history, setHistory] = useState<PhotobookRecord[]>([]);
  const [creating, setCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // What the open viewer is actually showing — decoupled from
  // photobookName (the create-form's current draft) so reopening an
  // older Lịch sử Album entry displays THAT album's own name.
  const [activeName, setActiveName] = useState("");
  // Internal id (delete target / history matching) vs. shareId (the public
  // /photobook/album/{shareId} link) — split apart now that the server
  // record has two different ids, unlike the old localStorage entry which
  // used one id for both.
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [activeShareId, setActiveShareId] = useState<string | undefined>(undefined);
  // Panel 2's own rendered height is the master height for all three
  // panels. CSS Grid stretch + flex-basis:0 alone can't express "this
  // one sibling's natural size, capping the other two" — an auto-sized
  // grid row's height is always the MAX of every item's natural content
  // size, so a long Lịch sử Album list or thumbnail row still inflates
  // the whole row even with min-height:0 throughout (confirmed: without
  // this, 50 history entries blew every panel out to ~3900px). A single
  // ResizeObserver on the one reference panel — not per-panel, not
  // polling — is the smallest fix that actually works.
  const panel2Ref = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory().then(setHistory);
  }, []);

  useEffect(() => {
    const el = panel2Ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setPanelHeight(Math.round(el.getBoundingClientRect().height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleFiles(list: FileList | File[]) {
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    setAnalyzing(true);
    try {
      const loaded = await Promise.all(files.map(loadImageDims));
      setPhotos((prev) => [...prev, ...loaded]);
    } catch {
      toast("Không đọc được một số ảnh, thử lại nhé");
    } finally {
      setAnalyzing(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearAll() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
    setBook(null);
    setViewerOpen(false);
  }

  /** Size is no longer a manual step — each orientation just uses its
   * most common print size (index 1: 20×30 for Đứng/Ngang, 25×25 for
   * Vuông) so picking Đứng/Vuông/Ngang alone is enough to create the
   * album. */
  function selectOrientation(o: AlbumOrientation) {
    setOrientation(o);
    const sizes = sizesForOrientation(o);
    setSelectedSize(sizes[1] ?? sizes[0]);
  }

  const dims = orientation && selectedSize ? computePageSpread(orientation, selectedSize) : null;

  /** Bìa hình wins only if the Studio actually picked one of their
   * photos; otherwise — including if they toggled to "Bìa hình" but
   * never picked one — this falls back to whichever Bìa da is selected,
   * per "nếu không tải bìa hình thì lấy bìa da trơn bất kỳ". */
  function resolveCover(): CoverSpec {
    if (coverType === "photo" && coverPhotoId) {
      const photo = photos.find((p) => p.id === coverPhotoId);
      if (photo) return { kind: "photo", photo };
    }
    const material = COVER_MATERIALS.find((m) => m.id === coverMaterialId) ?? COVER_MATERIALS[0];
    return { kind: "material", material };
  }

  async function buildAndShowAlbum(mode: boolean) {
    if (!dims || photos.length === 0 || creating) return;
    const built = buildAlbumBook(photos, mode, resolveCover());
    const aspect = dims.pageWidth / dims.pageHeight;
    let h = MAX_PAGE_PX.h;
    let w = h * aspect;
    if (w > MAX_PAGE_PX.w) {
      w = MAX_PAGE_PX.w;
      h = w / aspect;
    }
    const px = { w: Math.round(w), h: Math.round(h) };
    setPagePx(px);
    setBook(built);
    setActiveName(photobookName);
    setViewerOpen(true);
    setActiveShareId(undefined);

    // Persist: upload every photo (cover + pages) to the server — resized
    // to 2048px/72dpi, saved as a real Photobook row — and that becomes
    // /photobook/album/{shareId}. The standalone viewer route reads that
    // record from the database, not this page's React state, so the link
    // keeps working in a new tab, pasted fresh, refreshed, or after
    // /photobook itself is closed.
    setCreating(true);
    try {
      const entry = await createPhotobook(
        built,
        px,
        photobookName,
        orientation ?? "portrait",
        mode ? "single" : "spread"
      );
      setHistory((h) => [entry, ...h]);
      setActiveEntryId(entry.id);
      setActiveShareId(entry.shareId);
      toast("Đã tạo Photobook và link chia sẻ");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Không thể tạo link chia sẻ cho album này");
    } finally {
      setCreating(false);
    }
  }

  function handleCreateAlbum() {
    buildAndShowAlbum(singleMode);
  }

  /** Reopen an already-created album from Lịch sử Album — a client not
   * having viewed it yet is not a reason to build it again. */
  function openHistoryEntry(entry: PhotobookRecord) {
    setBook(toAlbumBook(entry));
    setPagePx({ w: entry.pageWidthPx, h: entry.pageHeightPx });
    setActiveName(entry.title === "Album không tên" ? "" : entry.title);
    setActiveEntryId(entry.id);
    setActiveShareId(entry.shareId);
    setViewerOpen(true);
  }

  async function confirmDeleteEntry() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    setHistory((h) => h.filter((e) => e.id !== id));
    if (activeEntryId === id) setViewerOpen(false);
    try {
      await deletePhotobook(id);
    } catch {
      toast("Không thể xoá album, thử lại nhé");
      fetchHistory().then(setHistory);
    }
  }

  /** Section 10 — "Chuyển kiểu trang sẽ thay đổi cách hiển thị album."
   * Only warn if the album has already been built; toggling before that
   * is free since nothing has been generated yet. */
  function requestModeToggle() {
    if (book) {
      setPendingModeChange(true);
    } else {
      setSingleMode((v) => !v);
    }
  }

  function confirmModeChange() {
    const next = !singleMode;
    setSingleMode(next);
    setPendingModeChange(false);
    buildAndShowAlbum(next);
  }

  const canCreate = photos.length > 0 && !!dims && !analyzing && !creating;
  const visibleThumbs = photos.slice(0, THUMB_PREVIEW_LIMIT);
  const overflowCount = photos.length - visibleThumbs.length;

  return (
    <AdminShell>
    <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-md" style={{ width: 40, height: 40, background: "var(--accent)", color: "var(--accent-foreground)" }}>
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="font-heading text-xl" style={{ margin: 0 }}>
            Photobook
          </h1>
          <p className="text-sm" style={{ margin: 0 }}>
            Tạo album flipbook tự động cho khách xem trước khi in
          </p>
        </div>
      </div>

      {/* align-items: start (not stretch) — Panel 2 must size itself
          purely from its own content, never from Panel 1/3's. Grid
          stretch would feed their intrinsic (pre-JS-cap) height back
          into the row's height calc, inflating Panel 2 too. Panel 1/3
          get their height forced explicitly via panelHeight instead. */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.05fr 1.25fr 1fr", alignItems: "start" }}>
        <div className={cn("card", styles.panelCard)} style={panelHeight ? { height: panelHeight } : undefined}>
          <div className={cn("card-body", "lg", styles.panelBody)}>
            <div className={styles.modeRow}>
              <h3 style={{ margin: 0, fontSize: 14 }}>1. Tải ảnh lên</h3>
              <label className={styles.singleToggle}>
                <input type="checkbox" checked={singleMode} onChange={requestModeToggle} />
                Trang đơn
              </label>
            </div>
            <p className={styles.modeHint}>
              Tích &quot;Trang đơn&quot; nếu mỗi file ảnh là một trang riêng. Bỏ chọn nếu ảnh đã được dàn sẵn thành hai
              trang.
            </p>
            <div
              className={cn(styles.dropzone, dragOver && styles.dragOver)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <UploadCloud size={28} className={styles.dropzoneIcon} />
              <span>Kéo &amp; thả ảnh vào đây hoặc</span>
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
                {analyzing ? "Đang đọc ảnh..." : "+ Tải ảnh lên"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {photos.length > 0 && (
              <div className={styles.uploadedSection}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Đã chọn {photos.length} ảnh</span>
                    <span className={styles.modeBadge}>{singleMode ? "Trang đơn" : "Trang đôi"}</span>
                  </div>
                  <button type="button" className="text-sm" style={{ color: "var(--destructive)", cursor: "pointer" }} onClick={clearAll}>
                    Xoá tất cả
                  </button>
                </div>
                <div className={styles.thumbStrip}>
                  {visibleThumbs.map((p) => (
                    <div key={p.id} style={{ position: "relative", flexShrink: 0 }}>
                      <img src={p.url} alt="" />
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        aria-label="Xoá ảnh"
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--destructive)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {overflowCount > 0 && <div className={styles.thumbMore}>+{overflowCount}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cn("card", styles.panelCard)} ref={panel2Ref}>
          <div className={cn("card-body", "lg", styles.panelBody)}>
            <h3 style={{ margin: 0, fontSize: 14 }}>2. Chọn kiểu Album</h3>
            <div className={styles.orientationRow}>
              {ORIENTATIONS.map((o) => (
                <label key={o.id} className={cn(styles.orientationOption, orientation === o.id && styles.selected)}>
                  <input
                    type="checkbox"
                    checked={orientation === o.id}
                    onChange={() => selectOrientation(o.id)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  {o.label}
                </label>
              ))}
            </div>

            <div className="field" style={{ marginTop: 4 }}>
              <label>Tên Photobook</label>
              <input
                className="input"
                value={photobookName}
                onChange={(e) => setPhotobookName(e.target.value)}
                placeholder="Nhập tên (không bắt buộc)"
              />
            </div>

            <div className={styles.coverSection}>
              <span className={styles.coverSectionLabel}>Bìa Photobook</span>

              <label className={cn(styles.coverTypeOption, coverType === "photo" && styles.selected)}>
                <input
                  type="radio"
                  name="coverType"
                  checked={coverType === "photo"}
                  onChange={() => setCoverType("photo")}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>Bìa hình</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCoverType("photo");
                    setCoverPickerOpen(true);
                  }}
                >
                  <ImageIcon size={13} />
                  Chọn bìa
                </Button>
              </label>
              {coverType === "photo" && coverPhotoId && (
                <img
                  className={styles.coverThumb}
                  src={photos.find((p) => p.id === coverPhotoId)?.url}
                  alt=""
                />
              )}

              <label className={cn(styles.coverTypeOption, coverType === "material" && styles.selected)}>
                <input
                  type="radio"
                  name="coverType"
                  checked={coverType === "material"}
                  onChange={() => setCoverType("material")}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>Bìa da</span>
                <select
                  className="input"
                  style={{ width: "auto" }}
                  value={coverMaterialId}
                  onChange={(e) => {
                    setCoverType("material");
                    setCoverMaterialId(e.target.value);
                  }}
                >
                  {COVER_MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              {coverType === "material" && (
                <div
                  className={styles.materialPreview}
                  style={{ background: COVER_MATERIALS.find((m) => m.id === coverMaterialId)?.swatchCss }}
                >
                  {photobookName.trim() && <span>{photobookName}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cn("card", styles.panelCard)} style={panelHeight ? { height: panelHeight } : undefined}>
          <div className={cn("card-body", "lg", styles.panelBody)}>
            <h3 style={{ margin: 0, fontSize: 14 }}>3. Tạo Album</h3>
            <Button
              onClick={handleCreateAlbum}
              disabled={!canCreate}
              className={cn(styles.createBtn, "flex-col gap-2")}
              style={{ height: "auto", padding: "18px 20px" }}
            >
              <BookOpen size={32} strokeWidth={2.75} />
              {creating ? "Đang tạo..." : "Tạo Album"}
            </Button>
            <p className={styles.modeHint} style={{ margin: 0 }}>
              Album tự động xóa sau 1 tháng.
            </p>

            <div className={styles.historySection}>
              <span className={styles.coverSectionLabel}>Lịch sử Album</span>
              {history.length === 0 ? (
                <p className={styles.modeHint} style={{ margin: 0 }}>
                  Chưa có album nào.
                </p>
              ) : (
                <div className={styles.historyList}>
                  {history.map((entry) => (
                    <div key={entry.id} className={styles.historyItem}>
                      <button
                        type="button"
                        className={styles.historyItemMain}
                        onClick={() => openHistoryEntry(entry)}
                      >
                        {entry.cover?.kind === "photo" ? (
                          <img className={styles.historyThumb} src={entry.cover.photo.url} alt="" />
                        ) : (
                          <div
                            className={styles.historyThumb}
                            style={{ background: entry.cover?.kind === "material" ? entry.cover.material.swatchCss : undefined }}
                          />
                        )}
                        <span className={styles.historyMeta}>
                          <span className={styles.historyName}>{entry.title}</span>
                          <span className={styles.historySub}>
                            {formatCreatedAt(entry.createdAt)} · {formatExpiry(entry.expiresAt)}
                          </span>
                          <span className={styles.historySub}>
                            <Eye size={11} /> {entry.views} lượt xem
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className={styles.historyDeleteBtn}
                        aria-label="Xoá album"
                        onClick={() => setPendingDeleteId(entry.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {viewerOpen && book && (
        <AlbumBookViewer
          book={book}
          albumName={activeName.trim() || "Album Demo"}
          coverTitle={activeName.trim() || undefined}
          shareId={activeShareId}
          pageWidthPx={pagePx.w}
          pageHeightPx={pagePx.h}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <Dialog open={!!pendingDeleteId} onOpenChange={(o) => !o && setPendingDeleteId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Xoá album</DialogTitle>
          </DialogHeader>
          <p className="text-secondary text-sm">Bạn có chắc muốn xóa album này?</p>
          <div className="modal-foot">
            <Button variant="secondary" onClick={() => setPendingDeleteId(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEntry}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={coverPickerOpen} onOpenChange={setCoverPickerOpen}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle>Chọn ảnh bìa</DialogTitle>
          </DialogHeader>
          {photos.length === 0 ? (
            <p className="text-secondary text-sm">Chưa có ảnh nào — tải ảnh lên trước đã nhé.</p>
          ) : (
            <div className={styles.coverPickerGrid}>
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={cn(styles.coverPickerItem, coverPhotoId === p.id && styles.selected)}
                  onClick={() => {
                    setCoverPhotoId(p.id);
                    setCoverPickerOpen(false);
                  }}
                >
                  <img src={p.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={pendingModeChange} onOpenChange={(o) => !o && setPendingModeChange(false)}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader>
            <DialogTitle>Đổi kiểu trang</DialogTitle>
          </DialogHeader>
          <p className="text-secondary text-sm">
            Chuyển kiểu trang sẽ thay đổi cách hiển thị album. Bạn có chắc muốn tiếp tục?
          </p>
          <div className="modal-foot">
            <Button variant="secondary" onClick={() => setPendingModeChange(false)}>
              Huỷ
            </Button>
            <Button onClick={confirmModeChange}>Tiếp tục</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminShell>
  );
}
