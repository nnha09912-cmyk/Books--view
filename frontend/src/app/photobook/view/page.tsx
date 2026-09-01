"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { AlbumBookViewer } from "../AlbumBookViewer";
import { getHistoryEntry, bumpViews, type AlbumHistoryEntry } from "../albumHistory";

/** Dedicated client-facing route for the "Chia sẻ" link on /photobook —
 * shows ONLY the Xem Album viewer, never the upload/kiểu-album editor.
 * Reads one specific album (?id=...) from Lịch sử Album in localStorage
 * — localStorage (not sessionStorage) so this works when the link is
 * opened in a *different* tab/window of the same browser, not just the
 * one that created it. A real client opening this on another
 * device/browser still needs the photos hosted somewhere — this demo
 * has no backend yet. */
export default function PhotobookViewPage() {
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const [entry, setEntry] = useState<AlbumHistoryEntry | null>(null);
  const [closed, setClosed] = useState(false);
  // Guards against React StrictMode's dev-only double-invoke firing two
  // views for one real page load.
  const bumpedRef = useRef(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setStatus("not-found");
      return;
    }
    const found = getHistoryEntry(id);
    if (!found) {
      setStatus("not-found");
      return;
    }
    // An entry with 0 views is still a real, existing album — bump
    // happens after confirming it exists, never used to decide whether
    // it exists in the first place.
    if (!bumpedRef.current) {
      bumpedRef.current = true;
      bumpViews(id);
    }
    setEntry(found);
    setStatus("found");
  }, []);

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

      {status === "found" && entry && !closed ? (
        <AlbumBookViewer
          book={entry.book}
          albumName={entry.name === "Album không tên" ? "Album Demo" : entry.name}
          coverTitle={entry.name === "Album không tên" ? undefined : entry.name}
          shareId={entry.id}
          pageWidthPx={entry.pagePx.w}
          pageHeightPx={entry.pagePx.h}
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
