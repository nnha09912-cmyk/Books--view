import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getCurrentStudio,
  hashPassword,
  verifyPassword,
  signSession,
  SESSION_COOKIE,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const studio = await getCurrentStudio();
  if (!studio) {
    return NextResponse.json({ error: { message: "Chưa đăng nhập" } }, { status: 401 });
  }
  return NextResponse.json({
    studio: {
      id: studio.id,
      name: studio.name,
      ownerName: studio.ownerName,
      email: studio.email,
      slug: studio.slug,
      phone: studio.phone,
      description: studio.description,
      logoUrl: studio.logoUrl,
      role: studio.role,
    },
  });
}

const patchSchema = z.object({
  // No min(1) — an empty string means "clear the studio name", since it's
  // optional (not everyone using Books View runs a studio).
  name: z.string().optional(),
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
  // Covers Change Password specifically — a valid session holder repeatedly
  // guessing currentPassword shouldn't get unlimited tries just because
  // they're already logged in.
  if (!checkRateLimit(`account:${current.id}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword, name, ...rest } = parsed.data;

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
      ...(name !== undefined ? { name: name.trim() || null } : {}),
      ...(newPassword
        ? {
            passwordHash: await hashPassword(newPassword),
            // Invalidates every previously-issued session token for this
            // studio (e.g. a leaked cookie) — a fresh one is re-signed below
            // so this browser's own session isn't kicked out too.
            sessionVersion: { increment: 1 },
          }
        : {}),
    },
  });

  const res = NextResponse.json({
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
  if (newPassword) {
    const token = signSession({ studioId: studio.id, sessionVersion: studio.sessionVersion });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
