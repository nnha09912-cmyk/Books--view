import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { albumStatusBadge, albumStatusLabel, picsum } from "@/lib/mock-data";
import type { AlbumSummary } from "@/lib/types";

export function AlbumCard({ album }: { album: AlbumSummary }) {
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
          <Badge variant={albumStatusBadge[album.status] ?? "secondary"}>
            {albumStatusLabel[album.status] ?? album.status}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
