import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  if (!UUID_RE.test(params.id)) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  const existing = await prisma.photobook.findFirst({
    where: { id: params.id, studioId: studio.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }
  await prisma.photobook.delete({ where: { id: existing.id } });
  return new NextResponse(null, { status: 204 });
}
