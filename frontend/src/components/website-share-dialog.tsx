"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShareLinkSection } from "@/components/share-album-dialog";

/** "Wed Studio" sidebar action — gets the Studio's own public website link
 * (guikhach.com/{slug}) to send a client for an early look, same QR/copy
 * pattern as ShareAlbumDialog. The link works even while the site is still
 * "draft" — see /api/public/website/[slug]'s own comment — since sending
 * it to preview is the whole point of this button. Also carries a
 * "Chỉnh sửa" shortcut straight into Settings' Website Studio tab, since
 * this button is otherwise the only sidebar-level entry point into that
 * whole module — without it, editing the site meant knowing to dig into
 * Cài đặt first. Controlled (open/onOpenChange) so clicking that shortcut
 * can close the dialog before navigating, instead of leaving it lingering
 * open over the Settings page underneath. */
export function WebsiteShareDialog({
  slug,
  studioName,
  trigger,
  open,
  onOpenChange,
}: {
  slug: string;
  studioName: string;
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/${slug}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Web Studio</DialogTitle>
        </DialogHeader>
        <ShareLinkSection
          title="Link Website Studio"
          description="Gửi link này cho khách để xem trước website của studio bạn."
          link={link}
          qrFilename={`${studioName}-website`}
        />
        <Button asChild variant="secondary" style={{ width: "100%" }} onClick={() => onOpenChange(false)}>
          <Link href="/settings?tab=website">
            <Pencil size={14} />
            Chỉnh sửa Website
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
