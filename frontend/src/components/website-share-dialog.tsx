"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShareLinkSection } from "@/components/share-album-dialog";

/** "Wed Studio" sidebar action — gets the Studio's own public website link
 * (guikhach.com/{slug}) to send a client for an early look, same QR/copy
 * pattern as ShareAlbumDialog. The link works even while the site is still
 * "draft" — see /api/public/website/[slug]'s own comment — since sending
 * it to preview is the whole point of this button. */
export function WebsiteShareDialog({
  slug,
  studioName,
  trigger,
}: {
  slug: string;
  studioName: string;
  trigger: React.ReactNode;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/${slug}`;
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
      </DialogContent>
    </Dialog>
  );
}
