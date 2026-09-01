"use client";

import { useRef, useState } from "react";
import { BookOpen, UploadCloud, X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  type AlbumOrientation,
  type AlbumSizeOption,
  type DemoPhoto,
  sizesForOrientation,
  computePageSpread,
  buildAlbumBook,
  type AlbumBook,
} from "./layoutEngine";
import { AlbumBookViewer } from "./AlbumBookViewer";
import styles from "./album-book.module.css";

const ORIENTATIONS: { id: AlbumOrientation; label: string }[] = [
  { id: "portrait", label: "Album đứng" },
  { id: "square", label: "Album vuông" },
  { id: "landscape", label: "Album ngang" },
];

const MAX_PAGE_PX = { w: 420, h: 560 };
const THUMB_PREVIEW_LIMIT = 6;

function loadImageDims(file: File): Promise<DemoPhoto> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ id: crypto.randomUUID(), url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Không đọc được ảnh"));
    img.src = url;
  });
}

/** ALBUM BOOK — standalone demo of docs "XemAlbum.md". Client-only: photos
 * live as object URLs in component state, nothing is uploaded or written
 * to Prisma/Photo — this proves the auto-layout + page-flip concept without
 * touching Gallery, Photo Proofing, Selection Manager, Filter & Copy, or
 * the 3D Carousel, per the spec's own module-boundary rule. */
export default function AlbumBookDemoPage() {
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

  function selectOrientation(o: AlbumOrientation) {
    setOrientation(o);
    setSelectedSize(null);
  }

  const dims = orientation && selectedSize ? computePageSpread(orientation, selectedSize) : null;

  function buildAndShowAlbum(mode: boolean) {
    if (!dims || photos.length === 0) return;
    const built = buildAlbumBook(photos, mode);
    const aspect = dims.pageWidth / dims.pageHeight;
    let h = MAX_PAGE_PX.h;
    let w = h * aspect;
    if (w > MAX_PAGE_PX.w) {
      w = MAX_PAGE_PX.w;
      h = w / aspect;
    }
    setPagePx({ w: Math.round(w), h: Math.round(h) });
    setBook(built);
    setViewerOpen(true);
  }

  function handleCreateAlbum() {
    buildAndShowAlbum(singleMode);
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

  const canCreate = photos.length > 0 && !!dims && !analyzing;
  const visibleThumbs = photos.slice(0, THUMB_PREVIEW_LIMIT);
  const overflowCount = photos.length - visibleThumbs.length;

  return (
    <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-md" style={{ width: 40, height: 40, background: "var(--accent)", color: "var(--accent-foreground)" }}>
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="font-heading text-xl" style={{ margin: 0 }}>
            Album Book
          </h1>
          <p className="text-sm" style={{ margin: 0 }}>
            Demo độc lập — tạo album tự động, không ảnh hưởng dữ liệu thật
          </p>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.6fr auto", alignItems: "start" }}>
        <div className="card">
          <div className="card-body lg flex flex-col gap-3">
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
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body lg flex flex-col gap-3">
            <h3 style={{ margin: 0, fontSize: 14 }}>2. Chọn kích thước Album</h3>
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

            {orientation && (
              <div className={styles.sizeGrid}>
                {sizesForOrientation(orientation).map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    className={cn(styles.sizeOption, selectedSize?.label === size.label && styles.selected)}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}

            {dims && (
              <div className={styles.dimsPreview}>
                <div className={styles.dimsBlock}>
                  <span className={styles.dimsLabel}>Kích thước 1 trang (Page)</span>
                  <span className={styles.dimsValue}>
                    {dims.pageWidth} × {dims.pageHeight} cm
                  </span>
                </div>
                <ArrowRight size={16} className={styles.dimsArrow} />
                <div className={styles.dimsBlock}>
                  <span className={styles.dimsLabel}>Kích thước 1 spread (2 trang)</span>
                  <span className={styles.dimsValue}>
                    {dims.spreadWidth} × {dims.spreadHeight} cm
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button size="lg" onClick={handleCreateAlbum} disabled={!canCreate} style={{ height: "100%", minHeight: 120 }}>
          <Sparkles size={16} />
          Tạo Album
        </Button>
      </div>

      {viewerOpen && book && (
        <AlbumBookViewer
          book={book}
          albumName="Album Demo"
          pageWidthPx={pagePx.w}
          pageHeightPx={pagePx.h}
          onClose={() => setViewerOpen(false)}
        />
      )}

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
  );
}
