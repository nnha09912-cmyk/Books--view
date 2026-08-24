"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";

export default function AlbumConfirmPage({
  params,
}: {
  params: { linkId: string };
}) {
  const searchParams = useSearchParams();
  const liked = Number(searchParams.get("liked") ?? 0);
  const starred = Number(searchParams.get("starred") ?? 0);

  return (
    <>
      <AppHeader studioName="Books View" brandHref={`/album/${params.linkId}`} />
      <div className="confirm-shell">
        <div className="confirm-icon">
          <Check size={32} />
        </div>
        <h1 style={{ fontSize: 26 }}>Cảm ơn anh chị!</h1>
        <p className="text-secondary" style={{ marginTop: 8 }}>
          Lựa chọn của anh chị đã được gửi đến Books View. Chúng tôi sẽ
          liên hệ trong 3–5 ngày làm việc.
        </p>

        <div className="confirm-stats">
          <div className="confirm-stat">
            <div className="num" style={{ color: "var(--like)" }}>
              {liked}
            </div>
            <span className="text-sm">ảnh ♥ thích</span>
          </div>
          <div className="confirm-stat">
            <div className="num" style={{ color: "var(--star)" }}>
              {starred}
            </div>
            <span className="text-sm">ảnh ⭐ sao</span>
          </div>
        </div>

        <div className="flex gap-sm" style={{ justifyContent: "center" }}>
          <Button asChild variant="secondary">
            <Link href={`/album/${params.linkId}/gallery`}>
              ← Quay lại Gallery
            </Link>
          </Button>
          <Button onClick={() => toast("Demo — chưa nối gửi email")}>
            Gửi tôi link album
          </Button>
        </div>

        <p className="text-sm" style={{ marginTop: 40 }}>
          Có thắc mắc? Liên hệ Books View — 0909 123 456 ·
          hi@booksview.vn
        </p>
      </div>
    </>
  );
}
