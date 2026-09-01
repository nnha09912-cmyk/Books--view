"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { AlbumBookViewer } from "../../AlbumBookViewer";
import { getHistoryEntry, bumpViews, toAlbumBook, type AlbumRecord } from "../../albumHistory";

/** Standalone customer album viewer — /photobook/album/{albumId}. Nested
 * here (not the top-level /album/{id}) because /album/[linkId] already
 * exists as the real customer-facing Album route elsewhere in the app —
 * Next.js can't have two different dynamic-segment names at the same
 * path level, so this had to move to avoid colliding with it. It's
 * still fully independent of /photobook (the editor): it loads the
 * album record by albumId from the repository (albumHistory.ts) on
 * mount, never from /photobook's React state, so the link keeps working
 * in a new tab, pasted fresh into the address bar, on refresh, or after
 * /photobook itself is closed. A real client opening this on another
 * device/browser still needs the photos hosted somewhere — this demo
 * has no backend yet, so the repository is localStorage-backed; see
 * albumHistory.ts for how that's meant to be swapped for a real API
 * later without touching this page or AlbumBookViewer. */
export default function AlbumViewerPage({ params }: { params: { albumId: string } }) {
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const [record, setRecord] = useState<AlbumRecord | null>(null);
  const [closed, setClosed] = useState(false);
  // Guards against React StrictMode's dev-only double-invoke firing two
  // views for one real page load.
  const bumpedRef = useRef(false);

  useEffect(() => {
    const found = getHistoryEntry(params.albumId);
    if (!found) {
      setStatus("not-found");
      return;
    }
    // An entry with 0 views is still a real, existing album — bump
    // happens after confirming it exists, never used to decide whether
    // it exists in the first place.
    if (!bumpedRef.current) {
      bumpedRef.current = true;
      bumpViews(params.albumId);
    }
    setRecord(found);
    setStatus("found");
  }, [params.albumId]);

  return (
    <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-md"
          style={{ width: 40, height: 40, background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="font-heading text-xl" style={{ margin: 0 }}>
            Photobook
          </h1>
          <p className="text-sm" style={{ margin: 0 }}>
            Xem trước album
          </p>
        </div>
      </div>

      {status === "found" && record && !closed ? (
        <AlbumBookViewer
          book={toAlbumBook(record)}
          albumName={record.title === "Album không tên" ? "Album Demo" : record.title}
          coverTitle={record.title === "Album không tên" ? undefined : record.title}
          shareId={record.albumId}
          pageWidthPx={record.pagePx.w}
          pageHeightPx={record.pagePx.h}
          onClose={() => setClosed(true)}
        />
      ) : (
        <div className="card">
          <div className="card-body lg">
            <p className="text-secondary text-sm">
              {status === "loading"
                ? "Đang tải..."
                : "Không tìm thấy album này — có thể link đã hết hạn hoặc album đã bị xoá."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
