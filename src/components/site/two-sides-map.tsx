import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { customerFeatures, staffFeatures, getFeature, type Feature } from "@/data/site-content";
import { prospectSearch, useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * "One system, two sides". Hovering a tile draws the line to its partner on the
 * other side, so the connection is something you see rather than something we
 * claim. On small screens the two sides become tabs and the line is dropped.
 */
export function TwoSidesMap() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLElement>());
  const [active, setActive] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [mobileSide, setMobileSide] = useState<"customer" | "staff">("customer");

  const registerTile = useCallback((slug: string, node: HTMLElement | null) => {
    if (node) tileRefs.current.set(slug, node);
    else tileRefs.current.delete(slug);
  }, []);

  const drawLine = useCallback(() => {
    const container = containerRef.current;
    const feature = active ? getFeature(active) : undefined;
    if (!container || !feature) {
      setPath(null);
      return;
    }
    const from = tileRefs.current.get(feature.slug);
    const to = tileRefs.current.get(feature.partner);
    if (!from || !to) {
      setPath(null);
      return;
    }

    const base = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();

    // Leave from the inner edge of each tile, so the line reads as a wire
    // between the two columns rather than a slash across them.
    const fromCustomer = feature.side === "customer";
    const x1 = (fromCustomer ? a.right : a.left) - base.left;
    const y1 = a.top + a.height / 2 - base.top;
    const x2 = (fromCustomer ? b.left : b.right) - base.left;
    const y2 = b.top + b.height / 2 - base.top;
    const mid = (x1 + x2) / 2;

    setPath(`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
  }, [active]);

  useLayoutEffect(drawLine, [drawLine]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", drawLine);
    window.addEventListener("scroll", drawLine, { passive: true });
    return () => {
      window.removeEventListener("resize", drawLine);
      window.removeEventListener("scroll", drawLine);
    };
  }, [active, drawLine]);

  const partnerSlug = active ? getFeature(active)?.partner : undefined;

  const tile = (feature: Feature, showOnMobile: boolean) => {
    const isActive = active === feature.slug;
    const isPartner = partnerSlug === feature.slug;
    const dimmed = active !== null && !isActive && !isPartner;

    return (
      <Link
        key={feature.slug}
        to="/features/$slug"
        params={{ slug: feature.slug }}
        search={search}
        ref={(node: HTMLAnchorElement | null) => registerTile(feature.slug, node)}
        onMouseEnter={() => setActive(feature.slug)}
        onMouseLeave={() => setActive(null)}
        onFocus={() => setActive(feature.slug)}
        onBlur={() => setActive(null)}
        className={cn(
          "group relative block rounded-xl border bg-white p-3.5 transition-all duration-200",
          "hover:border-bd-blue hover:shadow-lg hover:shadow-bd-navy/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-blue focus-visible:ring-offset-2",
          isActive && "border-bd-blue shadow-lg shadow-bd-navy/5",
          isPartner && "border-bd-green ring-1 ring-bd-green/40",
          dimmed && "opacity-45",
          !showOnMobile && "hidden lg:block",
        )}
      >
        <p className="font-display text-sm font-bold text-bd-navy">{feature.title}</p>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{feature.tagline}</p>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-bd-blue transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          See it work <ArrowRight className="size-3" />
        </span>
        {isPartner && (
          <span className="absolute -top-2 right-3 rounded-full bg-bd-green px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            lands here
          </span>
        )}
      </Link>
    );
  };

  return (
    <div>
      {/* Mobile side switch */}
      <div
        className="mx-auto mb-5 flex w-full max-w-xs rounded-lg border bg-muted p-1 lg:hidden"
        role="tablist"
        aria-label="System side"
      >
        {(["customer", "staff"] as const).map((side) => (
          <button
            key={side}
            type="button"
            role="tab"
            aria-selected={mobileSide === side}
            onClick={() => setMobileSide(side)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-semibold capitalize transition-colors",
              mobileSide === side
                ? "bg-bd-navy text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {side} side
          </button>
        ))}
      </div>

      <div ref={containerRef} className="relative">
        <svg
          className="pointer-events-none absolute inset-0 z-10 hidden size-full lg:block"
          aria-hidden="true"
        >
          {path && (
            <>
              {/* the wire */}
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-bd-blue/30"
                strokeLinecap="round"
              />
              {/* what's moving along it */}
              <path
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="bd-dash text-bd-blue"
                strokeLinecap="round"
              />
              <circle r="4.5" fill="currentColor" className="text-bd-green">
                <animateMotion dur="1.1s" repeatCount="indefinite" path={path} />
              </circle>
            </>
          )}
        </svg>

        <div className="grid gap-y-3 lg:grid-cols-2 lg:gap-x-44">
          <div className={cn("space-y-3", mobileSide === "staff" && "hidden lg:block")}>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-bd-blue">
              Customer side
            </p>
            {customerFeatures.map((f) => tile(f, mobileSide === "customer"))}
          </div>

          <div className={cn("space-y-3", mobileSide === "customer" && "hidden lg:block")}>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-bd-navy">
              Staff side
            </p>
            {staffFeatures.map((f) => tile(f, mobileSide === "staff"))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground lg:hidden">
        Each tile on one side feeds a tile on the other. Open any one to see where it goes.
      </p>
    </div>
  );
}
