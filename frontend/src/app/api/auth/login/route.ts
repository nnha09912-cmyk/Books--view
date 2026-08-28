import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!checkRateLimit(`login:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau ít phút." } },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { identifier, password } = parsed.data;

  const studio = await prisma.studio.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
  });

  if (studio?.lockedUntil && studio.lockedUntil > new Date()) {
    const minutes = Math.ceil((studio.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json(
      {
        error: {
          message: `Tài khoản tạm khoá do đăng nhập sai quá nhiều lần. Thử lại sau ${minutes} phút.`,
        },
      },
      { status: 429 }
    );
  }

  const passwordOk = studio ? await verifyPassword(password, studio.passwordHash) : false;
  if (!studio || !passwordOk) {
    if (studio) {
      const attempts = studio.failedLoginAttempts + 1;
      const lockedOut = attempts >= MAX_FAILED_ATTEMPTS;
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          failedLoginAttempts: lockedOut ? 0 : attempts,
          lockedUntil: lockedOut ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
      });
    }
    return NextResponse.json(
      { error: { message: "Email/SĐT hoặc mật khẩu không đúng" } },
      { status: 401 }
    );
  }

  await prisma.studio.update({
    where: { id: studio.id },
    data: {
      lastLoginAt: new Date(),
      ...(studio.failedLoginAttempts > 0 || studio.lockedUntil
        ? { failedLoginAttempts: 0, lockedUntil: null }
        : {}),
    },
  });

  const token = signSession({ studioId: studio.id, sessionVersion: studio.sessionVersion });
  const res = NextResponse.json({
    studio: { id: studio.id, name: studio.name, email: studio.email, role: studio.role },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
