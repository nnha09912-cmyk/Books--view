import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export const SESSION_COOKIE = "bv_session";
export const GUEST_COOKIE_PREFIX = "bv_guest_";

export interface SessionPayload {
  studioId: string;
}

export interface GuestPayload {
  customerId: string;
  albumId: string;
}

export function guestCookieName(linkToken: string) {
  return `${GUEST_COOKIE_PREFIX}${linkToken}`;
}

export function signGuest(payload: GuestPayload) {
  return jwt.sign(payload, requireSecret(), { expiresIn: "30d" });
}

export function verifyGuest(token: string): GuestPayload | null {
  try {
    return jwt.verify(token, requireSecret()) as GuestPayload;
  } catch {
    return null;
  }
}

export async function getGuestCustomer(linkToken: string) {
  const token = cookies().get(guestCookieName(linkToken))?.value;
  if (!token) return null;
  const payload = verifyGuest(token);
  if (!payload) return null;
  return prisma.customer.findUnique({ where: { id: payload.customerId } });
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function requireSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in the environment");
  }
  return JWT_SECRET;
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, requireSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, requireSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentStudio() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  return prisma.studio.findUnique({ where: { id: payload.studioId } });
}
