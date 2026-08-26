import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentStudio, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  return NextResponse.json({
    studio: {
      id: studio.id,
      name: studio.name,
      email: studio.email,
      slug: studio.slug,
      phone: studio.phone,
      description: studio.description,
      logoUrl: studio.logoUrl,
    },
  });
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest) {
  const current = await getCurrentStudio();
  if (!current) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword, ...rest } = parsed.data;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: { message: "Vui lòng nhập mật khẩu hiện tại" } },
        { status: 400 }
      );
    }
    const valid = await verifyPassword(currentPassword, current.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { message: "Mật khẩu hiện tại không đúng" } },
        { status: 401 }
      );
    }
  }

  const studio = await prisma.studio.update({
    where: { id: current.id },
    data: {
      ...rest,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
    },
  });
  return NextResponse.json({
    studio: {
      id: studio.id,
      name: studio.name,
      email: studio.email,
      slug: studio.slug,
      phone: studio.phone,
      description: studio.description,
      logoUrl: studio.logoUrl,
    },
  });
}
