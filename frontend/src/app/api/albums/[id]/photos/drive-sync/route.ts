import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { importNewPhotosFromDrive } from "@/lib/google-drive";
import { checkRateLimit } from "@/lib/rate-limit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** "Đồng bộ ảnh" for a Drive-linked album — re-scans the same folder the
 * studio already imported from (no need to re-paste the link) and adds
 * whatever's new. Deliberately additive only: never deletes an existing
 * photo, never touches guest selections, never creates a second album. */
export async function POST(
  req: Request,
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
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  if (!album.googleDriveFolderId) {
    return NextResponse.json(
      { error: { message: "Album này chưa nhập ảnh từ Google Drive." } },
      { status: 400 }
    );
  }
  if (!checkRateLimit(`drive-sync:${studio.id}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn đồng bộ quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  try {
    const result = await importNewPhotosFromDrive(album.id, album.googleDriveFolderId);
    return NextResponse.json(result);
  } catch (e) {
    console.error("drive-sync failed", e);
    return NextResponse.json(
      { error: { message: "Không thể đồng bộ Google Drive. Vui lòng thử lại." } },
      { status: 500 }
    );
  }
}
