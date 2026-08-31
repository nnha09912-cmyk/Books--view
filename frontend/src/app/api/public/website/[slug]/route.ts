import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_WEBSITE_TEMPLATE, isWebsiteTemplateId } from "@/lib/website-templates";

/** Public, unauthenticated — a Studio Website is meant to be found by
 * anyone with the slug, same as an Album's public landing page. A "draft"
 * site is still viewable here on purpose: this is exactly the link a
 * Studio sends a client "xem trước" (preview) before formally publishing —
 * status is kept for a later real Publish step (e.g. search-engine
 * indexing), not as a visibility gate. A studio with no Website row at all
 * (never touched the editor) still 404s — same as a nonexistent slug, no
 * way to tell the two apart from outside — UNLESS `?previewTemplate=` is
 * present, which is the Settings page's own "Xem trước" button on each
 * template card (works even before the Studio has saved anything, so
 * "muốn chọn nào tuỳ thích" can actually try before deciding). This param
 * only ever changes which template renders THIS response — it never reads
 * or writes anything to the database, so it carries no more risk than any
 * other query string. */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const previewTemplateParam = req.nextUrl.searchParams.get("previewTemplate");
  const previewTemplate =
    previewTemplateParam && isWebsiteTemplateId(previewTemplateParam) ? previewTemplateParam : null;

  const studio = await prisma.studio.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      ownerName: true,
      slug: true,
      logoUrl: true,
      coverPhotoId: true,
      description: true,
      address: true,
      phone: true,
      email: true,
      socialLinks: true,
      studioWebsite: {
        select: {
          templateId: true,
          status: true,
          settings: true,
          sections: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, type: true, enabled: true, orderIndex: true, settings: true },
          },
        },
      },
    },
  });

  if (!studio || (!studio.studioWebsite && !previewTemplate)) {
    return NextResponse.json({ error: { message: "Không tìm thấy website" } }, { status: 404 });
  }

  const albums = await prisma.album.findMany({
    where: { studio: { slug: params.slug }, showOnWebsite: true },
    select: {
      id: true,
      name: true,
      description: true,
      photoCount: true,
      linkToken: true,
      coverPhotoId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const featuredPhotoIds = Array.isArray(
    (studio.studioWebsite?.settings as Record<string, unknown> | null)?.featuredPhotoIds
  )
    ? ((studio.studioWebsite!.settings as { featuredPhotoIds: string[] }).featuredPhotoIds ?? [])
    : [];

  const photoIds = [
    ...albums.map((a) => a.coverPhotoId).filter((id): id is string => !!id),
    ...(studio.coverPhotoId ? [studio.coverPhotoId] : []),
    ...featuredPhotoIds,
  ];
  const photos = photoIds.length
    ? await prisma.photo.findMany({
        where: { id: { in: photoIds } },
        select: { id: true, previewUrl: true, originalUrl: true },
      })
    : [];
  const urlById = new Map(photos.map((p) => [p.id, p.previewUrl ?? p.originalUrl ?? null]));

  return NextResponse.json({
    studio: {
      name: studio.name || studio.ownerName || studio.email,
      slug: studio.slug,
      logoUrl: studio.logoUrl,
      cover: studio.coverPhotoId ? (urlById.get(studio.coverPhotoId) ?? null) : null,
      description: studio.description,
      address: studio.address,
      phone: studio.phone,
      email: studio.email,
      socialLinks: studio.socialLinks,
    },
    templateId: previewTemplate ?? studio.studioWebsite?.templateId ?? DEFAULT_WEBSITE_TEMPLATE,
    sections: studio.studioWebsite?.sections ?? [],
    featuredPhotos: featuredPhotoIds
      .map((id) => urlById.get(id))
      .filter((url): url is string => !!url),
    albums: albums.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      photoCount: a.photoCount,
      linkToken: a.linkToken,
      coverUrl: a.coverPhotoId ? (urlById.get(a.coverPhotoId) ?? null) : null,
    })),
  });
}
