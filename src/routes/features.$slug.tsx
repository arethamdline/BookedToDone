import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CornerDownRight } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { FeatureDemo } from "@/components/site/feature-demo";
import { features, getFeature, getPartner, mailtoFor, type Feature } from "@/data/site-content";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";

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
  const partner = getPartner(feature);

  const index = features.findIndex((f) => f.slug === feature.slug);
  const previous = features[(index - 1 + features.length) % features.length]!;
  const next = features[(index + 1) % features.length]!;

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

            <div className="mt-7 inline-flex items-baseline gap-3 rounded-xl bg-bd-paper px-5 py-4">
              <span className="font-display text-2xl font-extrabold tabular-nums text-bd-navy">
                {feature.proof.value}
              </span>
              <span className="text-sm text-muted-foreground">{feature.proof.label}</span>
            </div>

            <div className="mt-7">
              <a
                href={mailtoFor(`Add ${feature.title} to my business`, prospect)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-bd-blue px-5 text-[15px] font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                Add this to my business <ArrowRight className="size-4" />
              </a>
            </div>
          </div>

          {/* Right: the thing itself */}
          <div>
            <FeatureDemo slug={feature.slug} frame={feature.frame} />
          </div>
        </div>

        {/* Where it goes next — the point of the whole site */}
        {partner && (
          <section className="mt-12 overflow-hidden rounded-2xl border border-bd-blue/25 bg-bd-blue-soft/50">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-bd-blue">
                  <CornerDownRight className="size-3.5" /> Where it goes next
                </p>
                <h2 className="mt-2.5 font-display text-xl font-bold text-bd-navy sm:text-2xl">
                  {feature.next.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {feature.next.line}
                </p>
              </div>
              <Link
                to="/features/$slug"
                params={{ slug: partner.slug }}
                search={search}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-bd-navy/15 bg-white px-5 text-[15px] font-bold text-bd-navy transition-colors hover:border-bd-blue"
              >
                {partner.title} <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Prev / next */}
        <nav className="mt-10 flex items-center justify-between gap-3 border-t border-bd-navy/10 pt-6">
          <Link
            to="/features/$slug"
            params={{ slug: previous.slug }}
            search={search}
            className="group flex min-h-11 max-w-[45%] items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-bd-navy"
          >
            <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="truncate">{previous.title}</span>
          </Link>
          <Link
            to="/features/$slug"
            params={{ slug: next.slug }}
            search={search}
            className="group flex min-h-11 max-w-[45%] items-center gap-2 text-right text-sm font-semibold text-muted-foreground transition-colors hover:text-bd-navy"
          >
            <span className="truncate">{next.title}</span>
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
