import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Regenerates an album's share link — the same random format used at
 * creation. The old linkToken simply stops resolving to anything (every
 * public route looks the album up by linkToken), so anyone still holding
 * the old URL is cut off immediately without needing a separate
 * revocation step. Does not touch Photos/Selections/Comments/Settings. */
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
  const existing = await prisma.album.findFirst({
    where: { id: params.id, studioId: studio.id },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  const linkToken = randomBytes(6).toString("hex");
  const album = await prisma.album.update({
    where: { id: params.id },
    data: { linkToken },
  });

  return NextResponse.json({
    linkToken: album.linkToken,
    shareUrl: `/album/${album.linkToken}`,
  });
}
