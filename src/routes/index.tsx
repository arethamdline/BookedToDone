import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";

import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { FlowHero } from "@/components/site/flow-hero";
import { TwoSidesMap } from "@/components/site/two-sides-map";
import { DemoVideo } from "@/components/site/demo-video";
import { bookingHrefFor, entryPaths, getFeature, howWeWork, problems } from "@/data/site-content";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";

export const Route = createFileRoute("/")({
  validateSearch: validateProspectSearch,
  head: () => ({
    meta: [
      { title: "Booked to Done — AI booking and operations for service businesses" },
      {
        name: "description",
        content:
          "Do less work, book more jobs. Custom AI booking and operations systems for owner-run service businesses.",
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
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-display text-[2.2rem] font-extrabold leading-[1.08] tracking-tight text-bd-navy sm:text-[2.9rem] lg:text-[3.4rem]">
              {prospect ? `${prospect}, do less work. ` : "Do less work. "}
              <span className="text-bd-blue">Book more jobs.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-bd-body sm:text-base">
              The AI answers every call and books the job — even at 9 pm. It arrives in your office
              already filled in, so nobody types it up twice. Built around how your business already
              runs.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href={bookingHrefFor("30-min call — Booked to Done", prospect)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-bd-blue px-6 text-[15px] font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                Book a meeting <ArrowRight className="size-4 shrink-0" />
              </a>
              <Link
                to="/demo"
                search={search}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-bd-navy/15 px-6 text-[15px] font-semibold text-bd-navy transition-colors hover:bg-bd-paper"
              >
                See the demo
              </Link>
            </div>

            <p className="mx-auto mt-4 max-w-xl text-sm text-bd-body">
              Pick a time that suits you. We'll learn exactly what your problem is, then suggest
              what would fix it.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- 2. Diagram */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The connected flow</SectionLabel>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
              Your customer fills in your office for you.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-bd-body">
              Everything a customer tells you — the photos, the address, the items, the time they
              picked, the deposit — travels straight onto the job card your crew works from. Nobody
              in your office retypes any of it, and nothing gets lost between a phone call and a
              whiteboard.
            </p>
          </div>
          <div className="mt-10">
            <FlowHero />
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="border-t-2 border-bd-blue pt-3">
              <p className="font-display text-sm font-bold text-bd-navy">What the customer does</p>
              <p className="mt-1 text-sm leading-relaxed text-bd-body">
                Sends a photo, gets a price, picks a time and pays a deposit — on their phone, at
                whatever hour suits them.
              </p>
            </div>
            <div className="border-t-2 border-bd-green pt-3">
              <p className="font-display text-sm font-bold text-bd-navy">What you get</p>
              <p className="mt-1 text-sm leading-relaxed text-bd-body">
                A job card that filled itself in — tagged
                <span className="mx-1 rounded-sm bg-bd-done-tint px-1 text-[10px] font-bold uppercase text-bd-green">
                  auto
                </span>
                wherever the customer supplied it, ready to drop onto a truck.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ 3. Problems */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="font-display text-xl font-bold text-bd-navy sm:text-2xl">
            Your issues, and what fixes them.
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tap the one that costs you most — it opens the piece that fixes it.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((problem) => {
              const fix = getFeature(problem.slug);
              return (
                <li key={problem.slug}>
                  <Link
                    to="/features/$slug"
                    params={{ slug: problem.slug }}
                    search={search}
                    className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-bd-line bg-white p-4 transition-all hover:border-bd-blue hover:shadow-lg hover:shadow-bd-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-blue focus-visible:ring-offset-2"
                  >
                    {/* red is reserved for exactly this: marking the problem */}
                    <span className="flex items-start gap-2">
                      <X className="mt-0.5 size-4 shrink-0 text-bd-problem" strokeWidth={3} />
                      <span className="text-[15px] font-semibold leading-snug text-bd-navy">
                        {problem.label}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 border-t border-bd-line pt-3 text-sm font-bold text-bd-blue">
                      <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      <span className="truncate">{fix?.title}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- 4. Features */}
      <section id="system" className="scroll-mt-16 border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>What we build</SectionLabel>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
              Twelve pieces, working in six pairs.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-bd-body">
              Every customer-facing feature has a matching one in your office. What your customer
              does is what lands on your side — which is why nothing needs typing up twice. Open any
              piece to see it run.
            </p>
          </div>

          <div className="mt-9">
            <TwoSidesMap />
          </div>
        </div>
      </section>

      {/* --------------------------------------------- 5. Start where it hurts */}
      <section className="border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>Start where it hurts</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-bd-blue sm:text-4xl">
            You only pay for what you need.
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Start with one feature, connect the tools you have, or build the full system around your
            work.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {entryPaths.map((path, index) => {
              const recommended = index === 2;
              // Every one of these books a meeting. "Talk about this" used to be a
              // mailto, which on most machines did nothing at all.
              const href = bookingHrefFor(`${path.title} — Booked to Done`, prospect);

              return (
                <div
                  key={path.title}
                  className={`relative flex flex-col rounded-xl border p-5 ${
                    recommended
                      ? "border-bd-blue bg-bd-navy text-white shadow-xl shadow-bd-navy/20 ring-2 ring-bd-blue"
                      : "border-bd-navy/10 bg-white"
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-wide ${recommended ? "text-white/70" : "text-bd-blue"}`}
                  >
                    {path.detail}
                  </p>
                  <h3
                    className={`mt-2 font-display text-lg font-bold ${recommended ? "text-white" : "text-bd-navy"}`}
                  >
                    {path.title}
                  </h3>
                  <p
                    className={`mt-2 flex-1 text-sm leading-relaxed ${recommended ? "text-white/75" : "text-muted-foreground"}`}
                  >
                    {path.body}
                  </p>
                  <a
                    href={href}
                    className={`mt-5 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-colors ${
                      recommended
                        ? "bg-white text-bd-navy hover:bg-white/90"
                        : "border border-bd-blue/30 text-bd-blue hover:bg-bd-blue-soft"
                    }`}
                  >
                    {recommended ? "Book a meeting" : "Talk about this"}
                    <ArrowRight className="size-3.5" />
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            We connect your calendar, your website and your payment processor — whichever ones you
            already pay for.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- 6. Demo */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionLabel>Watch it run</SectionLabel>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
              One job, start to finish, in 64 seconds.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              A photo becomes a quote. A deposit holds the slot. The crew adds an item and the
              customer approves the update on their phone. The remaining balance is paid before the
              truck leaves — and the week's numbers update on their own.
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

      {/* ------------------------------------------------- 6. How we work */}
      <section className="border-b border-bd-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>How we work</SectionLabel>
          <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-bd-navy sm:text-3xl">
            Four steps, built around your work.
          </h2>

          <ol className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {howWeWork.map((item) => (
              <li key={item.step} className="border-t-2 border-bd-blue pt-4">
                <p className="font-display text-xs font-extrabold text-bd-blue">{item.step}</p>
                <h3 className="mt-1.5 font-display text-lg font-bold text-bd-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- 7. About */}
      <section className="border-b border-bd-navy/10 bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>Who you're talking to</SectionLabel>
          {/* TODO: replace initials avatars with founder photos when approved images are available in /public. */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { name: "Jerry Huang", initials: "JH" },
              { name: "Aretha Madeline Budiman", initials: "AB" },
            ].map((founder) => (
              <div
                key={founder.name}
                className="flex items-center gap-4 rounded-xl border border-bd-navy/10 bg-white p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid size-16 shrink-0 place-items-center rounded-full bg-bd-navy font-display text-xl font-extrabold text-white"
                >
                  {founder.initials}
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-bd-navy">{founder.name}</p>
                  <p className="text-sm font-semibold text-bd-blue">Co-founder</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- 8. Final CTA */}
      {/*
        Sits on pale ground as a contained card. It used to be a full-bleed dark
        section directly above the dark footer, so the two read as one slab.
      */}
      <section className="bg-bd-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-3xl bg-bd-navy px-6 py-12 text-center sm:px-10 sm:py-14">
            <h2 className="mx-auto max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {prospect
                ? `${prospect}, see both ends of the job connected.`
                : "See both ends of the job connected."}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              See a customer-facing site where a job starts and a staff-facing system where it
              lands. Both ends stay connected.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={bookingHrefFor("30-min call — Booked to Done", prospect)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-6 text-[15px] font-bold text-bd-navy transition-colors hover:bg-white/90 sm:w-auto"
              >
                Book a meeting <ArrowRight className="size-4" />
              </a>
              <Link
                to="/demo"
                search={search}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Play with the demo first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
