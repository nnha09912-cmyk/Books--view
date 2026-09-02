import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { getEntitlements, startOfCurrentMonth } from "@/lib/entitlements";

export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const albums = await prisma.album.findMany({
    where: { studioId: studio.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { customers: true, viewEvents: true } } },
  });
  const albumIds = albums.map((a) => a.id);
  // One grouped query for like/star totals across every one of this
  // studio's albums, instead of N+1 per-album aggregates — Photo already
  // keeps a denormalized likeCount/starCount per photo (bumped on
  // like/star), this just sums those per album.
  const likeStarTotals =
    albumIds.length > 0
      ? await prisma.photo.groupBy({
          by: ["albumId"],
          where: { albumId: { in: albumIds } },
          _sum: { likeCount: true, starCount: true },
        })
      : [];
  const totalsByAlbum = new Map(
    likeStarTotals.map((t) => [t.albumId, { likes: t._sum.likeCount ?? 0, stars: t._sum.starCount ?? 0 }])
  );
  return NextResponse.json({
    data: albums.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      template: a.template,
      photoCount: a.photoCount,
      customerCount: a._count.customers,
      viewCount: a._count.viewEvents,
      totalLikes: totalsByAlbum.get(a.id)?.likes ?? 0,
      totalStars: totalsByAlbum.get(a.id)?.stars ?? 0,
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

  const entitlements = getEntitlements(studio.plan);
  if (Number.isFinite(entitlements.albumsPerMonth)) {
    const createdThisMonth = await prisma.album.count({
      where: { studioId: studio.id, createdAt: { gte: startOfCurrentMonth() } },
    });
    if (createdThisMonth >= entitlements.albumsPerMonth) {
      return NextResponse.json(
        {
          error: {
            message: `Gói hiện tại chỉ tạo được ${entitlements.albumsPerMonth} album/tháng — đã dùng hết, nâng cấp gói hoặc chờ sang tháng sau.`,
          },
        },
        { status: 403 }
      );
    }
  }

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
