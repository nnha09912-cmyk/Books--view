import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

/** Lists the minimal admin access trail (see AdminAccessLog) — every ADMIN
 * can see every entry here, including ones logged by other admins. Unlike
 * the Users list (which hides other ADMIN accounts' existence), the audit
 * trail's whole point is accountability across all System Owner activity,
 * so it's not filtered by actor. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }

  const rows = await prisma.adminAccessLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      action: true,
      resourceType: true,
      resourceId: true,
      createdAt: true,
      actor: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    data: rows.map((r) => ({
      id: r.id,
      time: r.createdAt,
      actor: r.actor.name,
      actorEmail: r.actor.email,
      action: r.action,
      resource: `${r.resourceType} #${r.resourceId.slice(0, 8)}`,
    })),
  });
}
