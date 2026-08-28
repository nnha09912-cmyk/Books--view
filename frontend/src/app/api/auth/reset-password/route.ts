import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  if (!checkRateLimit(`reset-password:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
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
  const { token, newPassword } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: { message: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." } },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.studio.update({
      where: { id: record.studioId },
      data: {
        passwordHash,
        // Same as a normal Change Password — invalidates every
        // previously-issued session, including any attacker who had a
        // stolen cookie before this reset.
        sessionVersion: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
