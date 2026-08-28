import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { resizeAvatar, InvalidImageError } from "@/lib/image-resize";
import { checkRateLimit } from "@/lib/rate-limit";

/** Uploads a Studio's own avatar/logo from a local file (replacing the old
 * URL-paste flow) — validates and re-encodes via resizeAvatar before ever
 * writing to disk, same pattern as the album photo upload route. */
export async function POST(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!checkRateLimit(`avatar:${studio.id}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: { message: "Không có file nào được gửi lên" } }, { status: 400 });
  }

  let resized: Buffer;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    resized = await resizeAvatar(bytes);
  } catch (err) {
    if (err instanceof InvalidImageError) {
      return NextResponse.json({ error: { message: err.message } }, { status: 400 });
    }
    throw err;
  }

  const filename = `avatars/${studio.id}-${Date.now()}.jpg`;
  const blob = await put(filename, resized, {
    access: "public",
    contentType: "image/jpeg",
  });

  const logoUrl = blob.url;
  await prisma.studio.update({ where: { id: studio.id }, data: { logoUrl } });

  return NextResponse.json({ logoUrl });
}
