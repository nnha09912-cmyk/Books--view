import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";
import { getEntitlements, startOfCurrentMonth } from "@/lib/entitlements";

const DEMO_ALBUM_LIFETIME_DAYS = 30;

function shortId(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/** Lists this Studio's own Photobooks — "Lịch sử Album" in the editor. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const now = new Date();
  const rows = await prisma.photobook.findMany({
    where: { studioId: studio.id, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: rows });
}

const demoPhotoSchema = z.object({
  id: z.string(),
  // Local-disk uploads (upload/route.ts) return a relative "/uploads/..."
  // path, not an absolute URL — accept either.
  url: z.string().min(1).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "URL không hợp lệ"),
  width: z.number(),
  height: z.number(),
});

const materialSchema = z.object({
  id: z.string(),
  label: z.string(),
  texture: z.enum(["leather", "fabric"]),
  swatchCss: z.string(),
});

const coverSchema = z
  .union([
    z.object({ kind: z.literal("photo"), photo: demoPhotoSchema }),
    z.object({ kind: z.literal("material"), material: materialSchema }),
  ])
  .nullable();

const pageSchema = z.object({
  id: z.string(),
  image: demoPhotoSchema,
  pageType: z.enum(["single", "spread"]),
});

const bodySchema = z.object({
  title: z.string(),
  albumType: z.enum(["portrait", "square", "landscape"]),
  pageMode: z.enum(["single", "spread"]),
  cover: coverSchema,
  pages: z.array(pageSchema).min(1),
  pageWidthPx: z.number().int().positive(),
  pageHeightPx: z.number().int().positive(),
});

/** Creates a Photobook — gated by Studio.plan → entitlements.photobooksPerMonth
 * (see md new/GUIKHACH_PLAN_PRICING_FEATURES.md). Cover/page image URLs must
 * already exist (POST /api/photobooks/upload) — this route only assembles
 * and persists the record, it never touches raw image bytes itself. */
export async function POST(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Dữ liệu không hợp lệ" } }, { status: 400 });
  }

  const entitlements = getEntitlements(studio.plan);
  if (Number.isFinite(entitlements.photobooksPerMonth)) {
    const createdThisMonth = await prisma.photobook.count({
      where: { studioId: studio.id, createdAt: { gte: startOfCurrentMonth() } },
    });
    if (createdThisMonth >= entitlements.photobooksPerMonth) {
      return NextResponse.json(
        {
          error: {
            message: `Gói hiện tại chỉ tạo được ${entitlements.photobooksPerMonth} Photobook/tháng — đã dùng hết, nâng cấp gói hoặc chờ sang tháng sau.`,
          },
        },
        { status: 403 }
      );
    }
  }

  const { title, albumType, pageMode, cover, pages, pageWidthPx, pageHeightPx } = parsed.data;
  const now = new Date();
  const photobook = await prisma.photobook.create({
    data: {
      studioId: studio.id,
      shareId: shortId(),
      title: title.trim() || "Album không tên",
      albumType,
      pageMode,
      cover: cover ?? undefined,
      pages,
      pageWidthPx,
      pageHeightPx,
      expiresAt: new Date(now.getTime() + DEMO_ALBUM_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json(photobook, { status: 201 });
}
