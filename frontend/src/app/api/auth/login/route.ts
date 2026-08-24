import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ" } },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const studio = await prisma.studio.findUnique({ where: { email } });
  if (!studio || !(await verifyPassword(password, studio.passwordHash))) {
    return NextResponse.json(
      { error: { message: "Email hoặc mật khẩu không đúng" } },
      { status: 401 }
    );
  }

  const token = signSession({ studioId: studio.id });
  const res = NextResponse.json({
    studio: { id: studio.id, name: studio.name, email: studio.email },
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
