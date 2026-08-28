import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio, hashPassword } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const notFound = () =>
  NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });

async function loadOwnedAlbum(studioId: string, albumId: string) {
  const album = await prisma.album.findFirst({
    where: { id: albumId, studioId },
    include: {
      customers: { include: { selections: { include: { photo: true } } } },
      photos: { orderBy: { orderIndex: "asc" } },
    },
  });
  return album;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) return notFound();
  const album = await loadOwnedAlbum(studio.id, params.id);
  if (!album) return notFound();

  return NextResponse.json({
    id: album.id,
    name: album.name,
    description: album.description,
    template: album.template,
    status: album.status,
    linkToken: album.linkToken,
    photoCount: album.photos.length,
    expiryDate: album.expiryDate,
    eventDate: album.eventDate,
    passwordProtected: !!album.passwordHash,
    createdAt: album.createdAt,
    googleDriveFolderId: album.googleDriveFolderId,
    maxSelectionCount: album.maxSelectionCount,
    downloadEnabled: album.downloadEnabled,
    downloadPasswordProtected: !!album.downloadPasswordHash,
    downloadExpiryDate: album.downloadExpiryDate,
    photos: album.photos.map((p) => ({
      id: p.id,
      filename: p.filename,
      thumbnailUrl: p.thumbnailUrl,
      previewUrl: p.previewUrl,
      likeCount: p.likeCount,
      starCount: p.starCount,
      orderIndex: p.orderIndex,
    })),
    customers: album.customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      lastViewedAt: c.lastViewedAt,
      submittedAt: c.submittedAt,
      likes: c.selections.filter((s) => s.likeType === "like").length,
      stars: c.selections.filter((s) => s.likeType === "star").length,
      selectedFilenames: Array.from(
        new Set(c.selections.map((s) => s.photo.filename))
      ),
    })),
  });
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  template: z.string().optional(),
  status: z.string().optional(),
  expiryDate: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  maxSelectionCount: z.coerce.number().int().positive().nullable().optional(),
  /** Set a new password (enables protection). Pass null to remove protection. */
  password: z.string().min(4).nullable().optional(),
  downloadEnabled: z.boolean().optional(),
  downloadExpiryDate: z.string().nullable().optional(),
  /** Set a new Download password. Pass null to remove it (Download stays
   * gated by downloadEnabled alone). */
  downloadPassword: z.string().min(4).nullable().optional(),
  /** Forces every guest currently identified for this album to re-identify
   * — independent of changing the password. */
  revokeGuestSessions: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) return notFound();
  const existing = await prisma.album.findFirst({
    where: { id: params.id, studioId: studio.id },
  });
  if (!existing) return notFound();
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const {
    expiryDate,
    eventDate,
    password,
    downloadExpiryDate,
    downloadPassword,
    revokeGuestSessions,
    ...rest
  } = parsed.data;
  // Changing the Primary Password fundamentally changes who should still
  // count as authenticated, so it revokes existing guest sessions the same
  // as an explicit "Revoke Sessions" — matches the Studio sessionVersion
  // pattern (password change there also invalidates old session tokens).
  const bumpGuestSessions = password !== undefined || revokeGuestSessions === true;
  const album = await prisma.album.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(expiryDate !== undefined
        ? { expiryDate: expiryDate ? new Date(expiryDate) : null }
        : {}),
      ...(eventDate !== undefined
        ? { eventDate: eventDate ? new Date(eventDate) : null }
        : {}),
      ...(password !== undefined
        ? { passwordHash: password ? await hashPassword(password) : null }
        : {}),
      ...(downloadExpiryDate !== undefined
        ? { downloadExpiryDate: downloadExpiryDate ? new Date(downloadExpiryDate) : null }
        : {}),
      ...(downloadPassword !== undefined
        ? { downloadPasswordHash: downloadPassword ? await hashPassword(downloadPassword) : null }
        : {}),
      ...(bumpGuestSessions ? { guestSessionVersion: { increment: 1 } } : {}),
    },
  });
  return NextResponse.json({
    id: album.id,
    name: album.name,
    status: album.status,
    passwordProtected: !!album.passwordHash,
    downloadEnabled: album.downloadEnabled,
    downloadPasswordProtected: !!album.downloadPasswordHash,
    downloadExpiryDate: album.downloadExpiryDate,
    guestSessionVersion: album.guestSessionVersion,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) return notFound();
  const existing = await prisma.album.findFirst({
    where: { id: params.id, studioId: studio.id },
  });
  if (!existing) return notFound();
  await prisma.album.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
