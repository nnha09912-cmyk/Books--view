import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  signGuest,
  guestCookieName,
  getGuestCustomer,
  verifyPassword,
} from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
});

/** Identifies (or creates) the guest customer for a public album.
 *
 * Two ways to identify, both available whenever a password is set:
 *  - Password login (couple/wedding use case): the shared album password the
 *    studio set in Settings — defaults the customer name to "Cô dâu & Chú rể".
 *  - Name + phone "login" (anyone else — family, guests, yearbook classmates):
 *    always available; required when no password was submitted.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  const album = await prisma.album.findUnique({
    where: { linkToken: params.linkToken },
  });
  if (!album) {
    return NextResponse.json({ error: { message: "Không tìm thấy album" } }, { status: 404 });
  }

  const existingGuest = await getGuestCustomer(params.linkToken);
  if (existingGuest) {
    return NextResponse.json({ customerId: existingGuest.id, isPrimary: existingGuest.isPrimary });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Dữ liệu không hợp lệ" } }, { status: 400 });
  }
  const { name, phone, email, password } = parsed.data;

  let customerName = name?.trim();
  let isPrimary = false;

  if (password) {
    if (!album.passwordHash || !(await verifyPassword(password, album.passwordHash))) {
      return NextResponse.json({ error: { message: "Sai mật khẩu" } }, { status: 401 });
    }
    if (!customerName) customerName = "Cô dâu & Chú rể";
    isPrimary = true;
  } else {
    if (!customerName || !phone?.trim()) {
      return NextResponse.json(
        { error: { message: "Vui lòng nhập tên và số điện thoại" } },
        { status: 400 }
      );
    }
  }

  const customer = await prisma.customer.create({
    data: {
      albumId: album.id,
      name: customerName,
      phone: phone?.trim() || undefined,
      email,
      isPrimary,
      lastViewedAt: new Date(),
    },
  });

  const token = signGuest({ customerId: customer.id, albumId: album.id });
  const res = NextResponse.json({ customerId: customer.id, isPrimary: customer.isPrimary }, { status: 201 });
  res.cookies.set(guestCookieName(params.linkToken), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
