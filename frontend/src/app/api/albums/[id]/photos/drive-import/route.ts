import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { extractDriveFolderId, importNewPhotosFromDrive } from "@/lib/google-drive";
import { checkRateLimit } from "@/lib/rate-limit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  driveLink: z.string().min(1),
});

/** Imports images from a publicly-shared ("Anyone with the link") Google
 * Drive folder — same instant-import approach as photo.maclife.vn: this
 * only calls Drive's files.list (metadata, no image bytes) so pasting a
 * link stays fast no matter how many photos are in the folder. Photo rows
 * point straight at Drive's own thumbnail/download URLs — nothing is
 * downloaded to or stored on our server. This trades a bit of
 * durability (the preview breaks if the studio later unshares the Drive
 * folder) for near-instant import, which is what was explicitly chosen. */
export async function POST(
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
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  if (!checkRateLimit(`drive-sync:${studio.id}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn đồng bộ quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Thiếu link Google Drive" } }, { status: 400 });
  }

  const folderId = extractDriveFolderId(parsed.data.driveLink);
  if (!folderId) {
    return NextResponse.json(
      { error: { message: "Link Google Drive không hợp lệ" } },
      { status: 400 }
    );
  }

  try {
    const result = await importNewPhotosFromDrive(album.id, folderId);
    return NextResponse.json(result);
  } catch (e) {
    console.error("drive-import failed", e);
    return NextResponse.json(
      { error: { message: "Không thể nhập ảnh từ Google Drive. Vui lòng thử lại." } },
      { status: 500 }
    );
  }
}
