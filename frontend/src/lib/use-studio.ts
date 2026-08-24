"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";

export interface CurrentStudio {
  id: string;
  name: string;
  email: string;
  slug: string;
  phone: string | null;
  description: string | null;
}

export function useStudio() {
  const router = useRouter();
  const [studio, setStudio] = useState<CurrentStudio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ studio: CurrentStudio }>("/api/auth/me")
      .then((res) => {
        if (!cancelled) setStudio(res.studio);
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
