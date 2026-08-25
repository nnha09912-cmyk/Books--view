import crypto from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Finds the Studio for this OAuth email, or creates one on first
 * Google/Facebook login. OAuth-only accounts get a random, never-shown
 * password hash — the studio can still set a real password later from
 * Settings to also enable email/password login. */
export async function findOrCreateOAuthStudio(email: string, name: string) {
  const existing = await prisma.studio.findUnique({ where: { email } });
  if (existing) return existing;

  const baseSlug = slugify(name || email.split("@")[0]) || "studio";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.studio.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
  return prisma.studio.create({
    data: { name: name || email.split("@")[0], slug, email, passwordHash },
  });
}
