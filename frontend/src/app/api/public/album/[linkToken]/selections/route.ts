import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  photoId: z.string().min(1),
  type: z.enum(["like", "star"]),
});

class SelectionLimitError extends Error {}

export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }
  if (!checkRateLimit(`selection:${guest.id}`, 60, 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau nhé." } },
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
  const { photoId, type } = parsed.data;

  if (type === "star" && !guest.isPrimary) {
    return NextResponse.json(
      { error: { message: "Chỉ Cô dâu & Chú rể mới có thể đánh dấu Sao" } },
      { status: 403 }
    );
  }

  // photoId comes from the client — without this check a guest of one album
  // could like/star a photoId belonging to a completely different album
  // (IDOR), inflating/deflating counters they have no relationship to.
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, albumId: guest.albumId },
    select: { id: true },
  });
  if (!photo) {
    return NextResponse.json(
      { error: { message: "Không tìm thấy ảnh trong album này" } },
      { status: 404 }
    );
  }

  // Album may have been closed or have expired after this guest's session
  // was created — a valid cookie shouldn't be enough to keep selecting once
  // the studio has cut off selections.
  const album = await prisma.album.findUnique({
    where: { id: guest.albumId },
    select: { status: true, expiryDate: true, maxSelectionCount: true },
  });
  if (!album || album.status === "closed") {
    return NextResponse.json(
      { error: { message: "Album này đã đóng, không thể chọn ảnh." } },
      { status: 403 }
    );
  }
  if (album.expiryDate && album.expiryDate < new Date()) {
    return NextResponse.json(
      { error: { message: "Album đã hết hạn, không thể chọn ảnh." } },
      { status: 403 }
    );
  }

  const existing = await prisma.selection.findUnique({
    where: {
      customerId_photoId_likeType: {
        customerId: guest.id,
        photoId,
        likeType: type,
      },
    },
  });
  if (existing) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    // Interactive + Serializable transaction so the count check and the
    // insert are atomic — without this, two parallel requests (double tab,
    // fast double-click, or a direct API call) could both read the count
    // before either commits and jointly exceed maxSelectionCount.
    await prisma.$transaction(
      async (tx) => {
        if (type === "like" && album.maxSelectionCount) {
          const likedCount = await tx.selection.count({
            where: { customerId: guest.id, likeType: "like" },
          });
          if (likedCount >= album.maxSelectionCount) {
            throw new SelectionLimitError();
          }
        }
        await tx.selection.create({
          data: { customerId: guest.id, photoId, likeType: type },
        });
        await tx.photo.update({
          where: { id: photoId },
          data:
            type === "like"
              ? { likeCount: { increment: 1 } }
              : { starCount: { increment: 1 } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (e) {
    if (e instanceof SelectionLimitError) {
      return NextResponse.json(
        { error: { message: `Bạn chỉ được chọn tối đa ${album.maxSelectionCount} ảnh` } },
        { status: 403 }
      );
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: the same parallel-request race already created this exact
      // selection a moment ago — treat like the existing-selection check
      // above and succeed idempotently instead of erroring.
      if (e.code === "P2002") {
        return new NextResponse(null, { status: 204 });
      }
      // P2034: a genuine serialization conflict from Postgres — ask the
      // client to retry rather than surfacing the raw Prisma error.
      if (e.code === "P2034") {
        return NextResponse.json(
          { error: { message: "Có thao tác khác đang xử lý, vui lòng thử lại." } },
          { status: 409 }
        );
      }
    }
    throw e;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
