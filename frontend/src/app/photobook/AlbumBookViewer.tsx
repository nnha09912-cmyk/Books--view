"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import type { PageFlipInstance } from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Images,
  Share2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AlbumBook, FlipPage } from "./layoutEngine";
import styles from "./album-book.module.css";

interface Leaf {
  key: string;
  node: React.ReactNode;
  thumbUrl: string;
}

/** Turns each FlipPage into the physical flipbook leaf(ves) it occupies.
 * "single" is one file = one leaf, shown whole (object-fit: contain, no
 * crop, no stretch). "spread" is one file = two consecutive leaves that
 * share the SAME untouched image — CSS positions each leaf to show its
 * half, the same technique every digital flipbook viewer uses for a
 * pre-designed spread scan. The file itself is never split, cropped, or
 * re-encoded; only where the browser positions it on-screen differs. */
function buildLeaves(pages: FlipPage[]): Leaf[] {
  const leaves: Leaf[] = [];
  for (const p of pages) {
    if (p.pageType === "single") {
      leaves.push({
        key: p.id,
        thumbUrl: p.image.url,
        node: (
          <div className={styles.mat}>
            <img className={styles.phContain} src={p.image.url} alt="" />
          </div>
        ),
      });
    } else {
      leaves.push({
        key: `${p.id}-L`,
        thumbUrl: p.image.url,
        node: (
          <div
            className={cn(styles.spreadHalf, styles.spreadLeft)}
            style={{ backgroundImage: `url(${p.image.url})` }}
          />
        ),
      });
      leaves.push({
        key: `${p.id}-R`,
        thumbUrl: p.image.url,
        node: (
          <div
            className={cn(styles.spreadHalf, styles.spreadRight)}
            style={{ backgroundImage: `url(${p.image.url})` }}
          />
        ),
      });
    }
  }
  return leaves;
}

interface AlbumBookViewerProps {
  book: AlbumBook;
  albumName: string;
  /** Text shown on the cover itself — separate from albumName (the
   * toolbar label) since a material cover with no title should render
   * "trơn" (blank), not fall back to a placeholder string. */
  coverTitle?: string;
  /** albumId for this book, if it's been saved — the share link is the
   * standalone /photobook/album/{albumId} route (its own page, loads
   * the record directly, not this component's props) rather than
   * "whatever was created most recently". */
  shareId?: string;
  pageWidthPx: number;
  pageHeightPx: number;
  onClose: () => void;
}

