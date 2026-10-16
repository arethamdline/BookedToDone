import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Compass, MousePointerClick, X } from "lucide-react";

import { tour, tourLength } from "@/data/demo-tour";
import { bookingHrefFor } from "@/data/site-content";
import { useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * Tour position lives in `sessionStorage`, not `localStorage`: opening the demo
 * is meant to start the tour at step one. Carrying step 7 over from a visit
 * last week drops a stranger into the middle of a story they haven't been told.
 */
const COLLAPSED_KEY = "bd-demo-guide-dismissed";
const STEP_KEY = "bd-demo-tour-step";

/** Height the guide occupies, so the AI launcher can sit clear of it. */
const GUIDE_VAR = "--bd-guide-h";

type Rect = { top: number; left: number; width: number; height: number };

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* blocked storage — the tour still works, it just won't survive a reload */
  }
};

/**
 * The guided tour.
 *
 * Walks one job through both sides of the system. Where a step has something to
 * press, the rest of the page dims and that one element stays lit, with a
 * pointer on it — and pressing it is what moves the tour on, so the thing the
 * visitor is told to do and the thing that advances the tour are the same
 * action. Steps with nothing to press advance from the card's own button.
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
    setCollapsed(read(COLLAPSED_KEY) === "1");
    const saved = Number(read(STEP_KEY));
    if (Number.isInteger(saved) && saved > 0 && saved < tourLength) setStep(saved);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(tourLength - 1, next));
      setStep(clamped);
      write(STEP_KEY, String(clamped));
      const route = tour[clamped]!.route;
      if (route !== pathname) router.navigate({ to: route });
    },
    [pathname, router],
  );

  const current = tour[step]!;
  const onThisRoute = current.route === pathname;
  const live = !collapsed && !!current.target && onThisRoute;

  const measure = useCallback(() => {
    if (!live) {
      setRect(null);
      return;
    }
    const el = document.querySelector(current.target!);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect(
      r.width && r.height ? { top: r.top, left: r.left, width: r.width, height: r.height } : null,
    );
  }, [live, current.target]);

  useLayoutEffect(() => {
    // Some targets only appear once the visitor acts (the "did we miss
    // anything" box exists only after the scan), so look a few times rather
    // than once and give up.
    measure();
    const ids = [150, 500, 1200, 2500, 4000].map((d) => window.setTimeout(measure, d));
    return () => {
      ids.forEach(clearTimeout);
    };
  }, [measure, step, pathname]);

  useEffect(() => {
    if (!live) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [measure, live]);

  useEffect(() => {
    if (!live) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(current.target!)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 200);
    return () => clearTimeout(id);
  }, [live, current.target, step]);

  /**
   * Pressing the highlighted thing is what moves the tour on. Capture phase so
   * we see the click whatever the element does with it, and a tick's delay so
   * the element's own handler (navigate, open, scan) runs first.
   */
  useEffect(() => {
    if (!live || current.finish) return;
    const onClick = (e: MouseEvent) => {
      const el = document.querySelector(current.target!);
      if (el && e.target instanceof Node && el.contains(e.target)) {
        window.setTimeout(() => goTo(step + 1), current.advanceAfter ?? 350);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [live, current.target, current.finish, current.advanceAfter, step, goTo]);

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
    write(COLLAPSED_KEY, value ? "1" : "0");
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

  // Keep the card off whatever it is pointing at, and put the pointer on the
  // side of the target that has room for it.
  const highlightLow = rect ? rect.top + rect.height / 2 > window.innerHeight / 2 : false;
  const pointerAbove = rect ? rect.top + rect.height + 56 > window.innerHeight : false;

  return (
    <>
      {rect && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
          {/* A spread shadow big enough to cover the viewport dims everything
              except the hole punched by this element — the target stays lit and,
              since the overlay takes no pointer events, still clickable. The
              ring is a separate element because `bd-pulse` animates box-shadow
              and would otherwise wipe out the dimming. */}
          <span
            className="absolute rounded-xl"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
              boxShadow: "0 0 0 9999px rgba(16, 44, 35, 0.6)",
            }}
          />
          <span
            className="bd-pulse absolute rounded-xl outline outline-2 outline-bd-blue"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
          <span
            className="bd-nudge absolute flex items-center gap-1.5 rounded-full bg-bd-blue px-3 py-1.5 text-[11px] font-bold text-white shadow-xl"
            style={{
              top: pointerAbove ? rect.top - 44 : rect.top + rect.height + 12,
              left: Math.max(12, Math.min(rect.left, window.innerWidth - 150)),
            }}
          >
            <MousePointerClick className="size-3.5" /> Click here
          </span>
        </div>
      )}

      <aside
        ref={cardRef}
        aria-label="Demo guide"
        className={cn(
          "fixed left-4 right-4 z-[80] max-w-sm overflow-hidden rounded-xl border border-bd-navy/10 bg-white shadow-2xl shadow-bd-navy/30 sm:right-auto",
          pathname.startsWith("/staff") && "lg:left-[16.5rem]",
          highlightLow ? "top-20" : "bottom-20 lg:bottom-5",
        )}
      >
        {/* A tour needs to announce itself as one, and show how far along it is. */}
        <div className="bd-ai-gradient flex items-center gap-2 px-4 py-2 text-white">
          <Compass className="size-3.5 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em]">Guided demo</p>
          <p className="ml-auto text-[10px] font-bold tabular-nums opacity-90">
            {step + 1} / {tourLength}
          </p>
          <button
            type="button"
            onClick={() => setCollapsedPersisted(true)}
            aria-label="Hide the guide"
            className="-mr-1.5 grid size-6 shrink-0 place-items-center rounded transition-colors hover:bg-white/20"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="h-0.5 bg-bd-chip">
          <div
            className="h-full bg-bd-blue transition-[width] duration-500"
            style={{ width: `${((step + 1) / tourLength) * 100}%` }}
          />
        </div>

        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-bd-mute">
            {current.side === "customer" ? "Customer side" : "Your office"}
          </p>
          <p className="mt-0.5 font-display text-base font-bold text-bd-navy">{current.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-bd-body">{current.body}</p>

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
                href={bookingHrefFor("Finished the demo — show me this on my operation", prospect)}
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
          ) : rect ? (
            /* There's something lit up on screen — pressing it is the next
               step, so the card shouldn't offer a competing primary button. */
            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-bd-blue-soft px-3 py-2 text-xs font-bold text-bd-blue-ink">
              <MousePointerClick className="size-3.5 shrink-0" />
              {current.prompt ?? "Click the highlighted part to carry on"}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bd-blue px-3.5 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
            >
              {current.action ?? "Next"} <ArrowRight className="size-3.5" />
            </button>
          )}

          {!current.finish && (
            <div className="mt-3 flex items-center gap-3 border-t border-bd-line pt-2.5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="flex min-h-8 items-center gap-1 text-[11px] font-semibold text-bd-mute transition-colors hover:text-bd-navy"
                >
                  <ArrowLeft className="size-3" /> Back
                </button>
              )}
              {rect && (
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  className="ml-auto flex min-h-8 items-center gap-1 text-[11px] font-semibold text-bd-mute transition-colors hover:text-bd-navy"
                >
                  Skip <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
