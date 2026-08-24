"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Images, Filter, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/albums", label: "Albums", icon: Images },
  { href: "/filter", label: "Filter", icon: Filter },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar() {
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
            href === "/albums"
              ? pathname.startsWith("/albums")
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
