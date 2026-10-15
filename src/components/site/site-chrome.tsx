import { Link } from "@tanstack/react-router";

import { bookingHrefFor, contactEmail } from "@/data/site-content";
import { prospectSearch, useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * The Booked to Done lockup — the real `bd` mark plus the wordmark.
 *
 * Assets live in `public/brand/` and are documented in `brand/README.md`. They
 * are PNGs cropped from the supplied logo sheet; if the original vector turns
 * up, swap the `src` for an `.svg` and this component needs no other change.
 */
export function SiteBrand({ className, invert }: { className?: string; invert?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img
        src={invert ? "/brand/bd-mark-white.png" : "/brand/bd-mark.png"}
        alt=""
        aria-hidden="true"
        width="347"
        height="294"
        className="h-7 w-auto shrink-0"
      />
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
            className="hidden min-h-11 items-center rounded-md px-3 text-sm font-semibold text-bd-navy transition-colors hover:bg-bd-paper sm:inline-flex"
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
            href={bookingHrefFor("30-min call — Booked to Done", prospect)}
            aria-label="Book a meeting at a time that suits you"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg bg-bd-blue px-3 text-[13px] font-bold text-white transition-colors hover:bg-bd-blue-ink sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a meeting</span>
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
            See the demo
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
