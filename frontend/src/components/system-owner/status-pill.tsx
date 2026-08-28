import { cn } from "@/lib/utils";

/** Small status pill for the System Owner area only. The shared `<Badge>`
 * component doesn't have "warning"/"danger" tones (only primary/secondary/
 * accent/success/like), and this file intentionally never edits shared
 * components — so this stays local rather than extending Badge. Uses the
 * same design tokens (bg-success, bg-warning, bg-destructive, bg-accent)
 * so it still looks native to Books View. */
export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "accent";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone === "success" && "bg-success text-success-foreground",
        tone === "warning" && "bg-warning text-warning-foreground",
        tone === "danger" && "bg-destructive text-destructive-foreground",
        tone === "accent" && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </span>
  );
}
