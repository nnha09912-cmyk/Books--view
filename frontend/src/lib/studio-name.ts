/** Fallback avatar/logo shown until a Studio uploads their own — see
 * public/defaults/avatar-default.jpg. */
export const DEFAULT_AVATAR = "/defaults/avatar-default.jpg";

/** Display-name priority for greeting/addressing a Studio account:
 * Tên Studio → Họ tên → Email. Shared between server (API routes) and
 * client (dashboard greeting) so the fallback stays consistent everywhere. */
export function studioDisplayName(studio: {
  name?: string | null;
  ownerName?: string | null;
  email: string;
}) {
  return studio.name?.trim() || studio.ownerName?.trim() || studio.email;
}
