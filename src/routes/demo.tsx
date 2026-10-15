import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick, Play } from "lucide-react";

import { DemoVideo } from "@/components/site/demo-video";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";

export const Route = createFileRoute("/demo")({
  validateSearch: validateProspectSearch,
  head: () => ({
    meta: [{ title: "See the demo — Booked to Done" }, { name: "robots", content: "noindex" }],
  }),
  component: DemoChooser,
});

/**
 * Two ways in, stated plainly.
 *
 * This page used to say "Start the demo" and drop you on a junk company's
 * homepage with no explanation. Now the choice — watch it, or drive it — is
 * the whole page, and each option says exactly what happens next.
 */
function DemoChooser() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] bg-bd-paper px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-bd-blue">
          See the demo
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-[1.9rem] font-extrabold leading-[1.1] tracking-tight text-bd-navy sm:text-4xl">
          {prospect
            ? `${prospect} — two ways to see how this works.`
            : "Two ways to see how this works."}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bd-body">
          Both show the same job: a customer books, and the office fills in by itself. Pick
          whichever you've got time for.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Option 1 — watch */}
          <section className="flex flex-col rounded-2xl border border-bd-navy/10 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2 text-bd-blue">
              <Play className="size-4" fill="currentColor" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                64 seconds · just watch
              </span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-bd-navy">
              Watch the walkthrough
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-bd-body">
              One job start to finish — photo quote, deposit, the crew adding an item on site, the
              customer approving it, paid before the truck leaves.
            </p>
            <div className="mt-4">
              <DemoVideo />
            </div>
          </section>

          {/* Option 2 — drive it */}
          <section className="flex flex-col rounded-2xl border-2 border-bd-blue bg-white p-5 shadow-lg shadow-bd-navy/5 sm:p-6">
            <div className="flex items-center gap-2 text-bd-blue">
              <MousePointerClick className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                2 minutes · hands on
              </span>
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-bd-navy">Try it yourself</h2>
            <p className="mt-2 text-sm leading-relaxed text-bd-body">
              Book a pickup as the customer, then switch to the office and find the job already
              there. We'll walk you through it step by step.
            </p>

            <ol className="mt-4 space-y-2.5">
              {[
                "Book a pickup on a sample company's site",
                "Switch to the office side",
                "See the job already filled in — nothing typed",
              ].map((line, i) => (
                <li key={line} className="flex gap-2.5 text-sm text-bd-navy">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-bd-blue-soft text-[10px] font-bold text-bd-blue">
                    {i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>

            <div className="mt-auto pt-5">
              <Link
                to="/customer"
                search={search}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-bd-blue px-5 text-[15px] font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                Start the guided demo <ArrowRight className="size-4" />
              </Link>
              <p className="mt-2.5 text-center text-xs text-bd-body">
                Nothing is really sent or charged. Leave any time with “Exit demo”.
              </p>
            </div>
          </section>
        </div>

        <p className="mt-6 text-sm text-bd-body">
          Already know your way around?{" "}
          <Link to="/staff" className="font-semibold text-bd-blue hover:underline">
            Jump straight to the staff side
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
