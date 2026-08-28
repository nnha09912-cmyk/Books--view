import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

/** Real platform-wide counts for the System Owner Overview page. Only
 * counts that can actually be computed today — pending-moderation and
 * security-alert counts stay out of this response entirely (not faked as
 * 0) since Content Safety Scan / alerting isn't built yet; the page shows
 * those as "chưa kết nối" instead of a real number. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }

  const [activeStudios, totalStudios, totalCustomers] = await Promise.all([
    prisma.studio.count({ where: { role: "USER", isActive: true } }),
    prisma.studio.count({ where: { role: "USER" } }),
    prisma.customer.count(),
  ]);

  return NextResponse.json({
    activeStudios,
    totalUsers: totalStudios + totalCustomers,
  });
}
