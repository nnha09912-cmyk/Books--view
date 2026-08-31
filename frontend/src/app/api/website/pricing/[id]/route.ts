import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio } from "@/lib/auth";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  price: z.string().trim().min(1).max(60).optional(),
  unit: z.string().trim().max(40).nullable().optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  enabled: z.boolean().optional(),
});

/** Same IDOR guard used everywhere else in this app: verify the plan
 * belongs to the calling studio before reading it into an update. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const existing = await prisma.websitePricingPlan.findFirst({
    where: { id: params.id, studioId: studio.id },
    select: { id: true },
  });
  if (!existing) return jsonError("Không tìm thấy gói giá", 404);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Dữ liệu không hợp lệ", 400);
  const { name, price, unit, description, features, enabled } = parsed.data;

  const plan = await prisma.websitePricingPlan.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(price !== undefined ? { price } : {}),
      ...(unit !== undefined ? { unit } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(features !== undefined ? { features } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
    },
  });

  return NextResponse.json({ plan });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const studio = await getCurrentStudio();
  if (!studio) return jsonError("Chưa đăng nhập", 401);

  const existing = await prisma.websitePricingPlan.findFirst({
    where: { id: params.id, studioId: studio.id },
    select: { id: true },
  });
  if (!existing) return jsonError("Không tìm thấy gói giá", 404);

  await prisma.websitePricingPlan.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
