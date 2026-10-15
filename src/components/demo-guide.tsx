import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, Hand, X } from "lucide-react";

import { tour, tourLength } from "@/data/demo-tour";
import { bookingHrefFor } from "@/data/site-content";
import { useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

const COLLAPSED_KEY = "bd-demo-guide-dismissed";
const STEP_KEY = "bd-demo-tour-step";

/** Height the guide occupies, so the AI launcher can sit clear of it. */
const GUIDE_VAR = "--bd-guide-h";

type Rect = { top: number; left: number; width: number; height: number };

/**
 * The guided tour.
 *
 * Walks one job through both sides of the system, ringing the thing it is
 * talking about and showing where to press. The card parks itself away from
 * whatever it is highlighting, and publishes its own height as a CSS variable
 * so the floating assistant can keep out of its way.
 */
export function DemoGuide() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prospect = useProspect();

  const [collapsed, setCollapsed] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
      const saved = Number(localStorage.getItem(STEP_KEY));
      if (Number.isInteger(saved) && saved >= 0 && saved < tourLength) setStep(saved);
    } catch {
      /* blocked storage — start from the top, shown */
    }
  }, []);

  const persist = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* non-fatal */
    }
  };

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(tourLength - 1, next));
      setStep(clamped);
      persist(STEP_KEY, String(clamped));
      const route = tour[clamped]!.route;
      if (route !== pathname) router.navigate({ to: route });
    },
    [pathname, router],
  );

  const current = tour[step]!;
  const onThisRoute = current.route === pathname;

  const measure = useCallback(() => {
    if (collapsed || !current.target || !onThisRoute) {
      setRect(null);
      return;
    }
    const el = document.querySelector(current.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [collapsed, current.target, onThisRoute]);

  useLayoutEffect(() => {
    // Some targets only appear once the visitor acts (the "did we miss
    // anything" box exists only after the scan), so look a few times rather
    // than once and give up.
    const ids = [150, 500, 1200, 2500, 4000].map((d) => window.setTimeout(measure, d));
    return () => ids.forEach(clearTimeout);
  }, [measure, step, pathname]);

  useEffect(() => {
    if (!current.target) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [measure, current.target]);

  useEffect(() => {
    if (collapsed || !current.target || !onThisRoute) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(current.target!)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 200);
    return () => clearTimeout(id);
  }, [collapsed, current.target, onThisRoute, step]);

  // publish our height so the assistant launcher can clear it
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      GUIDE_VAR,
      collapsed ? "0px" : `${cardRef.current?.offsetHeight ?? 0}px`,
    );
    // While the tour is driving, the floating assistant is competing noise —
    // and on a phone it lands on whatever the guide is pointing at.
    root.dataset["guide"] = collapsed ? "closed" : "open";
    return () => {
      root.style.removeProperty(GUIDE_VAR);
      delete root.dataset["guide"];
    };
  }, [collapsed, step, pathname, rect]);

  const setCollapsedPersisted = (value: boolean) => {
    setCollapsed(value);
    persist(COLLAPSED_KEY, value ? "1" : "0");
  };

  if (!tour.some((s) => pathname === s.route || pathname.startsWith(`${s.route}/`))) return null;

  if (collapsed)
    return (
      <button
        type="button"
        onClick={() => setCollapsedPersisted(false)}
        className="fixed bottom-20 left-4 z-[75] inline-flex min-h-11 items-center gap-2 rounded-full bg-bd-navy px-4 text-xs font-bold text-white shadow-lg lg:bottom-5"
      >
        <Compass className="size-4" />
        Show me around
      </button>
    );

  // keep the card off whatever it is pointing at
  const highlightLow = rect ? rect.top + rect.height / 2 > window.innerHeight / 2 : false;

  return (
    <>
      {rect && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
          <span
            className="bd-pulse absolute rounded-xl ring-2 ring-bd-blue"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
          <span
            className="absolute flex items-center gap-1 rounded-full bg-bd-blue px-2.5 py-1 text-[11px] font-bold text-white shadow-lg"
            style={{
              top: rect.top + rect.height + 10,
              left: Math.max(12, Math.min(rect.left, window.innerWidth - 120)),
            }}
          >
            <Hand className="size-3.5" /> Tap here
          </span>
        </div>
      )}

      <aside
        ref={cardRef}
        aria-label="Demo guide"
        className={cn(
          "fixed left-4 right-4 z-[75] max-w-sm rounded-xl border border-bd-navy/10 bg-white p-4 shadow-2xl shadow-bd-navy/20 sm:right-auto",
          pathname.startsWith("/staff") && "lg:left-[16.5rem]",
          highlightLow ? "top-20" : "bottom-20 lg:bottom-5",
        )}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-bd-blue text-[11px] font-bold text-white">
            {step + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-bd-body">
              Step {step + 1} of {tourLength} ·{" "}
              {current.side === "customer" ? "Customer side" : "Your office"}
            </p>
            <p className="mt-0.5 font-display text-sm font-bold text-bd-navy">{current.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-bd-body">{current.body}</p>

            {current.finish ? (
              <div className="mt-3 rounded-lg bg-bd-paper p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold text-bd-blue">
                  <Check className="size-3.5" /> That's the whole loop
                </p>
                <p className="mt-1 text-xs leading-relaxed text-bd-body">
                  One job, both sides, nothing typed twice. Want to see it with your own jobs and
                  prices in it?
                </p>
                <a
                  href={bookingHrefFor(
                    "Finished the demo — show me this on my operation",
                    prospect,
                  )}
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
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-bd-blue px-3 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                {current.action ?? "Next"} <ArrowRight className="size-3.5" />
              </button>
            )}

            <div className="mt-3 flex items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="flex min-h-8 items-center gap-1 text-xs font-semibold text-bd-body transition-colors hover:text-bd-navy"
                >
                  <ArrowLeft className="size-3.5" /> Back
                </button>
              )}
              <div className="ml-auto flex items-center gap-1">
                {tour.map((s, i) => (
                  <span
                    key={s.id}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === step ? "w-4 bg-bd-blue" : "w-1 bg-bd-navy/20",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsedPersisted(true)}
            aria-label="Hide the guide"
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-md text-bd-mute transition-colors hover:bg-bd-chip hover:text-bd-navy"
          >
            <X className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
