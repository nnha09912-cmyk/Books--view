import type { WebsiteTemplateId } from "@/lib/website-templates";
import type { WebsiteTemplateProps } from "./types";
import { MinimalElegantWebsite } from "./MinimalElegant";
import { DarkCinematicWebsite } from "./DarkCinematic";
import { LightNaturalWebsite } from "./LightNatural";
import { BWEditorialWebsite } from "./BWEditorial";
import { LuxuryElegantWebsite } from "./LuxuryElegant";
import { ModernCreativeWebsite } from "./ModernCreative";
import { RomanticPastelWebsite } from "./RomanticPastel";
import { VintageFilmWebsite } from "./VintageFilm";
import { MoodyDarkWebsite } from "./MoodyDark";
import { CleanMinimalWebsite } from "./CleanMinimal";
import { RusticWarmWebsite } from "./RusticWarm";
import { EditorialMagazineWebsite } from "./EditorialMagazine";
import { NatureGreenWebsite } from "./NatureGreen";
import { BoldModernWebsite } from "./BoldModern";
import { YearbookWebsite } from "./Yearbook";
import { EventWebsite } from "./Event";
import { ProductWebsite } from "./Product";

export type { WebsiteTemplateProps } from "./types";

/** Keep in sync with lib/website-templates.ts' BUILT_WEBSITE_TEMPLATES —
 * any id without a real component here still resolves (falls back to
 * MinimalElegantWebsite) rather than 404ing a Studio's site, but that flag
 * is what drives the "Sắp có" badge in the Settings picker. */
export const WEBSITE_TEMPLATE_COMPONENTS: Record<
  WebsiteTemplateId,
  (props: WebsiteTemplateProps) => React.JSX.Element
> = {
  "minimal-elegant": MinimalElegantWebsite,
  "dark-cinematic": DarkCinematicWebsite,
  "light-natural": LightNaturalWebsite,
  "bw-editorial": BWEditorialWebsite,
  "luxury-elegant": LuxuryElegantWebsite,
  "modern-creative": ModernCreativeWebsite,
  "romantic-pastel": RomanticPastelWebsite,
  "vintage-film": VintageFilmWebsite,
  "moody-dark": MoodyDarkWebsite,
  "clean-minimal": CleanMinimalWebsite,
  "rustic-warm": RusticWarmWebsite,
  "editorial-magazine": EditorialMagazineWebsite,
  "nature-green": NatureGreenWebsite,
  "bold-modern": BoldModernWebsite,
  yearbook: YearbookWebsite,
  event: EventWebsite,
  product: ProductWebsite,
};
