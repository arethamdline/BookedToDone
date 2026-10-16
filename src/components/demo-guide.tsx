import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  MousePointerClick,
  PanelTopClose,
  RotateCcw,
  X,
} from "lucide-react";

import { nearestStepForRoute, tour, tourLength } from "@/data/demo-tour";
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

/** An open modal, if there is one. Radix marks the live one `data-state="open"`. */
const openDialog = () => document.querySelector<HTMLElement>('[role="dialog"][data-state="open"]');

/** Shut whatever modal is open, the same way its own close button would. */
const closeDialog = () => {
  const dialog = openDialog();
  if (!dialog) return;
  // Press the dialog's own close control where there is one — it runs the same
  // state updates the visitor's click would, which a synthetic Escape may not.
  const close = [...dialog.querySelectorAll<HTMLElement>("button")].find(
    (b) =>
      b.textContent?.trim().toLowerCase() === "close" || b.ariaLabel?.toLowerCase() === "close",
  );
  if (close) {
    close.click();
    return;
  }
  dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
};

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
  /** The step's target is inside the open modal, so the page is already dimmed. */
  const [inDialog, setInDialog] = useState(false);
  /** A modal is open and this step's target is behind it — nothing to point at. */
  const [blocked, setBlocked] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  /** True while a navigation the tour itself asked for is still in flight. */
  const navigating = useRef(false);
  /** Saved position restored. Until then there is nothing to follow. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCollapsed(read(COLLAPSED_KEY) === "1");
    const saved = Number(read(STEP_KEY));
    if (Number.isInteger(saved) && saved > 0 && saved < tourLength) setStep(saved);
    setReady(true);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(tourLength - 1, next));
      setStep(clamped);
      write(STEP_KEY, String(clamped));
      const route = tour[clamped]!.route;
      if (route !== pathname) {
        navigating.current = true;
        router.navigate({ to: route });
      }
    },
    [pathname, router],
  );

  const current = tour[step]!;
  const onThisRoute = current.route === pathname;
  const live = !collapsed && !!current.target && onThisRoute;

  /**
   * The visitor can move themselves — the demo bar switches sides at any step.
   * When they land somewhere this step isn't about, move to the nearest step
   * for where they now are, rather than leaving the card describing another
   * screen or dumping them back at step one.
   */
  useEffect(() => {
    // Not before the saved position is back, or the first render — still on
    // step one — would snap a reloaded tour to the top of whatever route it
    // reloaded on, undoing the restore that is about to land.
    if (!ready) return;
    if (current.route === pathname) {
      navigating.current = false;
      return;
    }
    if (navigating.current) return;
    const i = nearestStepForRoute(pathname, step);
    if (i === -1 || i === step) return;
    setStep(i);
    write(STEP_KEY, String(i));
  }, [ready, pathname, current.route, step]);

  const measure = useCallback(() => {
    if (!live) {
      setRect(null);
      setBlocked(false);
      setInDialog(false);
      return;
    }
    const el = document.querySelector(current.target!);
    const dialog = openDialog();

    // A modal covers the page. If this step is about something underneath it,
    // there is nothing useful to ring — saying so beats drawing a highlight
    // over a card the visitor can't reach.
    const behindDialog = !!dialog && (!el || !dialog.contains(el));
    setBlocked(behindDialog);
    setInDialog(!!dialog && !!el && dialog.contains(el));

    const r = el && !behindDialog ? el.getBoundingClientRect() : null;
    setRect(
      r && r.width && r.height
        ? { top: r.top, left: r.left, width: r.width, height: r.height }
        : null,
    );
  }, [live, current.target]);

  useLayoutEffect(() => {
    // Some targets only appear once the visitor acts (the "did we miss
    // anything" box exists only after the scan), so look a few times rather
    // than once and give up.
    measure();
    const ids = [150, 500, 1200, 2500, 4000].map((d) => window.setTimeout(measure, d));
    // ...and anything can open a modal over the top at any moment, so watch the
    // document rather than waiting for the next poll to notice.
    const observer = new MutationObserver(() => measure());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => {
      ids.forEach(clearTimeout);
      observer.disconnect();
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
    if (!live || blocked) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(current.target!)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 200);
    return () => clearTimeout(id);
  }, [live, blocked, current.target, step]);

  /**
   * Pressing the highlighted thing is what moves the tour on. Capture phase so
   * we see the click whatever the element does with it, and a tick's delay so
   * the element's own handler (navigate, open, scan) runs first.
   */
  useEffect(() => {
    if (!live || blocked || current.finish || current.closesDialog) return;
    const onClick = (e: MouseEvent) => {
      const el = document.querySelector(current.target!);
      if (el && e.target instanceof Node && el.contains(e.target)) {
        window.setTimeout(() => goTo(step + 1), current.advanceAfter ?? 350);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [
    live,
    blocked,
    current.target,
    current.finish,
    current.closesDialog,
    current.advanceAfter,
    step,
    goTo,
  ]);

  /**
   * While a step is pointing at something, clicks anywhere else are swallowed.
   * Wandering off mid-step is what used to strand the tour — open a booking on
   * the dashboard and the guide carried on ringing a panel now buried behind
   * the modal. The demo chrome and the guide's own card stay live, so there is
   * always a way out: Skip, Back, hide the guide, or leave the demo.
   */
  useEffect(() => {
    if (!live || !rect || inDialog) return;
    const onClick = (e: MouseEvent) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const target = document.querySelector(current.target!);
      if (target?.contains(el)) return;
      if (el.closest("[data-tour-allow], aside[aria-label='Demo guide']")) return;
      e.preventDefault();
      e.stopPropagation();
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [live, rect, inDialog, current.target]);

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
        className="pointer-events-auto fixed bottom-20 left-4 z-[75] inline-flex min-h-11 items-center gap-2 rounded-full bg-bd-navy px-4 text-xs font-bold text-white shadow-lg lg:bottom-5"
      >
        <Compass className="size-4" />
        {/* Nine steps in, "Show me around" reads like starting over. Say what
            pressing it actually does. */}
        {step > 0 ? (
          <>
            Back to the tour
            <span className="font-bold tabular-nums text-white/60">
              {step + 1}/{tourLength}
            </span>
          </>
        ) : (
          "Show me around"
        )}
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
              except the hole punched by this element. Skipped inside a modal,
              which already dims the page behind itself. The ring is a separate
              element because `bd-pulse` animates box-shadow and would otherwise
              wipe out the dimming. */}
          {!inDialog && (
            <span
              aria-hidden="true"
              className="absolute rounded-xl"
              style={{
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                boxShadow: "0 0 0 9999px rgba(16, 44, 35, 0.6)",
              }}
            />
          )}
          <span
            aria-hidden="true"
            className="bd-pulse pointer-events-none absolute rounded-xl outline outline-2 outline-bd-blue"
            style={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
          />
          <span
            aria-hidden="true"
            className="bd-nudge pointer-events-none absolute flex items-center gap-1.5 rounded-full bg-bd-blue px-3 py-1.5 text-[11px] font-bold text-white shadow-xl"
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
          // `pointer-events-auto` is load-bearing: an open Radix dialog kills
          // pointer events on everything outside itself, which left the tour
          // card visible but dead exactly when a visitor most needed it.
          "pointer-events-auto fixed left-4 right-4 z-[80] max-w-sm overflow-hidden rounded-xl border border-bd-navy/10 bg-white shadow-2xl shadow-bd-navy/30 sm:right-auto",
          pathname.startsWith("/staff") && "lg:left-[16.5rem]",
          highlightLow ? "top-20" : "bottom-20 lg:bottom-5",
        )}
      >
        {/* A tour needs to announce itself as one, and show how far along it is.
            Navy, not the AI gradient: the gradient is reserved for moments where
            the AI is actually doing something, and the progress line lives
            inside this bar so it reads as one piece rather than a stray rule. */}
        <div className="relative bg-bd-navy px-4 pb-2.5 pt-2 text-white">
          <div className="flex items-center gap-2">
            <Compass className="size-3.5 shrink-0 text-white/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]">Guided demo</p>
            <p className="ml-auto text-[10px] font-bold tabular-nums text-white/60">
              {step + 1} / {tourLength}
            </p>
            <button
              type="button"
              onClick={() => setCollapsedPersisted(true)}
              aria-label="Hide the guide"
              className="-mr-1.5 grid size-6 shrink-0 place-items-center rounded text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
            <div
              className="h-full bg-white/80 transition-[width] duration-500"
              style={{ width: `${((step + 1) / tourLength) * 100}%` }}
            />
          </div>
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
          ) : blocked ? (
            /* Something opened over the top of this step. Say so plainly and
               offer the way back, rather than ringing a panel behind a modal. */
            <>
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-warning-soft/60 px-3 py-2 text-xs font-semibold text-bd-navy">
                <PanelTopClose className="mt-px size-3.5 shrink-0" />
                You've opened something over the tour. Close it and we'll pick up where you left
                off.
              </p>
              <button
                type="button"
                onClick={closeDialog}
                className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bd-blue px-3.5 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
              >
                Close it <ArrowRight className="size-3.5" />
              </button>
            </>
          ) : (
            <>
              {/* With something lit on screen, the pill says what to try. The
                  button below is only there on steps that need an explicit way
                  on — a step you read rather than press, or one where pressing
                  the lit thing is optional. */}
              {rect && (
                /* Dashed, so it reads as an instruction rather than a filled
                   chip that looks like a disabled button. */
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-bd-blue/40 bg-bd-blue-soft/60 px-3 py-2.5 text-xs font-bold leading-snug text-bd-blue-ink">
                  <MousePointerClick className="mt-px size-4 shrink-0 text-bd-blue" />
                  {current.prompt ?? "Click the highlighted part to carry on"}
                </p>
              )}
              {(!rect || current.action) && (
                <button
                  type="button"
                  onClick={() => {
                    if (current.closesDialog) closeDialog();
                    goTo(step + 1);
                  }}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-colors",
                    rect
                      ? "mt-2 border border-bd-line bg-white text-bd-body hover:border-bd-navy/25 hover:text-bd-navy"
                      : "mt-3 bg-bd-blue text-white hover:bg-bd-blue-ink",
                  )}
                >
                  {current.action ?? "Next"} <ArrowRight className="size-3.5" />
                </button>
              )}
            </>
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
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(0)}
                  className="flex min-h-8 items-center gap-1 text-[11px] font-semibold text-bd-mute transition-colors hover:text-bd-navy"
                >
                  <RotateCcw className="size-3" /> Start over
                </button>
              )}
              {(rect || blocked) && !current.action && (
                <button
                  type="button"
                  onClick={() => {
                    if (blocked) closeDialog();
                    goTo(step + 1);
                  }}
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
