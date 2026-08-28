"use client";

import Image from "next/image";
import { toast } from "sonner";
import { Share2, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function ShareLinkSection({
  title,
  badge,
  description,
  link,
  qrFilename,
}: {
  title: string;
  badge?: string;
  description: string;
  link: string;
  qrFilename: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  return (
    <div className="card mb-md">
      <div className="card-body lg">
        <div className="flex items-center gap-sm mb-sm">
          <h3 style={{ margin: 0 }}>{title}</h3>
          {badge && <Badge variant="accent">{badge}</Badge>}
        </div>
        <p className="text-secondary text-sm mb-md">{description}</p>
        <div className="flex gap-sm mb-md">
          <input className="input mono" style={{ fontSize: 12 }} readOnly value={link} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast("Đã copy link");
            }}
          >
            Sao chép
          </Button>
        </div>
        <div className="flex items-center gap-md">
          <Image
            src={qrUrl}
            alt="QR"
            width={96}
            height={96}
            unoptimized
            style={{ background: "var(--muted)", borderRadius: "var(--radius-sm)" }}
          />
          <a
            href={qrUrl}
            download={`${qrFilename}.png`}
            className="inline-flex items-center gap-sm text-sm"
            style={{ color: "var(--accent)", fontWeight: 600 }}
          >
            <ArrowDownToLine size={14} />
            {qrFilename}.PNG
          </a>
        </div>
      </div>
    </div>
  );
}

/** Shared "Chia sẻ album" dialog (2 link + QR each: Khách chọn ảnh / Chỉ xem
 * album) — used both as the labeled button on the album detail page and as
 * an icon-only trigger on album cards (Dashboard, Albums list). */
export function ShareAlbumDialog({
  albumName,
  linkToken,
  trigger,
}: {
  albumName: string;
  linkToken: string;
  /** Custom trigger element; defaults to the labeled "Chia sẻ" button. */
  trigger?: React.ReactNode;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  // Both link types must land on the Landing Page first — never straight
  // into Gallery. `intent=select` just tailors the Landing Page's own copy
  // and carries through to Gallery; it's not a permission flag (there's no
  // separate view-only/selection permission model on Album today).
  const selectLink = `${origin}/album/${linkToken}?intent=select`;
  const viewLink = `${origin}/album/${linkToken}`;
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary">
            <Share2 size={16} />
            Chia sẻ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chia sẻ album</DialogTitle>
        </DialogHeader>
        <ShareLinkSection
          title="Khách chọn ảnh"
          badge="ƯU TIÊN"
          description="Gửi link này cho khách để họ chọn những ảnh yêu thích."
          link={selectLink}
          qrFilename={albumName}
        />
        <ShareLinkSection
          title="Chỉ xem album"
          description="Gửi link này cho khách để xem album."
          link={viewLink}
          qrFilename={`${albumName}-xem`}
        />
      </DialogContent>
    </Dialog>
  );
}
