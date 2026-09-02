"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { AlbumBookViewer } from "../../AlbumBookViewer";
import { toAlbumBook, type PhotobookRecord } from "../../photobookApi";

/** Standalone customer album viewer — /photobook/album/{albumId} (the
 * route segment is named albumId, but it's actually the Photobook's
 * shareId — kept as-is to avoid an unnecessary rename). Nested here (not
 * the top-level /album/{id}) because /album/[linkId] already exists as the
 * real customer-facing Album route elsewhere in the app — Next.js can't
 * have two different dynamic-segment names at the same path level, so
 * this had to move to avoid colliding with it.
 *
 * Real, server-backed now (GET /api/public/photobooks/[shareId]) — no
 * auth, no localStorage: any device/browser with the link gets the same
 * record, and that same request bumps `views` server-side, so there's no
 * separate client-side bump call (or StrictMode double-invoke guard) to
 * worry about here. */
export default function AlbumViewerPage({ params }: { params: { albumId: string } }) {
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const [record, setRecord] = useState<PhotobookRecord | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    fetch(`/api/public/photobooks/${params.albumId}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus("not-found");
          return;
        }
        const data = (await res.json()) as PhotobookRecord;
        setRecord(data);
        setStatus("found");
      })
      .catch(() => setStatus("not-found"));
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
          shareId={record.shareId}
          pageWidthPx={record.pageWidthPx}
          pageHeightPx={record.pageHeightPx}
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
