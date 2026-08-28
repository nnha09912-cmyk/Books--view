"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export interface CurrentStudio {
  id: string;
  name: string | null;
  ownerName: string | null;
  email: string;
  slug: string;
  phone: string | null;
  description: string | null;
  logoUrl: string | null;
  role: string;
}

/** Mirrors useSystemOwner()'s redirect the other way: an ADMIN-role
 * account is a System Owner account, never a regular Studio, so it must
 * never land in the Studio dashboard/albums/settings UI — keeps the two
 * roles from mixing in the same session. */
export function useStudio() {
  const router = useRouter();
  const [studio, setStudio] = useState<CurrentStudio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ studio: CurrentStudio }>("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res.studio.role === "ADMIN") {
          router.replace("/system-owner");
          return;
        }
        setStudio(res.studio);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { studio, loading };
}
