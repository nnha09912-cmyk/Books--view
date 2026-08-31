"use client";

import { useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { WEBSITE_TEMPLATE_COMPONENTS } from "@/components/website-templates";
import { isWebsiteTemplateId, DEFAULT_WEBSITE_TEMPLATE } from "@/lib/website-templates";
import type { PublicWebsiteInfo } from "@/lib/types";

/** Studio Website public route (Website Templates_FINAL.md) — separate
 * product from Album Proofing (/album/[linkId]). Next.js resolves every
 * existing static route (/dashboard, /login, /api/*, ...) before ever
 * considering this catch-all dynamic segment, and signup additionally
 * refuses to hand out a slug matching one of them (lib/reserved-slugs.ts),
 * so a Studio's site can never shadow a real app page.
 *
 * `?previewTemplate=` (Settings' "Xem trước" button on each template card)
 * renders a different template using this same real data without ever
 * saving anything — see the API route's own comment. */
export default function StudioWebsitePage({
  params,
}: {
  params: { studioSlug: string };
}) {
  const previewTemplate = useSearchParams().get("previewTemplate");
  const [data, setData] = useState<PublicWebsiteInfo | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const query = previewTemplate ? `?previewTemplate=${encodeURIComponent(previewTemplate)}` : "";
    api<PublicWebsiteInfo>(`/api/public/website/${params.studioSlug}${query}`)
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFoundState(true);
      });
  }, [params.studioSlug, previewTemplate]);

  if (notFoundState) notFound();
  if (!data) return null;

  const templateId = isWebsiteTemplateId(data.templateId) ? data.templateId : DEFAULT_WEBSITE_TEMPLATE;
  const Template = WEBSITE_TEMPLATE_COMPONENTS[templateId];

  return (
    <Template
      studio={data.studio}
      sections={data.sections}
      albums={data.albums}
      featuredPhotos={data.featuredPhotos}
      pricingPlans={data.pricingPlans}
    />
  );
}
