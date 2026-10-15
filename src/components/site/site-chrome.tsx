import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";

import { bookingHrefFor, contactEmail } from "@/data/site-content";
import { prospectSearch, useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/** The Booked to Done wordmark. Swap for the SVG kit when `/brand/` lands. */
export function SiteBrand({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          invert ? "bg-white text-bd-navy" : "bg-bd-blue text-white",
        )}
      >
        <Truck className="size-[18px]" />
      </span>
      <span
        className={cn(
          "font-display text-[15px] font-extrabold tracking-tight",
          invert ? "text-white" : "text-bd-navy",
        )}
      >
        Booked to Done
      </span>
    </span>
  );
}

export function SiteHeader() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <header className="sticky top-0 z-50 border-b border-bd-navy/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" search={search} className="shrink-0">
          <SiteBrand />
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <a
            href="#system"
            className="hidden min-h-11 items-center rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-bd-navy sm:inline-flex"
          >
            What it does
          </a>
          <Link
            to="/demo"
            search={search}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-2.5 text-[13px] font-semibold text-bd-navy transition-colors hover:bg-bd-paper sm:px-3 sm:text-sm"
          >
            <span className="sm:hidden">Demo</span>
            <span className="hidden sm:inline">See the demo</span>
          </Link>
          <a
            href={bookingHrefFor("15-min call — Booked to Done", prospect)}
            aria-label="Book a meeting at a time that suits you"
            className="inline-flex min-h-11 items-center rounded-lg bg-bd-blue px-3 text-[13px] font-bold text-white transition-colors hover:bg-bd-blue-ink sm:px-4 sm:text-sm"
          >
            Book a meeting
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const prospect = useProspect();
  const search = prospectSearch(prospect);

  return (
    <footer className="border-t border-bd-navy/10 bg-bd-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <SiteBrand invert />
          <p className="mt-3 max-w-sm text-sm text-white/65">
            AI booking and operations systems for owner-run service businesses. You talk. We listen.
            We build it around you.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/demo" search={search} className="font-semibold text-white hover:underline">
            See it all connected
          </Link>
          <a href={`mailto:${contactEmail}`} className="text-white/65 hover:text-white">
            {contactEmail}
          </a>
          <p className="mt-2 text-xs text-white/40">
            Demo system. Emails, texts and payments are simulated.
          </p>
        </div>
      </div>
    </footer>
  );
}
