import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";
import {
  contentTypeForFormat,
  pickImageFormat,
  resolveImageProxyWidth,
  transcodeImage,
} from "@/lib/image-resize";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

/** In-memory cache of already-transcoded variants, keyed by
 * `photoId:width:format:v`. Lives only for the lifetime of this warm server
 * instance/dev process (cleared on cold start/restart, not shared across
 * instances) — still meaningfully cuts repeat CPU cost for the common case
 * (a guest scrolling the same gallery re-requesting the same tiles), without
 * standing up a persistent cache store. Bounded by a max entry count with
 * oldest-first eviction (Map preserves insertion order) so it can't grow
 * unbounded across a long-lived instance serving many albums. Including `v`
 * (the photo's updatedAt) in the key means a re-synced/overwritten photo's
 * new bytes are never masked by an old cache entry — the URL itself changed,
 * so it's simply a fresh key. */
const transcodeCache = new Map<string, Buffer>();
const TRANSCODE_CACHE_MAX_ENTRIES = 200;

function cacheKey(photoId: string, width: number | null, format: string, version: string | null) {
  return `${photoId}:${width ?? "orig"}:${format}:${version ?? ""}`;
}

function cacheSet(key: string, buffer: Buffer) {
  if (transcodeCache.size >= TRANSCODE_CACHE_MAX_ENTRIES) {
    const oldestKey = transcodeCache.keys().next().value;
    if (oldestKey !== undefined) transcodeCache.delete(oldestKey);
  }
  transcodeCache.set(key, buffer);
}

/** Guest-facing image proxy — Grid/Masonry/Carousel/Lightbox all load every
 * photo through this route instead of ever receiving the real storage URL
 * (Vercel Blob or Google Drive) directly. That keeps viewing subject to the
 * same Album Security the /photos list endpoint already checks (closed,
 * expired, password + identified) even after the client has the URL — a
 * bookmarked/copied image link stops working the moment the album closes,
 * expires, or gets a new password, instead of a permanently-public storage
 * URL that would keep serving the photo forever regardless.
 *
 * Optional `?w=` resizes on demand, snapped to a small fixed tier
 * (IMAGE_PROXY_WIDTH_TIERS). The browser's own `Accept` header decides the
 * output format — AVIF, then WebP, then a plain JPEG fallback for anything
 * that declares neither. `?v=` (the photo's updatedAt, appended by the
 * /photos list route) makes each URL immutable: the same v+w+format always
 * decodes to the same bytes, so it's safe to cache aggressively — a
 * re-synced photo simply gets a new v and therefore a new URL, never a
 * stale cache hit.
 *
 * When nothing needs transcoding (no `?w=`, and the browser's Accept header
 * doesn't ask for a different format than the plain JPEG already stored),
 * this streams the source through untouched — the same zero-CPU passthrough
 * Phase 1 shipped.
 *
 * Always serves the pre-resized web preview, never the untouched original —
 * Download is a separate, already-gated flow (see the sibling
 * download/route.ts) and must stay that way. */
export async function GET(
  req: NextRequest,
  { params }: { params: { linkToken: string; photoId: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
    select: { id: true, status: true, expiryDate: true, passwordHash: true },
  });
  if (!album) {
    return jsonError("Không tìm thấy album", 404);
  }
  if (album.status === "closed") {
    return jsonError("Album này đã đóng, không thể xem.", 403);
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return jsonError("Album đã hết hạn, không thể xem.", 403);
  }

  const guest = await getGuestCustomer(params.linkToken);
  if (album.passwordHash && !guest) {
    return jsonError("Album này yêu cầu xác nhận trước khi xem.", 401);
  }

  const photo = await prisma.photo.findFirst({
    where: { id: params.photoId, albumId: album.id },
    select: { previewUrl: true, thumbnailUrl: true, originalUrl: true, mimeType: true },
  });
  if (!photo) {
    return jsonError("Không tìm thấy ảnh trong album này", 404);
  }

  const sourceUrl = photo.previewUrl ?? photo.thumbnailUrl ?? photo.originalUrl;
  if (!sourceUrl) {
    return jsonError("Ảnh không khả dụng", 404);
  }

  const targetWidth = resolveImageProxyWidth(req.nextUrl.searchParams.get("w"));
  const format = pickImageFormat(req.headers.get("accept"));
  const version = req.nextUrl.searchParams.get("v");
  // A versioned URL (the normal case — /photos always appends `v`) never
  // needs revalidation: the same URL can only ever mean the same bytes, so
  // the browser is free to cache it for a full year. An unversioned request
  // (hitting the route directly with no `v`) keeps the conservative 1-day
  // default from Phase 1/2.
  const cacheControl = version
    ? "private, max-age=31536000, immutable"
    : "private, max-age=86400";
  // Output genuinely depends on Accept now (format negotiation) — caches
  // must know that instead of conflating an AVIF response with a JPEG one.
  const varyHeader = "Accept";

  // The source files this proxy reads from (Vercel Blob previews, Drive
  // thumbnails) are already plain JPEG — if nothing is being resized *and*
  // the browser didn't ask for a different format, there is nothing to
  // transcode, so skip straight to the zero-CPU streaming passthrough.
  const needsProcessing = !!targetWidth || format !== "jpeg";

  if (!needsProcessing) {
    let upstream: Response;
    try {
      upstream = await fetch(sourceUrl);
    } catch (e) {
      console.error("image proxy fetch failed", params.photoId, e);
      return jsonError("Không thể tải ảnh lúc này, thử lại sau nhé.", 502);
    }
    if (!upstream.ok || !upstream.body) {
      return jsonError("Không thể tải ảnh lúc này, thử lại sau nhé.", 502);
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? photo.mimeType ?? "image/jpeg",
        "Cache-Control": cacheControl,
        Vary: varyHeader,
      },
    });
  }

  const key = cacheKey(params.photoId, targetWidth, format, version);
  const cached = transcodeCache.get(key);
  if (cached) {
    return new NextResponse(new Uint8Array(cached), {
      status: 200,
      headers: {
        "Content-Type": contentTypeForFormat(format),
        "Cache-Control": cacheControl,
        Vary: varyHeader,
      },
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(sourceUrl);
  } catch (e) {
    console.error("image proxy fetch failed", params.photoId, e);
    return jsonError("Không thể tải ảnh lúc này, thử lại sau nhé.", 502);
  }
  if (!upstream.ok || !upstream.body) {
    return jsonError("Không thể tải ảnh lúc này, thử lại sau nhé.", 502);
  }

  const sourceBytes = Buffer.from(await upstream.arrayBuffer());
  let output: Buffer;
  let outputFormat = format;
  try {
    output = await transcodeImage(sourceBytes, { width: targetWidth ?? undefined, format });
  } catch (e) {
    // Still show *something* rather than fail the whole request over a
    // transcode hiccup — falls back to the unresized/untranscoded source,
    // whose real format is whatever the upstream actually served (JPEG in
    // every case this proxy deals with today).
    console.error("image proxy transcode failed", params.photoId, targetWidth, format, e);
    output = sourceBytes;
    outputFormat = "jpeg";
  }
  cacheSet(key, output);

  return new NextResponse(new Uint8Array(output), {
    status: 200,
    headers: {
      "Content-Type": contentTypeForFormat(outputFormat),
      "Cache-Control": cacheControl,
      Vary: varyHeader,
    },
  });
}
