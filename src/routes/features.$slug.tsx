import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { FeatureDemo } from "@/components/site/feature-demo";
import {
  bookingHrefFor,
  customerFeatures,
  getFeature,
  staffFeatures,
  type Feature,
} from "@/data/site-content";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/features/$slug")({
  validateSearch: validateProspectSearch,
  loader: ({ params }): { feature: Feature } => {
    const feature = getFeature(params.slug);
    if (!feature) throw notFound();
    return { feature };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.feature.title} — Booked to Done` : "Booked to Done",
      },
      { name: "description", content: loaderData?.feature.problem ?? "" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FeaturePage,
});

function FeaturePage() {
  const { feature } = Route.useLoaderData();
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <div className="bg-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          search={search}
          hash="system"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-bd-navy"
        >
          <ArrowLeft className="size-4" /> Back to the map
        </Link>

        <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          {/* Left: what it is */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-bd-blue">
              {feature.side === "customer" ? "Customer side" : "Staff side"}
            </p>
            <h1 className="mt-2.5 font-display text-[1.8rem] font-extrabold leading-tight tracking-tight text-bd-navy sm:text-[2.2rem]">
              {feature.title}
            </h1>

            <p className="mt-4 border-l-2 border-bd-blue pl-4 text-[15px] italic leading-relaxed text-bd-navy">
              {feature.problem}
            </p>

            <ul className="mt-6 space-y-3">
              {feature.does.map((line: string) => (
                <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-bd-green" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-baseline gap-2.5 border-t border-bd-line pt-5">
              <span className="font-display text-3xl font-extrabold tabular-nums text-bd-blue">
                {feature.proof.value}
              </span>
              <span className="text-sm font-medium text-bd-body">{feature.proof.label}</span>
            </div>

            {/* Same shape as the wrap-up at the end of the guided demo: the
                button says what pressing it does, the line under it says what
                the meeting is for. */}
            <div className="mt-7">
              <a
                href={bookingHrefFor(
                  `${feature.title} — how would this fit my business?`,
                  prospect,
                )}
                className="block max-w-xs rounded-xl bg-bd-blue px-5 py-3 text-center text-white transition-colors hover:bg-bd-blue-ink"
              >
                <span className="flex items-center justify-center gap-2 font-display text-[15px] font-bold">
                  Book a meeting <ArrowRight className="size-4" />
                </span>
                <span className="mt-0.5 block text-xs font-medium leading-snug text-white/75">
                  Learn how we'd add this to your operation
                </span>
              </a>
            </div>
          </div>

          {/* Right: the thing itself */}
          <div>
            <FeatureDemo slug={feature.slug} frame={feature.frame} />
          </div>
        </div>

        {/* Pick any other piece, rather than stepping one at a time */}
        <section className="mt-12 border-t border-bd-line pt-8">
          <h2 className="font-display text-lg font-bold text-bd-navy">See another piece</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {(
              [
                ["Customer side", customerFeatures],
                ["Staff side", staffFeatures],
              ] as const
            ).map(([label, list]) => (
              <div key={label}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-bd-body">
                  {label}
                </p>
                <ul className="mt-2 divide-y divide-bd-line border-t border-bd-line">
                  {list.map((f) => {
                    const here = f.slug === feature.slug;
                    return (
                      <li key={f.slug}>
                        <Link
                          to="/features/$slug"
                          params={{ slug: f.slug }}
                          search={search}
                          aria-current={here ? "page" : undefined}
                          className={cn(
                            "group flex min-h-12 items-center justify-between gap-3 border-l-2 py-1 pl-3 text-[15px] transition-colors",
                            // the green rule and weight say "you're on this one";
                            // dropping the arrow says it isn't a trip elsewhere
                            here
                              ? "border-bd-blue font-bold text-bd-blue"
                              : "border-transparent font-medium text-bd-navy hover:border-bd-line hover:text-bd-blue",
                          )}
                        >
                          <span className="truncate">{f.title}</span>
                          {!here && (
                            <ArrowRight className="size-4 shrink-0 text-bd-body transition-transform group-hover:translate-x-0.5 group-hover:text-bd-blue" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
