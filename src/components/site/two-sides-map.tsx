import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";

import { customerFeatures, getFeature, type Feature } from "@/data/site-content";
import { prospectSearch, useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * The twelve features, shown as the six pairs they actually are.
 *
 * Desktop lays each pair across a row with the hand-off between the two tiles.
 * On a phone that became twelve full-height cards and six arrows — far too
 * long a scroll — so there the pair collapses into a single card holding both
 * halves, which is both shorter and a clearer unit.
 */

function Half({
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
        "block rounded-lg p-3 transition-all hover:bg-bd-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "lg:flex lg:h-full lg:flex-col lg:justify-center lg:rounded-xl lg:border lg:border-bd-navy/10 lg:bg-white lg:p-4",
        "lg:hover:bg-white lg:hover:shadow-lg lg:hover:shadow-bd-navy/5",
        side === "customer"
          ? "focus-visible:ring-bd-blue lg:hover:border-bd-blue"
          : "focus-visible:ring-bd-green lg:hover:border-bd-green",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md",
            side === "customer" ? "bg-bd-blue-soft text-bd-blue" : "bg-bd-done-tint text-bd-green",
          )}
        >
          <feature.icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-bold text-bd-navy">{feature.title}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-bd-body">{feature.tagline}</p>
        </div>
      </div>
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
      {/* Column headers only mean anything once the pairs sit side by side */}
      <div className="hidden items-end gap-4 lg:grid lg:grid-cols-[1fr_4rem_1fr]">
        <p className="text-[11px] font-bold uppercase tracking-wide text-bd-blue">
          Your customer does this
        </p>
        <span />
        <p className="text-[11px] font-bold uppercase tracking-wide text-bd-green">
          Your office gets this
        </p>
      </div>

      <ul className="mt-3 space-y-3">
        {pairs.map(({ customer, staff }) => (
          <li
            key={customer.slug}
            className={cn(
              "group overflow-hidden rounded-xl border border-bd-navy/10 bg-white p-1",
              "lg:grid lg:grid-cols-[1fr_4rem_1fr] lg:items-stretch lg:gap-4",
              "lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0",
            )}
          >
            <Half feature={customer} side="customer" search={search} />

            {/* the hand-off: a divider on a phone, the gutter arrow on desktop */}
            <div aria-hidden="true" className="flex items-center justify-center gap-2 px-3 lg:px-0">
              <span className="h-px flex-1 bg-bd-line" />
              <ArrowDown className="size-4 shrink-0 text-bd-blue/60 lg:hidden" />
              <ArrowRight className="hidden size-4 shrink-0 text-bd-blue/50 transition-all group-hover:translate-x-0.5 group-hover:text-bd-blue lg:block" />
              <span className="h-px flex-1 bg-bd-line" />
            </div>

            <Half feature={staff} side="staff" search={search} />
          </li>
        ))}
      </ul>
    </div>
  );
}
