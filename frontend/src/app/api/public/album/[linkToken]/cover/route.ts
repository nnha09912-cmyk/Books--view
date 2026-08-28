import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  coverPhotoId: z.string().uuid().nullable(),
  coverPosY: z.number().min(0).max(100).optional(),
});

/** Sets an Album's cover photo (used as the Landing Page template's
 * background). Lives under the guest-facing /public/album/[linkToken] path
 * like the rest of this album's guest routes, but is studio-only: the
 * Gallery page anyone with the share link can open also renders the
 * "Change Cover" control with no way to tell a guest from the owning
 * studio previewing their own album, so the write itself must be the
 * actual gate — a guest's request 401/403s here even though the button is
 * visible to them. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const album = await prisma.album.findFirst({
    where: { linkToken: params.linkToken, studioId: studio.id },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  if (!checkRateLimit(`cover:${studio.id}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { coverPhotoId, coverPosY } = parsed.data;

  if (coverPhotoId) {
    const photo = await prisma.photo.findFirst({
      where: { id: coverPhotoId, albumId: album.id },
    });
    if (!photo) {
      return NextResponse.json(
        { error: { message: "Ảnh này không thuộc album" } },
        { status: 400 }
      );
    }
  }

  await prisma.album.update({
    where: { id: album.id },
    data: {
      coverPhotoId,
      ...(coverPosY !== undefined ? { coverPosY: Math.round(coverPosY) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
