import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { pravatar } from "@/lib/mock-data";

interface AppHeaderProps {
  studioName?: string;
  showNotifications?: boolean;
  showAvatar?: boolean;
  brandHref?: string;
}

export function AppHeader({
  studioName = "Books View",
  showNotifications = false,
  showAvatar = false,
  brandHref = "/dashboard",
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="brand" href={brandHref}>
        <BrandMark />
        <span className="name">{studioName}</span>
      </Link>
      <div className="header-actions">
        <ThemeToggle />
        {showNotifications && (
          <button className="icon-btn" title="Thông báo" type="button">
            <Bell size={20} />
          </button>
        )}
        {showAvatar && (
          <Link href="/settings" title="Hồ sơ & cài đặt">
            <Image
              className="avatar"
              src={pravatar(12, 72)}
              alt=""
              width={36}
              height={36}
              unoptimized
            />
          </Link>
        )}
      </div>
    </header>
  );
}
