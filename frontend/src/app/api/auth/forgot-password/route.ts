import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

const bodySchema = z.object({ email: z.string().email() });

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Always responds with the same generic message regardless of whether the
 * email exists — an account-enumeration guard, same reasoning as the
 * signup email-taken check elsewhere in this codebase. */
export async function POST(req: NextRequest) {
  if (!checkRateLimit(`forgot-password:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Email không hợp lệ" } },
      { status: 400 }
    );
  }
  const { email } = parsed.data;

  // Second, email-keyed limit: caps how many reset emails one address can
  // be sent regardless of which IP is requesting them.
  if (!checkRateLimit(`forgot-password-email:${email}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }

  const studio = await prisma.studio.findUnique({ where: { email } });
  if (studio) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        studioId: studio.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
