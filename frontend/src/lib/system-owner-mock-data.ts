/** Standalone mock data for the System Owner area — not wired to the real
 * database yet (see project decision: build the UI first, connect real
 * Studio/Album/Photo data later). Kept in its own file, separate from
 * `lib/mock-data.ts`, so nothing here can be confused with or accidentally
 * imported by the real Books View admin pages. */

export type OwnerUserType = "Customer" | "Studio Admin";
export type OwnerStatus = "Active" | "Review" | "Suspended";

export interface OwnerUserRow {
  id: string;
  name: string;
  email: string;
  type: OwnerUserType;
  album: string;
  lastLogin: string;
  status: OwnerStatus;
}

export const ownerUsers: OwnerUserRow[] = [
  {
    id: "U821",
    name: "Nguyễn Minh Anh",
    email: "minh***@gmail.com",
    type: "Customer",
    album: "Wedding Minh & Lan",
    lastLogin: "28/08/2026 20:14",
    status: "Active",
  },
  {
    id: "U822",
    name: "Trần Hoàng",
    email: "hoang***@gmail.com",
    type: "Studio Admin",
    album: "Books Studio",
    lastLogin: "28/08/2026 19:41",
    status: "Active",
  },
  {
    id: "U823",
    name: "Lê Ngọc",
    email: "ngoc***@gmail.com",
    type: "Customer",
    album: "Wedding Ngọc & Huy",
    lastLogin: "27/08/2026 22:02",
    status: "Review",
  },
];

export type ModerationLabel = "Needs Review" | "Reported";

export interface ModerationPhoto {
  id: string;
  album: string;
  label: ModerationLabel;
}

export const moderationQueue: ModerationPhoto[] = [
  { id: "A8F21", album: "Wedding Minh & Lan", label: "Needs Review" },
  { id: "B72C1", album: "Wedding Ngọc & Huy", label: "Reported" },
  { id: "C91D7", album: "Demo Album", label: "Needs Review" },
];

export type OwnerAlbumStatus = "Active" | "Expired";

export interface OwnerAlbumRow {
  name: string;
  studio: string;
  photoCount: number;
  status: OwnerAlbumStatus;
  expiry: string;
}

export const ownerAlbums: OwnerAlbumRow[] = [
  { name: "Wedding Minh & Lan", studio: "Books Studio", photoCount: 842, status: "Active", expiry: "30/09/2026" },
  { name: "Wedding Ngọc & Huy", studio: "Studio A", photoCount: 1204, status: "Active", expiry: "12/10/2026" },
  { name: "Demo Album", studio: "Books Studio", photoCount: 320, status: "Expired", expiry: "20/08/2026" },
];

export interface AuditLogRow {
  time: string;
  actor: string;
  action: string;
  resource: string;
  reason: string;
}

export const auditLogRows: AuditLogRow[] = [
  { time: "28/08 20:31", actor: "System Owner", action: "VIEW_PREVIEW", resource: "Photo #A8F21", reason: "Moderation" },
  { time: "28/08 20:29", actor: "Moderator 01", action: "MARK_CONTENT", resource: "Photo #B72C1", reason: "User Report" },
  { time: "28/08 19:55", actor: "System Owner", action: "VIEW_USER", resource: "User #U821", reason: "Security Review" },
];

export interface SecurityPermission {
  label: string;
  enabled: boolean;
}

export const securityPermissions: SecurityPermission[] = [
  { label: "Moderation Preview", enabled: true },
  { label: "View Original", enabled: false },
  { label: "Download Original", enabled: false },
  { label: "Audit Logging", enabled: true },
];

export const overviewStats = {
  activeStudios: 24,
  activeStudiosDelta: "+3 tháng này",
  totalUsers: 1284,
  pendingModeration: 7,
  securityAlerts: 0,
};
