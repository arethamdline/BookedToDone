import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";

import { customerFeatures, getFeature, type Feature } from "@/data/site-content";
import { prospectSearch, useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * The twelve features, shown as the six pairs they actually are.
 *
 * This used to be two loose columns joined by a line that only appeared on
 * hover — so the central claim ("each one feeds its partner") was invisible
 * unless you happened to mouse over a tile, and the gutter between the columns
 * was dead space. Now every pair is drawn on its own row with the hand-off in
 * the middle, so the relationship reads at a glance.
 */

function Tile({
  feature,
  side,
  search,
}: {
  feature: Feature;
  side: "customer" | "staff";
  search: ReturnType<typeof prospectSearch>;
}) {
  return (
    <Link
      to="/features/$slug"
      params={{ slug: feature.slug }}
      search={search}
      className={cn(
        "group/tile flex h-full flex-col justify-center rounded-xl border bg-white p-4 transition-all",
        "hover:shadow-lg hover:shadow-bd-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        side === "customer"
          ? "border-bd-navy/10 hover:border-bd-blue focus-visible:ring-bd-blue"
          : "border-bd-navy/10 hover:border-bd-green focus-visible:ring-bd-green",
      )}
    >
      <p className="font-display text-[15px] font-bold text-bd-navy">{feature.title}</p>
      <p className="mt-1 text-[13px] leading-snug text-bd-body">{feature.tagline}</p>
    </Link>
  );
}

export function TwoSidesMap() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  // Pair by the declared partner rather than by position, so the rows stay
  // correct if the lists are ever reordered.
  const pairs = customerFeatures
    .map((c) => ({ customer: c, staff: getFeature(c.partner) }))
    .filter((p): p is { customer: Feature; staff: Feature } => Boolean(p.staff));

  return (
    <div>
      {/* Column headers — only meaningful once the rows are side by side */}
      <div className="hidden items-end gap-4 lg:grid lg:grid-cols-[1fr_5rem_1fr]">
        <p className="text-[11px] font-bold uppercase tracking-wide text-bd-blue">
          Your customer does this
        </p>
        <span />
        <p className="text-[11px] font-bold uppercase tracking-wide text-bd-green">
          Your office gets this
        </p>
      </div>

      <ul className="mt-3 space-y-7 lg:space-y-3">
        {pairs.map(({ customer, staff }) => (
          <li
            key={customer.slug}
            className="group grid items-stretch gap-2 lg:grid-cols-[1fr_5rem_1fr] lg:gap-4"
          >
            <Tile feature={customer} side="customer" search={search} />

            {/* the hand-off, always visible */}
            <div aria-hidden="true" className="flex items-center justify-center gap-1 py-1 lg:py-0">
              <span className="hidden h-px flex-1 bg-bd-line lg:block" />
              <ArrowDown className="size-4 text-bd-blue/50 transition-colors group-hover:text-bd-blue lg:hidden" />
              <ArrowRight className="hidden size-4 shrink-0 text-bd-blue/50 transition-all group-hover:translate-x-0.5 group-hover:text-bd-blue lg:block" />
              <span className="hidden h-px flex-1 bg-bd-line lg:block" />
            </div>

            <Tile feature={staff} side="staff" search={search} />
          </li>
        ))}
      </ul>
    </div>
  );
}
