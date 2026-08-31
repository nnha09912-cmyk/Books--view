"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Images, Filter, Settings, LogOut, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useStudio } from "@/lib/use-studio";
import { WebsiteShareDialog } from "@/components/website-share-dialog";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/albums", label: "Albums", icon: Images },
  { href: "/filter", label: "Filter", icon: Filter },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { studio } = useStudio();
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);

  async function handleLogout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <nav>
        {navItems.slice(0, 3).map(({ href, label, icon: Icon }) => {
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
        {studio && (
          <WebsiteShareDialog
            slug={studio.slug}
            studioName={studio.name || studio.ownerName || "studio"}
            open={websiteDialogOpen}
            onOpenChange={setWebsiteDialogOpen}
            trigger={
              <button
                type="button"
                className="nav-item"
                style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}
                onClick={() => setWebsiteDialogOpen(true)}
              >
                <Globe size={18} />
                Wed Studio
              </button>
            }
          />
        )}
        {navItems.slice(3).map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
