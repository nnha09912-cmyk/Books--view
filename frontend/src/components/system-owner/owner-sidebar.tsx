"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Images,
  History,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

const navItems = [
  { href: "/system-owner", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/system-owner/users", label: "Người dùng", icon: Users },
  { href: "/system-owner/moderation", label: "Kiểm duyệt", icon: ShieldAlert },
  { href: "/system-owner/albums", label: "Albums", icon: Images },
  { href: "/system-owner/audit", label: "Audit Log", icon: History },
  { href: "/system-owner/security", label: "Bảo mật", icon: ShieldCheck },
];

/** Sidebar for the System Owner area — a separate component from the real
 * `Sidebar` (Books View's Studio-facing one), not a variant of it, so
 * nothing here can affect the existing admin nav. */
export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <nav>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/system-owner"
              ? pathname === "/system-owner"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-item", active && "active")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="foot">
        <span
          className="nav-item text-secondary"
          style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, cursor: "default" }}
        >
          Platform
        </span>
        <span
          className="nav-item text-secondary"
          style={{ cursor: "not-allowed", opacity: 0.6 }}
          title="Chưa triển khai"
        >
          <Settings size={18} />
          Cài đặt hệ thống
        </span>
        <button
          type="button"
          className="nav-item"
          style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
