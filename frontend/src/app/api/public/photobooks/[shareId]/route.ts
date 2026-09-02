import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Public, unauthenticated — the whole point of a Photobook share link is
 * that anyone who has it can open it, on any device/browser (no
 * localStorage, no session). Bumps `views` on every successful load,
 * request-level like AlbumViewEvent — opening the same link 3 times is 3
 * bumps, no dedup, by design. */
export async function GET(
  _req: Request,
  { params }: { params: { shareId: string } }
) {
  const now = new Date();
  const photobook = await prisma.photobook.findUnique({
    where: { shareId: params.shareId },
  });
  if (!photobook || photobook.expiresAt <= now) {
    return NextResponse.json(
      { error: { message: "Không tìm thấy album này — có thể link đã hết hạn hoặc album đã bị xoá." } },
      { status: 404 }
    );
  }

  const updated = await prisma.photobook.update({
    where: { id: photobook.id },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json(updated);
}