export function AlbumBookViewer({ book, albumName, coverTitle, shareId, pageWidthPx, pageHeightPx, onClose }: AlbumBookViewerProps) {
  const flipRef = useRef<{ pageFlip: () => PageFlipInstance }>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const path = shareId ? `/photobook/album/${shareId}` : "/photobook";
    setShareUrl(`${window.location.origin}${path}`);
  }, [shareId]);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast("Đã copy link chia sẻ");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Không thể copy tự động, hãy copy thủ công");
    }
  }

  const leaves = useMemo(() => buildLeaves(book.pages), [book.pages]);
  const totalFlipPages = 2 + leaves.length; // cover + body leaves + back cover

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      const flip = flipRef.current?.pageFlip();
      if (!flip) return;
      if (flip.getCurrentPageIndex() >= totalFlipPages - 1) {
        flip.flip(0);
      } else {
        flip.flipNext();
      }
    }, 3200);
    return () => clearInterval(timer);
  }, [autoPlay, totalFlipPages]);

  useEffect(() => {
    function onFsChange() {
      setFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleFullscreen() {
    if (!stageRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      stageRef.current.requestFullscreen().catch(() => toast("Trình duyệt không hỗ trợ fullscreen"));
    }
  }

  function goToFlipIndex(index: number) {
    flipRef.current?.pageFlip().flip(index);
  }

  const pageLabel =
    currentPage === 0
      ? "Bìa"
      : currentPage === totalFlipPages - 1
        ? "Bìa sau"
        : `${currentPage} – ${Math.min(currentPage + 1, totalFlipPages - 2)} / ${leaves.length}`;

  return (
    <div className={styles.viewer} ref={stageRef}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <span className={styles.eyebrow}>Xem Album</span>
          <strong>{albumName}</strong>
        </div>
        <div className={styles.toolbarActions}>
          <Button variant="ghost" size="sm" onClick={() => setShowThumbnails((v) => !v)}>
            <Images size={15} />
            Thumbnail
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            Fullscreen
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAutoPlay((v) => !v)}>
            {autoPlay ? <Pause size={15} /> : <Play size={15} />}
            Auto Play
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 size={15} />
            Chia sẻ
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={15} />
            Đóng
          </Button>
        </div>
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={cn(styles.arrow)}
          onClick={() => goToFlipIndex(Math.max(0, currentPage - 2))}
          aria-label="Trang trước"
        >
          <ChevronLeft size={22} />
        </button>

        <HTMLFlipBook
          key={`${pageWidthPx}x${pageHeightPx}-${leaves.length}`}
          ref={flipRef as never}
          width={pageWidthPx}
          height={pageHeightPx}
          size="fixed"
          minWidth={200}
          maxWidth={900}
          minHeight={260}
          maxHeight={1100}
          drawShadow
          flippingTime={700}
          showCover
          usePortrait={false}
          mobileScrollSupport={false}
          maxShadowOpacity={0.4}
          className={styles.flipbook}
          onFlip={(e) => setCurrentPage(e.data)}
        >
          <div className={styles.page}>
            <div
              className={styles.cover}
              style={book.cover?.kind === "material" ? { background: book.cover.material.swatchCss } : undefined}
            >
              {book.cover?.kind === "photo" && (
                <>
                  <img className={cn(styles.ph, styles.phBleed)} src={book.cover.photo.url} alt="" />
                  <div className={styles.coverScrim} />
                </>
              )}
              {coverTitle && (
                <div className={styles.coverText}>
                  <span>{coverTitle}</span>
                </div>
              )}
            </div>
          </div>

          {leaves.map((leaf) => (
            <div className={styles.page} key={leaf.key}>
              {leaf.node}
            </div>
          ))}

          <div className={styles.page}>
            <div className={cn(styles.cover, styles.backcover)}>
              <div className={styles.coverText}>
                <span>Cảm ơn</span>
              </div>
            </div>
          </div>
        </HTMLFlipBook>

        <button
          type="button"
          className={cn(styles.arrow)}
          onClick={() => goToFlipIndex(Math.min(totalFlipPages - 1, currentPage + 2))}
          aria-label="Trang sau"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className={styles.pagenum}>{pageLabel}</div>

      {showThumbnails && (
        <div className={styles.thumbs}>
          <button type="button" className={cn(styles.thumb, currentPage === 0 && styles.active)} onClick={() => goToFlipIndex(0)}>
            {book.cover?.kind === "photo" ? (
              <img src={book.cover.photo.url} alt="" />
            ) : book.cover?.kind === "material" ? (
              <div style={{ width: "100%", height: 46, borderRadius: 3, background: book.cover.material.swatchCss }} />
            ) : null}
            <span>Bìa</span>
          </button>
          {Array.from({ length: Math.ceil(leaves.length / 2) }, (_, i) => {
            const flipIndex = 1 + i * 2;
            const thumbUrl = leaves[i * 2]?.thumbUrl;
            const active = currentPage === flipIndex || currentPage === flipIndex + 1;
            return (
              <button
                key={`thumb-${flipIndex}`}
                type="button"
                className={cn(styles.thumb, active && styles.active)}
                onClick={() => goToFlipIndex(flipIndex)}
              >
                {thumbUrl && <img src={thumbUrl} alt="" />}
                <span>
                  {String(flipIndex).padStart(2, "0")}–{String(flipIndex + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className={cn(styles.thumb, currentPage === totalFlipPages - 1 && styles.active)}
            onClick={() => goToFlipIndex(totalFlipPages - 1)}
          >
            <span>Bìa sau</span>
          </button>
        </div>
      )}

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent style={{ maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle>Chia sẻ album</DialogTitle>
          </DialogHeader>
          <p className="text-secondary text-sm">
            Gửi link này cho khách để xem album — khách chỉ thấy phần Xem Album, không thấy khu tải ảnh hay tạo album.
          </p>
          <div className={styles.shareRow}>
            <input className="input" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
            <Button size="sm" onClick={copyShareLink}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Đã copy" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
