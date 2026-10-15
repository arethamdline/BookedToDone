import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { DemoVideo } from "@/components/site/demo-video";
import { Button } from "@/components/ui/button";
import { prospectSearch, useProspect, validateProspectSearch } from "@/lib/prospect";

export const Route = createFileRoute("/demo")({
  validateSearch: validateProspectSearch,
  head: () => ({
    meta: [
      { title: "See it all connected — Booked to Done" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoEntry,
});

function DemoEntry() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <main className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-bd-paper px-4 py-8 sm:px-8">
      <div className="grid w-full max-w-6xl items-center gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <Link
            to="/"
            search={search}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-bd-navy"
          >
            ← Booked to Done
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-bd-blue">
            The whole system
          </p>
          <h1 className="mt-3 max-w-xl font-display text-[1.9rem] font-extrabold leading-[1.1] tracking-tight text-bd-navy sm:text-4xl">
            {prospect
              ? `${prospect}, here's your booking system, working.`
              : "Try it as your customer. Watch your office update."}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Book a pickup on the customer side, then switch to the staff system and find the job
            already there — address, items, photos and price, with nothing typed by a person.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl" className="w-full bg-bd-blue hover:bg-bd-blue-ink sm:w-auto">
              <Link to="/customer" search={search}>
                Start the demo <ArrowRight />
              </Link>
            </Button>
            <Link
              to="/staff"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-bd-navy transition-colors hover:bg-white"
            >
              Skip to the Staff system <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Nothing is really sent or charged. Emails, texts and payments are simulated.
          </p>
        </div>

        <DemoVideo />
      </div>
    </main>
  );
}
