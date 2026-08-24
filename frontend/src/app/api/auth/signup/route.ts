import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().min(1),
  studioName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Dữ liệu không hợp lệ", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }
  const { studioName, email, password, phone } = parsed.data;

  const existing = await prisma.studio.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: { message: "Email đã được sử dụng" } },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const baseSlug = slugify(studioName) || "studio";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.studio.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const studio = await prisma.studio.create({
    data: { name: studioName, slug, email, passwordHash, phone },
  });

  const token = signSession({ studioId: studio.id });
  const res = NextResponse.json(
    { studio: { id: studio.id, name: studio.name, email: studio.email } },
    { status: 201 }
  );
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
