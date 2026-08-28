"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export interface CurrentOwner {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Same pattern as useStudio() — client-side redirect for UX only. The
 * real security boundary is server-side: every /api/admin/* route
 * re-checks role from the database itself, so this hook redirecting late
 * (or not at all, if JS is disabled) never exposes real admin data —
 * those requests would still get rejected. */
export function useSystemOwner() {
  const router = useRouter();
  const [owner, setOwner] = useState<CurrentOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ studio: CurrentOwner }>("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res.studio.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }
        setOwner(res.studio);
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

  return { owner, loading };
}
