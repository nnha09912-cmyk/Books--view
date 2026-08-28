import type { AlbumTemplateId } from "@/lib/album-templates";
import type { AlbumHeroProps } from "./types";
import { ClassicHero } from "./Classic";
import { RomanticHero } from "./Romantic";
import { ModernHero } from "./Modern";
import { LuxuryHero } from "./Luxury";
import { MinimalHero } from "./Minimal";
import { VintageHero } from "./Vintage";
import { NatureHero } from "./Nature";
import { BeachHero } from "./Beach";
import { EditorialHero } from "./Editorial";
import { KoreanHero } from "./Korean";
import { KyYeuHero } from "./KyYeu";

export type { AlbumHeroProps } from "./types";

export const ALBUM_HERO_COMPONENTS: Record<
  AlbumTemplateId,
  (props: AlbumHeroProps) => React.JSX.Element
> = {
  classic: ClassicHero,
  romantic: RomanticHero,
  modern: ModernHero,
  luxury: LuxuryHero,
  minimal: MinimalHero,
  vintage: VintageHero,
  nature: NatureHero,
  beach: BeachHero,
  editorial: EditorialHero,
  korean: KoreanHero,
  kyyeu: KyYeuHero,
};
