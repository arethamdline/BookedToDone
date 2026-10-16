import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

import { DemoGuide } from "./demo-guide";

/** Routes that are the company site, not the demo app. */
const SITE_ROUTES = ["/", "/features"];

/**
 * The demo wrapper.
 *
 * Deliberately a dark band rather than a white header: it used to look like a
 * second site header stacked on the sample company's own, so visitors couldn't
 * tell where Booked to Done ended and the demo began. Everything inside this
 * band is "you are being shown something"; everything below it is the product.
 */
export function DemoTopBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onStaffSystem = pathname.startsWith("/staff");

  // The company site has its own header; this band belongs to the demo only.
  const onSite = pathname === "/" || SITE_ROUTES.some((r) => r !== "/" && pathname.startsWith(r));
  if (onSite) return null;

  // The /demo chooser explains itself — no side switch needed there yet.
  const onChooser = pathname === "/demo";

  return (
    <>
      {/* `data-tour-allow`: the guided tour swallows clicks outside the step it
          is pointing at, but never here — exiting the demo or switching sides
          has to stay possible at every step. */}
      <header data-tour-allow className="sticky top-0 z-[60] bg-bd-navy text-white">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-2.5 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src="/brand/bd-mark-white.png"
              alt=""
              aria-hidden="true"
              width="347"
              height="294"
              className="h-5 w-auto shrink-0"
            />
            <span className="shrink-0 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Demo
            </span>
            <span className="hidden truncate text-xs text-white/70 md:block">
              A sample junk-removal business, built by Booked to Done
            </span>
          </div>

          {!onChooser && (
            <nav
              aria-label="Which side you're viewing"
              className="ml-auto flex shrink-0 items-center rounded-lg bg-white/10 p-0.5"
            >
              <Link
                to="/customer"
                aria-current={!onStaffSystem ? "page" : undefined}
                className={`flex h-10 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                  !onStaffSystem
                    ? "bg-white text-bd-navy shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Customer side
              </Link>
              <Link
                to="/staff"
                aria-current={onStaffSystem ? "page" : undefined}
                className={`flex h-10 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                  onStaffSystem
                    ? "bg-white text-bd-navy shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Staff side
              </Link>
            </nav>
          )}

          <Link
            to="/"
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:text-xs ${
              onChooser ? "ml-auto" : "ml-1"
            }`}
          >
            <X className="size-3.5" />
            Exit demo
          </Link>
        </div>
      </header>
      {!onChooser && <DemoGuide />}
    </>
  );
}
