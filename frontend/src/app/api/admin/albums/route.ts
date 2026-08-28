import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { studioDisplayName } from "@/lib/studio-name";

/** Cross-tenant Album list for the System Owner "Albums" overview page —
 * intentionally read-only, no per-list access log entry (only drilling
 * into one specific Album is logged, matching the same pattern as the
 * Users list vs. Users detail). */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }

  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      status: true,
      expiryDate: true,
      photoCount: true,
      studio: { select: { name: true, ownerName: true, email: true } },
    },
  });

  return NextResponse.json({
    data: albums.map((a) => ({
      id: a.id,
      name: a.name,
      studio: studioDisplayName(a.studio),
      photoCount: a.photoCount,
      status: a.status,
      expiryDate: a.expiryDate,
    })),
  });
}
