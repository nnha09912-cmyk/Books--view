import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

/** The calling studio's own pricing plans (Website Studio → Bảng giá),
 * ordered for display. Studio-authenticated, never public — the public
 * route filters to `enabled` ones separately. */
export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const plans = await prisma.websitePricingPlan.findMany({
    where: { studioId: studio.id },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ plans });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.string().trim().min(1).max(60),
  unit: z.string().trim().max(40).optional(),
  description: z.string().trim().max(1000).optional(),
  features: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
});

/** Appends a new plan at the end of this studio's list (orderIndex = current
 * count) — reordering isn't built yet, plans just append/delete for now. */
export async function POST(req: NextRequest) {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Dữ liệu không hợp lệ", 400);

  const count = await prisma.websitePricingPlan.count({ where: { studioId: studio.id } });

  const plan = await prisma.websitePricingPlan.create({
    data: {
      studioId: studio.id,
      name: parsed.data.name,
      price: parsed.data.price,
      unit: parsed.data.unit || null,
      description: parsed.data.description || null,
      features: parsed.data.features ?? [],
      orderIndex: count,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
