import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { studioDisplayName } from "@/lib/studio-name";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read-only cross-tenant Album view for System Owner support/moderation
 * use — intentionally minimal: photo thumbnails/counts and the owning
 * Studio's name only, no guest (Customer) contact info, no ability to
 * edit/delete anything. Records a minimal access-trail entry every call. */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  const album = await prisma.album.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      status: true,
      expiryDate: true,
      photoCount: true,
      createdAt: true,
      studio: { select: { id: true, name: true, ownerName: true, email: true } },
      photos: {
        orderBy: { orderIndex: "asc" },
        take: 60,
        select: {
          id: true,
          filename: true,
          thumbnailUrl: true,
          likeCount: true,
          starCount: true,
        },
      },
      _count: { select: { customers: true } },
    },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  await prisma.adminAccessLog.create({
    data: {
      actorStudioId: studio.id,
      action: "VIEW_ALBUM",
      resourceType: "ALBUM",
      resourceId: album.id,
    },
  });

  return NextResponse.json({
    id: album.id,
    name: album.name,
    status: album.status,
    expiryDate: album.expiryDate,
    photoCount: album.photoCount,
    createdAt: album.createdAt,
    customerCount: album._count.customers,
    studio: { id: album.studio.id, name: studioDisplayName(album.studio), email: album.studio.email },
    photos: album.photos,
  });
}
