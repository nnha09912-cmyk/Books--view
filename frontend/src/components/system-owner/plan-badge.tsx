import { StatusPill } from "@/components/system-owner/status-pill";
import { PLAN_LABELS, type Plan } from "@/lib/entitlements";

const TONE: Record<Plan, "success" | "warning" | "danger" | "accent" | null> = {
  // FREE renders plain (no pill) — StatusPill only has 4 tones, none of
  // them neutral, and "the default/no-plan-yet" tier reading as a colored
  // badge next to three paid tiers would visually overstate it.
  FREE: null,
  PRO: "accent",
  VIP: "warning",
  CLOUD: "success",
};

export function PlanBadge({ plan }: { plan: Plan }) {
  const tone = TONE[plan];
  if (!tone) {
    return <span className="text-sm text-muted-foreground">{PLAN_LABELS[plan]}</span>;
  }
  return <StatusPill tone={tone}>{PLAN_LABELS[plan]}</StatusPill>;
}
