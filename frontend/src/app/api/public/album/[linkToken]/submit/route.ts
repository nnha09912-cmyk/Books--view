import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getGuestCustomer } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const guest = await getGuestCustomer(params.linkToken);
  if (!guest) {
    return NextResponse.json({ error: { message: "Chưa có phiên khách" } }, { status: 401 });
  }

  const [liked, starred] = await Promise.all([
    prisma.selection.count({ where: { customerId: guest.id, likeType: "like" } }),
    prisma.selection.count({ where: { customerId: guest.id, likeType: "star" } }),
  ]);

  await prisma.customer.update({
    where: { id: guest.id },
    data: { submittedAt: new Date() },
  });

  return NextResponse.json({
    message: "Selections submitted",
    liked,
    starred,
  });
}
