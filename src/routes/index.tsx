import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { FlowHero } from "@/components/site/flow-hero";
import { TwoSidesMap } from "@/components/site/two-sides-map";
import { DemoVideo } from "@/components/site/demo-video";
import { entryPaths, howWeWork, mailtoFor, problems } from "@/data/site-content";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";

export const Route = createFileRoute("/")({
  validateSearch: validateProspectSearch,
  head: () => ({
    meta: [
      { title: "Booked to Done — AI booking and operations for service businesses" },
      {
        name: "description",
        content:
          "Your customers book. Your crew gets it done. Nothing typed twice. Custom AI booking and operations systems for owner-run service businesses.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Booked to Done" },
      {
        property: "og:description",
        content: "AI that answers, books and runs your jobs.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-bd-blue">{children}</p>
  );
}

function LandingPage() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <div className="bg-white">
      <SiteHeader />

      {/* ------------------------------------------------ 1. Company first */}
      <section className="border-b border-bd-navy/10 bg-gradient-to-b from-bd-paper to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
            <div>
              <SectionLabel>
                {prospect ? `Built for ${prospect}` : "AI booking + operations"}
              </SectionLabel>
              <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-bd-navy sm:text-[2.5rem] lg:text-[2.9rem]">
                Your customers book.
                <br />
                Your crew gets it done.
                <br />
                <span className="text-bd-blue">Nothing typed twice.</span>
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                We build custom AI booking and operations systems for owner-run service businesses.
                The customer side fills the office side on its own — no re-keying, no lost jobs, no
                9 pm phone calls you never got.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={mailtoFor("15-min call — Booked to Done", prospect)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-bd-blue px-5 text-[15px] font-bold text-white transition-colors hover:bg-bd-blue-ink"
                >
                  Book a 15-min call <ArrowRight className="size-4" />
                </a>
                <Link
                  to="/demo"
                  search={search}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-bd-navy/15 px-5 text-[15px] font-semibold text-bd-navy transition-colors hover:bg-bd-paper"
                >
                  See it all connected
                </Link>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                Live in 7 days · 30-day pilot · setup refunded if it doesn't book the jobs
              </p>
            </div>

            <FlowHero />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ 2. Problems */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="font-display text-xl font-bold text-bd-navy sm:text-2xl">
            You already know where the money leaks out.
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tap the one that costs you most — it opens the piece that fixes it.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {problems.map((problem) => (
              <li key={problem.slug}>
                <Link
                  to="/features/$slug"
                  params={{ slug: problem.slug }}
                  search={search}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-bd-navy/15 bg-white px-4 text-sm font-semibold text-bd-navy transition-all hover:border-bd-blue hover:bg-bd-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-blue focus-visible:ring-offset-2"
                >
                  {problem.label}
                  <ArrowRight className="size-3.5 text-bd-blue transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------- 3. One system, two sides */}
      <section id="system" className="scroll-mt-16 border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>One system, two sides</SectionLabel>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
              Twelve pieces. One set of data.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground">
              What your customer does on the left lands on the right by itself. Hover any tile to
              see which half of your day it feeds.
            </p>
          </div>

          <div className="mt-9">
            <TwoSidesMap />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- 4. Watch it run */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionLabel>Watch it run</SectionLabel>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
              One job, start to finish, in 64 seconds.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              A photo becomes a $289–349 quote. A $50 deposit holds the slot. The crew finds a
              mattress and the customer approves $309 → $374 on their phone. The $324 balance is
              tapped before the truck leaves — and the week's numbers update on their own.
            </p>
            <Link
              to="/demo"
              search={search}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-bd-navy px-5 text-[15px] font-bold text-white transition-colors hover:bg-bd-navy-soft"
            >
              Try it yourself <ArrowRight className="size-4" />
            </Link>
          </div>
          <DemoVideo />
        </div>
      </section>

      {/* --------------------------------------------- 5. Start where it hurts */}
      <section className="border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>Start where it hurts</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
            You don't have to replace everything to stop the bleeding.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {entryPaths.map((path, index) => (
              <div
                key={path.title}
                className={`flex flex-col rounded-xl border p-5 ${
                  index === 2
                    ? "border-bd-blue bg-white shadow-lg shadow-bd-navy/5"
                    : "border-bd-navy/10 bg-white"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-bd-blue">
                  {path.detail}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-bd-navy">{path.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.body}
                </p>
                <a
                  href={mailtoFor(`${path.title} — Booked to Done`, prospect)}
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-bd-blue hover:underline"
                >
                  Talk about this <ArrowRight className="size-3.5" />
                </a>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            We connect your calendar, your website and your payment processor — whichever ones you
            already pay for.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- 6. How we work */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
            Three steps, no agency theatre.
          </h2>

          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {howWeWork.map((item) => (
              <li key={item.step} className="border-t-2 border-bd-blue pt-4">
                <p className="font-display text-xs font-extrabold text-bd-blue">{item.step}</p>
                <h3 className="mt-1.5 font-display text-lg font-bold text-bd-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-bd-paper px-5 py-4">
            {[
              "About $500 setup, credited",
              "$249–399 per month",
              "Refunded if the pilot misses",
            ].map((line) => (
              <span
                key={line}
                className="inline-flex items-center gap-2 text-sm font-semibold text-bd-navy"
              >
                <Check className="size-4 text-bd-green" />
                {line}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- 7. About */}
      <section className="border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>Who you're talking to</SectionLabel>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* TODO: swap for Jerry's photo when it lands in /public */}
            <span
              aria-hidden="true"
              className="grid size-20 shrink-0 place-items-center rounded-full bg-bd-navy font-display text-2xl font-extrabold text-white"
            >
              JH
            </span>
            <div>
              <p className="font-display text-xl font-bold text-bd-navy">Jerry Huang</p>
              <p className="text-sm font-semibold text-bd-blue">Co-founder</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                You talk. We listen. We build it around you. Every system we ship starts with a
                conversation about how your business actually runs — not a template we're trying to
                sell you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- 8. Final CTA */}
      <section className="bg-bd-navy">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {prospect
              ? `${prospect}, let's see what this looks like with your prices in it.`
              : "Let's see what this looks like with your prices in it."}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">
            Fifteen minutes on the phone. If it's not a fit, we'll say so.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={mailtoFor("15-min call — Booked to Done", prospect)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-bd-blue px-6 text-[15px] font-bold text-white transition-colors hover:bg-bd-blue-ink sm:w-auto"
            >
              Book a 15-min call <ArrowRight className="size-4" />
            </a>
            <Link
              to="/demo"
              search={search}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/20 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Play with the demo first
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
