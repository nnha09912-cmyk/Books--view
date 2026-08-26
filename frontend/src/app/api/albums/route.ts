import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const albums = await prisma.album.findMany({
    where: { studioId: studio.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { customers: true } } },
  });
  return NextResponse.json({
    data: albums.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      template: a.template,
      photoCount: a.photoCount,
      customerCount: a._count.customers,
      status: a.status,
      linkToken: a.linkToken,
      createdAt: a.createdAt,
      expiryDate: a.expiryDate,
    })),
  });
}

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  template: z.string().default("classic"),
  expiryDate: z.string().optional(),
  maxSelectionCount: z.coerce.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { name, description, template, expiryDate, maxSelectionCount } = parsed.data;
  const linkToken = randomBytes(6).toString("hex");

  const album = await prisma.album.create({
    data: {
      studioId: studio.id,
      name,
      description,
      template,
      linkToken,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      maxSelectionCount,
    },
  });

  return NextResponse.json(
    {
      id: album.id,
      linkToken: album.linkToken,
      shareUrl: `/album/${album.linkToken}`,
    },
    { status: 201 }
  );
}
