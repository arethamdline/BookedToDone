import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";

import { stepForPath, stepNumber, type GuideStep } from "@/data/demo-guide";
import { BOOKED_FLAG, BOOKED_EVENT } from "./deposit-step";
import { bookingHrefFor } from "@/data/site-content";
import { useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "bd-demo-guide-dismissed";

/**
 * A small, persistent "what am I looking at, what do I do next" card.
 *
 * Collapses to a pill rather than disappearing, so a visitor who closes it can
 * always get the thread back.
 */
export function DemoGuide() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prospect = useProspect();
  const [collapsed, setCollapsed] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setBooked(localStorage.getItem(BOOKED_FLAG) === "1");
      } catch {
        /* blocked storage — guide just stays on the normal step */
      }
    };
    read();
    window.addEventListener(BOOKED_EVENT, read);
    return () => window.removeEventListener(BOOKED_EVENT, read);
  }, []);

  // A finished booking should pop the guide back open even if it was hidden.
  useEffect(() => {
    if (booked) setCollapsed(false);
  }, [booked]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* private mode / blocked storage — just show the guide */
    }
  }, []);

  const setCollapsedPersisted = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(DISMISS_KEY, value ? "1" : "0");
    } catch {
      /* non-fatal */
    }
  };

  // The staff shell has a fixed 15rem sidebar at z-50 that renders after this
  // card, so the guide needs a higher layer and must sit clear of that lane.
  const onStaff = pathname.startsWith("/staff");
  const place = onStaff ? "z-[65] lg:left-[16.5rem]" : "z-[65]";

  const base = stepForPath(pathname);

  // Once the deposit is paid, the booking step turns into the hand-off.
  const step: GuideStep | undefined =
    booked && base?.match === "/book"
      ? {
          ...base,
          title: "Paid — that's the customer side done",
          body: "The slot is held and the deposit is recorded. Nobody at the office has touched this booking. Go and look at it.",
          next: { to: "/staff", label: "See it land in the office" },
        }
      : base;

  if (!step) return null;
  const { index, total } = stepNumber(step);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsedPersisted(false)}
        className={cn(
          "fixed bottom-20 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-bd-navy px-4 text-xs font-bold text-white shadow-lg lg:bottom-5",
          place,
        )}
      >
        <Compass className="size-4" />
        Show me around
      </button>
    );
  }

  return (
    <aside
      aria-label="Demo guide"
      className={cn(
        "fixed bottom-20 left-4 right-4 max-w-sm rounded-xl border border-bd-navy/10 bg-white p-4 shadow-2xl shadow-bd-navy/20 sm:right-auto lg:bottom-5",
        place,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-bd-blue text-[11px] font-bold text-white">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-bd-body">
            Step {index} of {total} · {step.side === "customer" ? "Customer side" : "Staff side"}
          </p>
          <p className="mt-0.5 font-display text-sm font-bold text-bd-navy">{step.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-bd-body">{step.body}</p>

          {step.finish ? (
            <div className="mt-3 rounded-lg bg-bd-paper p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-bd-blue">
                <Check className="size-3.5" /> That's the demo
              </p>
              <p className="mt-1 text-xs leading-relaxed text-bd-body">
                Want to see what this looks like running on your own jobs, your prices and your
                crew?
              </p>
              <a
                href={bookingHrefFor("Demo finished — show me this on my operation", prospect)}
                className="mt-2.5 flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-bd-blue px-3 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                Show me this on my operation <ArrowRight className="size-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setCollapsedPersisted(true)}
                className="mt-1.5 w-full text-center text-xs font-semibold text-bd-body underline-offset-2 hover:underline"
              >
                I'll keep exploring on my own
              </button>
            </div>
          ) : (
            step.next && (
              <Link
                to={step.next.to}
                className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-bd-blue px-3 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                {step.next.label} <ArrowRight className="size-3.5" />
              </Link>
            )
          )}

          {step.back && (
            <Link
              to={step.back.to}
              className="mt-2 flex min-h-8 items-center gap-1.5 text-xs font-semibold text-bd-body transition-colors hover:text-bd-navy"
            >
              <ArrowLeft className="size-3.5" /> {step.back.label}
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsedPersisted(true)}
          aria-label="Hide the guide"
          className={cn(
            "-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-md text-bd-mute",
            "transition-colors hover:bg-bd-chip hover:text-bd-navy",
          )}
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
