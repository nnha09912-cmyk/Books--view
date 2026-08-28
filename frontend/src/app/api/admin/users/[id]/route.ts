import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { studioDisplayName } from "@/lib/studio-name";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Detail view of one Studio account, for System Owner support/oversight
 * use — never returns another Studio's passwordHash, apiKey,
 * googleDriveToken, or lockout fields. Records a minimal access-trail
 * entry every time it's called, since viewing a specific person's account
 * is exactly the kind of access that needs to leave a trace. */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (studio.role !== "ADMIN") {
    return NextResponse.json({ error: { message: "Không có quyền truy cập" } }, { status: 403 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: { message: "Không tìm thấy người dùng" } }, { status: 404 });
  }

  const target = await prisma.studio.findFirst({
    where: { id: params.id, role: "USER" },
    select: {
      id: true,
      name: true,
      ownerName: true,
      email: true,
      phone: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      albums: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, photoCount: true, status: true, expiryDate: true },
      },
    },
  });
  if (!target) {
    return NextResponse.json({ error: { message: "Không tìm thấy người dùng" } }, { status: 404 });
  }

  await prisma.adminAccessLog.create({
    data: {
      actorStudioId: studio.id,
      action: "VIEW_USER",
      resourceType: "STUDIO",
      resourceId: target.id,
    },
  });

  return NextResponse.json({
    id: target.id,
    name: studioDisplayName(target),
    email: target.email,
    phone: target.phone,
    status: target.isActive ? "Active" : "Suspended",
    lastLoginAt: target.lastLoginAt,
    createdAt: target.createdAt,
    albums: target.albums,
  });
}
