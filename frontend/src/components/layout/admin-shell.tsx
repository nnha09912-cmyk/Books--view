import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader showNotifications showAvatar />
      <div className="shell">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
    </>
  );
}
