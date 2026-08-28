import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { downloadCookieName, signDownloadUnlock, verifyPassword } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  password: z.string().min(1),
});

/** Verifies the album's separate "Mật khẩu tải ảnh" (Download password, set
 * in Album Settings — distinct from the album/Sao password) and, on
 * success, unlocks the gated Download endpoints by setting a signed cookie
 * scoped to this album. Deliberately does not require guest identification
 * — Download is gated by this password alone, not by who's asking. */
export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
    select: { id: true, downloadEnabled: true, downloadPasswordHash: true },
  });
  if (!album) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Không tìm thấy album" } }, { status: 404 });
  }
  if (!album.downloadEnabled) {
    return NextResponse.json(
      { error: { code: "DOWNLOAD_DISABLED", message: "Album này không cho phép tải ảnh." } },
      { status: 403 }
    );
  }

  const ip = clientIp(req);
  if (!checkRateLimit(`download-pw:${album.id}:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Bạn nhập sai quá nhiều lần, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }

  if (
    !album.downloadPasswordHash ||
    !(await verifyPassword(parsed.data.password, album.downloadPasswordHash))
  ) {
    return NextResponse.json(
      { error: { code: "WRONG_PASSWORD", message: "Sai mật khẩu tải ảnh" } },
      { status: 401 }
    );
  }

  const token = signDownloadUnlock({ albumId: album.id });
  const res = NextResponse.json({ success: true });
  res.cookies.set(downloadCookieName(params.linkToken), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
