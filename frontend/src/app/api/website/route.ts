import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { DEFAULT_WEBSITE_TEMPLATE, isWebsiteTemplateId } from "@/lib/website-templates";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

/** Studio-authenticated view of their own Website Studio editor state —
 * current cover/featured photo selections (resolved to URLs), every Album
 * with its "hiện trên web con" toggle, and the site's own slug/link so the
 * Settings page can build the "Xem web con" URL without a second call. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const [website, albums, coverPhoto] = await Promise.all([
    prisma.studioWebsite.findUnique({
      where: { studioId: studio.id },
      select: { templateId: true, status: true, settings: true },
    }),
    prisma.album.findMany({
      where: { studioId: studio.id },
      select: { id: true, name: true, photoCount: true, showOnWebsite: true, coverPhotoId: true },
      orderBy: { createdAt: "desc" },
    }),
    studio.coverPhotoId
      ? prisma.photo.findFirst({
          where: { id: studio.coverPhotoId, album: { studioId: studio.id } },
          select: { id: true, previewUrl: true, originalUrl: true },
        })
      : null,
  ]);

  const albumCoverIds = albums.map((a) => a.coverPhotoId).filter((id): id is string => !!id);
  const albumCovers = albumCoverIds.length
    ? await prisma.photo.findMany({
        where: { id: { in: albumCoverIds } },
        select: { id: true, previewUrl: true, originalUrl: true },
      })
    : [];
  const albumCoverById = new Map(albumCovers.map((p) => [p.id, p.previewUrl ?? p.originalUrl ?? null]));

  const featuredPhotoIds = Array.isArray(
    (website?.settings as Record<string, unknown> | null)?.featuredPhotoIds
  )
    ? ((website!.settings as { featuredPhotoIds: string[] }).featuredPhotoIds ?? [])
    : [];
  const featuredPhotos = featuredPhotoIds.length
    ? await prisma.photo.findMany({
        where: { id: { in: featuredPhotoIds }, album: { studioId: studio.id } },
        select: { id: true, previewUrl: true, originalUrl: true },
      })
    : [];

  return NextResponse.json({
    slug: studio.slug,
    templateId: website?.templateId ?? DEFAULT_WEBSITE_TEMPLATE,
    status: website?.status ?? "draft",
    tagline: studio.tagline,
    coverPhotoId: studio.coverPhotoId,
    coverUrl: coverPhoto ? (coverPhoto.previewUrl ?? coverPhoto.originalUrl ?? null) : null,
    featuredPhotos: featuredPhotos.map((p) => ({
      id: p.id,
      url: p.previewUrl ?? p.originalUrl ?? null,
    })),
    albums: albums.map((a) => ({
      id: a.id,
      name: a.name,
      photoCount: a.photoCount,
      showOnWebsite: a.showOnWebsite,
      coverUrl: a.coverPhotoId ? (albumCoverById.get(a.coverPhotoId) ?? null) : null,
    })),
  });
}

const bodySchema = z.object({
  templateId: z.string().refine(isWebsiteTemplateId).optional(),
  coverPhotoId: z.string().uuid().nullable().optional(),
  featuredPhotoIds: z.array(z.string().uuid()).max(24).optional(),
  demoAlbumIds: z.array(z.string().uuid()).optional(),
  tagline: z.string().trim().max(200).nullable().optional(),
});

/** Upserts the Studio's Website row (creating a draft one on first save)
 * and, in the same request, the two settings that live on other tables:
 * Studio.coverPhotoId and each Album's showOnWebsite flag. Every photo/
 * album id is verified to actually belong to this studio before being
 * saved — never trusts a client-supplied id at face value (same IDOR
 * guard used everywhere else photo/album ids are accepted). */
export async function PATCH(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Dữ liệu không hợp lệ", 400);
  const { templateId, coverPhotoId, featuredPhotoIds, demoAlbumIds, tagline } = parsed.data;

  if (coverPhotoId) {
    const owned = await prisma.photo.findFirst({
      where: { id: coverPhotoId, album: { studioId: studio.id } },
      select: { id: true },
    });
    if (!owned) return jsonError("Ảnh bìa không hợp lệ", 400);
  }

  if (featuredPhotoIds?.length) {
    const ownedCount = await prisma.photo.count({
      where: { id: { in: featuredPhotoIds }, album: { studioId: studio.id } },
    });
    if (ownedCount !== featuredPhotoIds.length) {
      return jsonError("Một số ảnh nổi bật không hợp lệ", 400);
    }
  }

  if (demoAlbumIds?.length) {
    const ownedCount = await prisma.album.count({
      where: { id: { in: demoAlbumIds }, studioId: studio.id },
    });
    if (ownedCount !== demoAlbumIds.length) {
      return jsonError("Một số album không hợp lệ", 400);
    }
  }

  await prisma.$transaction(async (tx) => {
    if (coverPhotoId !== undefined || tagline !== undefined) {
      await tx.studio.update({
        where: { id: studio.id },
        data: {
          ...(coverPhotoId !== undefined ? { coverPhotoId } : {}),
          ...(tagline !== undefined ? { tagline } : {}),
        },
      });
    }
    if (demoAlbumIds !== undefined) {
      const demoSet = new Set(demoAlbumIds);
      const allAlbums = await tx.album.findMany({
        where: { studioId: studio.id },
        select: { id: true, showOnWebsite: true },
      });
      for (const a of allAlbums) {
        const shouldShow = demoSet.has(a.id);
        if (shouldShow !== a.showOnWebsite) {
          await tx.album.update({ where: { id: a.id }, data: { showOnWebsite: shouldShow } });
        }
      }
    }
    // Always upserts (never just skips) so a draft row exists the first
    // time a Studio touches any part of this editor — the "Xem web con"
    // link works immediately, not only after every field has been set.
    await tx.studioWebsite.upsert({
      where: { studioId: studio.id },
      create: {
        studioId: studio.id,
        templateId: templateId ?? DEFAULT_WEBSITE_TEMPLATE,
        status: "draft",
        settings: featuredPhotoIds !== undefined ? { featuredPhotoIds } : undefined,
      },
      update: {
        ...(templateId !== undefined ? { templateId } : {}),
        ...(featuredPhotoIds !== undefined ? { settings: { featuredPhotoIds } } : {}),
      },
    });
  });

  return NextResponse.json({ ok: true });
}
