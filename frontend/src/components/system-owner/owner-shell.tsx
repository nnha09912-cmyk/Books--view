import { AppHeader } from "@/components/layout/app-header";
import { OwnerSidebar } from "@/components/system-owner/owner-sidebar";

/** Layout shell for the System Owner area — same structure as the real
 * `AdminShell` (reused `AppHeader` + a sidebar + main content), but with
 * `OwnerSidebar` instead of the Studio-facing `Sidebar`. `AdminShell`
 * itself is left untouched. */
export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader studioName="System Owner" brandHref="/system-owner" />
      <div className="shell">
        <OwnerSidebar />
        <main className="main">{children}</main>
      </div>
    </>
  );
}
