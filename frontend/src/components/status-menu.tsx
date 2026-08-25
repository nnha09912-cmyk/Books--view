"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { albumStatusBadge, albumStatusLabel } from "@/lib/mock-data";

const EDITABLE_STATUSES = ["active", "closed", "completed"] as const;

/** Clickable status badge — lets the studio switch an album between
 * Đang mở / Đóng / Hoàn thành directly, from the albums list or inside
 * the album. Wrapped in a stopPropagation div so it also works safely
 * nested inside a Link (album-card). */
export function StatusMenu({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: string) => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{ display: "inline-flex" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" style={{ cursor: "pointer", background: "none", border: "none", padding: 0 }}>
            <Badge variant={albumStatusBadge[status] ?? "secondary"}>
              {albumStatusLabel[status] ?? status}
            </Badge>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {EDITABLE_STATUSES.map((s) => (
            <DropdownMenuItem key={s} onSelect={() => onChange(s)}>
              {albumStatusLabel[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
