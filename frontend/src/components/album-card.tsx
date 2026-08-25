"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { StatusMenu } from "@/components/status-menu";
import { picsum } from "@/lib/mock-data";
import { api, ApiError } from "@/lib/api-client";
import type { AlbumSummary } from "@/lib/types";

export function AlbumCard({
  album,
  onStatusChange,
}: {
  album: AlbumSummary;
  onStatusChange?: (id: string, status: string) => void;
}) {
  async function handleStatusChange(status: string) {
    try {
      await api(`/api/albums/${album.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onStatusChange?.(album.id, status);
      toast("Đã đổi trạng thái");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể đổi trạng thái");
    }
  }

  return (
    <Link className="card interactive album-card" href={`/albums/${album.id}`}>
      <div className="thumb">
        <Image
          src={picsum(album.id, 480, 360)}
          alt=""
          width={480}
          height={360}
          unoptimized
        />
      </div>
      <div className="meta">
        <h3 style={{ fontSize: 15 }}>{album.name}</h3>
        <div className="row">
          <span className="text-sm">
            {album.photoCount} ảnh · {album.customerCount} khách
          </span>
          <StatusMenu status={album.status} onChange={handleStatusChange} />
        </div>
      </div>
    </Link>
  );
}
