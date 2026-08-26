import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  photoIds: z.array(z.string()).min(1),
});

/** Persists the studio's drag-drop reorder — body carries the album's
 * full photo id list in the new order, and each gets a fresh sequential
 * orderIndex so there's never a mix of null/assigned values to sort by. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  const album = await prisma.album.findFirst({
    where: { id: params.id, studioId: studio.id },
    select: { id: true },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Dữ liệu không hợp lệ" } }, { status: 400 });
  }

  const existing = await prisma.photo.findMany({
    where: { albumId: album.id },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((p) => p.id));
  const orderedIds = parsed.data.photoIds.filter((id) => existingIds.has(id));
  if (orderedIds.length !== existing.length) {
    return NextResponse.json(
      { error: { message: "Danh sách ảnh không khớp với album" } },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.photo.update({ where: { id }, data: { orderIndex: index } })
    )
  );

  return NextResponse.json({ success: true });
}
