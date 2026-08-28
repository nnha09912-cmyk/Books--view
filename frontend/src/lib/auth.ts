import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export const SESSION_COOKIE = "bv_session";
export const GUEST_COOKIE_PREFIX = "bv_guest_";
export const OAUTH_STATE_COOKIE = "bv_oauth_state";
export const DOWNLOAD_COOKIE_PREFIX = "bv_download_";

export interface SessionPayload {
  studioId: string;
  sessionVersion: number;
}

export interface GuestPayload {
  customerId: string;
  albumId: string;
  sessionVersion: number;
}

export interface DownloadUnlockPayload {
  albumId: string;
}

export function guestCookieName(linkToken: string) {
  return `${GUEST_COOKIE_PREFIX}${linkToken}`;
}

export function downloadCookieName(linkToken: string) {
  return `${DOWNLOAD_COOKIE_PREFIX}${linkToken}`;
}

/** Signed separately from the guest identity cookie so unlocking Download
 * (a per-album password distinct from the album/Sao password) doesn't
 * require re-signing or touching the guest's own session. */
export function signDownloadUnlock(payload: DownloadUnlockPayload) {
  return jwt.sign(payload, requireSecret(), { expiresIn: "7d" });
}

export function verifyDownloadUnlock(token: string): DownloadUnlockPayload | null {
  try {
    return jwt.verify(token, requireSecret()) as DownloadUnlockPayload;
  } catch {
    return null;
  }
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
  const customer = await prisma.customer.findUnique({
    where: { id: payload.customerId },
    include: { album: { select: { guestSessionVersion: true } } },
  });
  if (!customer) return null;
  // Same pattern as getCurrentStudio()'s sessionVersion check — a token
  // signed before the album's Primary Password last changed (or an
  // explicit "Revoke Sessions") carries a stale version and must be
  // rejected even though the JWT signature itself still verifies.
  if (customer.album.guestSessionVersion !== payload.sessionVersion) return null;
  return customer;
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
  const studio = await prisma.studio.findUnique({ where: { id: payload.studioId } });
  if (!studio) return null;
  // A token signed before the last password change (or an explicit
  // revocation) carries a stale sessionVersion — reject it even though the
  // JWT signature itself is still valid, since there's no server-side
  // session store to have deleted it from.
  if (studio.sessionVersion !== payload.sessionVersion) return null;
  return studio;
}
