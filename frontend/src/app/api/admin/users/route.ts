import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { studioDisplayName } from "@/lib/studio-name";

/** Lists every regular ("USER") Studio account on the platform — deliberately
 * excludes role="ADMIN" rows, so backup/System Owner accounts never appear
 * even to other admins browsing this list. Cross-tenant by design (this is
 * the one place in Books View that's allowed to see across every Studio),
 * but only after confirming the caller's own role from the database. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }

  const users = await prisma.studio.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      ownerName: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { albums: true } },
    },
  });

  return NextResponse.json({
    data: users.map((u) => ({
      id: u.id,
      name: studioDisplayName(u),
      email: u.email,
      albumCount: u._count.albums,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      status: u.isActive ? "Active" : "Suspended",
    })),
  });
}
