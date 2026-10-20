import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
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
import { bookingHrefFor, contactEmail } from "@/data/site-content";
import { useProspect } from "@/lib/prospect";
import { announceTourStep } from "@/lib/tour-events";
import { cn } from "@/lib/utils";

/**
 * Tour position lives in `sessionStorage`, not `localStorage`: opening the demo
 * is meant to start the tour at step one. Carrying step 7 over from a visit
 * last week drops a stranger into the middle of a story they haven't been told.
 */
const COLLAPSED_KEY = "bd-demo-guide-dismissed";
const STEP_KEY = "bd-demo-tour-step";
const FINISHED_KEY = "bd-demo-tour-finished";

/** Height the guide occupies, so the AI launcher can sit clear of it. */
const GUIDE_VAR = "--bd-guide-h";

/** What counts as "the visitor pressed the thing" inside a highlighted area. */
const CONTROLS = 'button, a[href], input, select, textarea, [role="button"], [role="link"]';

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
  /** Where the animated pointer taps, if this step has one thing to press. */
  const [tap, setTap] = useState<{ x: number; y: number } | null>(null);
  /** The step's target is inside the open modal, so the page is already dimmed. */
  const [inDialog, setInDialog] = useState(false);
  /** A modal is open and this step's target is behind it — nothing to point at. */
  const [blocked, setBlocked] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  /** True while a navigation the tour itself asked for is still in flight. */
  const navigating = useRef(false);
  /** Saved position restored. Until then there is nothing to follow. */
  const [ready, setReady] = useState(false);
  /** Showing the hand-off between the demo's two halves. */
  const [handover, setHandover] = useState(false);
  /** The visitor has reached the end and asked to see the wrap-up. */
  const [finished, setFinished] = useState(false);
  const shownSide = useRef<"customer" | "staff" | null>(null);

  useEffect(() => {
    setCollapsed(read(COLLAPSED_KEY) === "1");
    const saved = Number(read(STEP_KEY));
    if (Number.isInteger(saved) && saved > 0 && saved < tourLength) setStep(saved);
    setFinished(read(FINISHED_KEY) === "1");
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

  /**
   * Every step starts clean. Whatever the visitor opened on the last one — the
   * customer's chat, the office assistant, a booking — closes as the tour moves
   * on, rather than being left over the thing the new step is pointing at. Not
   * on the first render, which is just the saved position coming back.
   */
  const lastStep = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (lastStep.current === null) {
      lastStep.current = step;
      return;
    }
    if (lastStep.current === step) return;
    lastStep.current = step;
    announceTourStep();
    // Except a dialog the new step is about: opening the booking on the
    // dashboard step is what *brings* you to the step inside that booking, and
    // closing it on arrival would shut it the moment it opened.
    if (!tour[step]?.closesDialog) closeDialog();
  }, [ready, step]);

  const current = tour[step]!;
  const onThisRoute = current.route === pathname;
  const live = !collapsed && !handover && !!current.target && onThisRoute;

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

  /**
   * Crossing from the customer's half to the office half is the point of the
   * whole demo — the same job turning up on the other side. It used to happen
   * silently, mid-scroll. Now it announces itself.
   */
  useEffect(() => {
    if (!ready || collapsed) return;
    if (shownSide.current === null) {
      shownSide.current = current.side;
      return;
    }
    if (shownSide.current === current.side) return;
    shownSide.current = current.side;
    setHandover(true);
    const id = window.setTimeout(() => setHandover(false), 2200);
    return () => clearTimeout(id);
  }, [ready, collapsed, current.side]);

  const measure = useCallback(() => {
    if (!live) {
      setRect(null);
      setTap(null);
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

    // The pointer taps one specific control: the lit element itself when it is
    // a control, otherwise whatever inside it is marked `data-tour-point`. The
    // middle of a container is often nothing pressable — on the assistant card
    // the first button is "Send", not a suggestion. Steps you only read have
    // neither, and get no pointer.
    const point =
      el && !behindDialog
        ? el.matches(CONTROLS)
          ? el
          : el.querySelector("[data-tour-point]")
        : null;
    const pr = point?.getBoundingClientRect();
    setTap(
      pr && pr.width && pr.height
        ? { x: pr.left + Math.min(pr.width / 2, 48), y: pr.top + pr.height / 2 }
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
   *
   * Only on steps with no `action`. A step that offers a button is one to look
   * at rather than press through: opening the office assistant used to whip the
   * visitor to the next step before it had finished answering them.
   */
  useEffect(() => {
    if (!live || blocked || current.finish || current.action) return;
    const onClick = (e: MouseEvent) => {
      const el = document.querySelector(current.target!);
      if (!el || !(e.target instanceof Element) || !el.contains(e.target)) return;
      // Only a real control counts as having done the step. A target is often a
      // container, and a click on the padding between its buttons is not the
      // visitor finishing anything.
      if (!e.target.closest(CONTROLS)) return;
      window.setTimeout(() => goTo(step + 1), 350);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [live, blocked, current.target, current.finish, current.action, step, goTo]);

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

  /**
   * The wrap-up. Centre of screen, because finishing the demo is the one moment
   * the tour is allowed to be the whole page — and because the three things a
   * visitor might want next deserve to be asked plainly rather than buried in a
   * corner card.
   */
  if (finished)
    return (
      <div className="pointer-events-auto fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-bd-navy/75 px-5 py-8 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="You've finished the demo"
          className="bd-rise w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        >
          <span className="bd-pop mx-auto grid size-14 place-items-center rounded-full bg-bd-done-tint">
            <Check className="size-7 text-bd-green" strokeWidth={3} />
          </span>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-bd-mute">
            Demo complete · {tourLength} of {tourLength}
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight text-bd-navy">
            That's the whole loop.
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-bd-body">
            One job, both sides, nothing typed twice. The photo your customer sent became the job
            card your crew works from — and nobody in your office keyed in a thing.
          </p>

          <div className="mt-6 space-y-2">
            <a
              href={bookingHrefFor("Finished the demo — adding this to my business", prospect)}
              className="block rounded-xl bg-bd-blue px-4 py-3 text-white transition-colors hover:bg-bd-blue-ink"
            >
              <span className="flex items-center justify-center gap-1.5 font-display text-sm font-bold">
                Book a meeting <ArrowRight className="size-4" />
              </span>
              <span className="mt-0.5 block text-[11px] font-medium leading-snug text-white/75">
                Learn how we'd add this to your business
              </span>
            </a>
            <button
              type="button"
              onClick={() => {
                setFinished(false);
                write(FINISHED_KEY, "0");
                setCollapsedPersisted(true);
              }}
              className="block w-full rounded-xl border border-bd-line px-4 py-3 text-sm font-bold text-bd-navy transition-colors hover:border-bd-navy/25 hover:bg-bd-paper"
            >
              Explore the demo on my own
            </button>
            <Link
              to="/"
              onClick={() => write(FINISHED_KEY, "0")}
              className="block w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-bd-mute transition-colors hover:text-bd-navy"
            >
              Exit the demo
            </Link>
          </div>

          {/* For anyone who'd rather ask a question than book a slot. */}
          <p className="mt-4 border-t border-bd-line pt-3 text-xs text-bd-body">
            Rather just ask?{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-semibold text-bd-blue underline underline-offset-2 hover:text-bd-blue-ink"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    );

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

  const toStaff = current.side === "staff";

  return (
    <>
      {handover && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-bd-navy/75 px-6 backdrop-blur-sm"
        >
          <div className="bd-handover w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bd-mute">
              {toStaff ? "You've seen the customer's half" : "Back round the other side"}
            </p>
            <p className="mt-1.5 font-display text-xl font-extrabold leading-tight text-bd-navy">
              {toStaff ? "Now your office" : "Now your customer"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-bd-body">
              {toStaff
                ? "Same job, the other side of the desk. Watch what turns up without anyone typing it."
                : "Back to what the person booking you actually sees."}
            </p>

            {/* The two halves, handing over. */}
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <Side label="Customer" lit={!toStaff} delay={toStaff ? 0 : 0.35} />
              <ArrowRight
                className={cn("size-4 shrink-0 text-bd-blue", !toStaff && "rotate-180")}
              />
              <Side label="Your office" lit={toStaff} delay={toStaff ? 0.35 : 0} />
            </div>
          </div>
        </div>
      )}

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
          {tap && <TapPointer x={tap.x} y={tap.y} />}
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
            /* The last step still describes the screen it's on. Finishing is a
               deliberate press, so the wrap-up doesn't cover the inbox the
               moment the visitor arrives at it. */
            <button
              type="button"
              onClick={() => {
                setFinished(true);
                write(FINISHED_KEY, "1");
              }}
              className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bd-blue px-3.5 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
            >
              That's the tour — wrap up <ArrowRight className="size-3.5" />
            </button>
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
            /* Exactly one thing to do per step, never two boxes competing.
               A step with no `action` is one you press on the page: the dashed
               instruction is the whole story. A step with an `action` is one you
               look at: the lit element is described in plain text, and the
               button is the only control. */
            <>
              {rect && !current.action && (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-bd-blue/40 bg-bd-blue-soft/60 px-3 py-2.5 text-xs font-bold leading-snug text-bd-blue-ink">
                  <MousePointerClick className="mt-px size-4 shrink-0 text-bd-blue" />
                  {current.prompt ?? "Click the highlighted part to carry on"}
                </p>
              )}
              {rect && current.action && current.prompt && (
                <p className="mt-2.5 flex items-start gap-1.5 text-[11px] font-semibold leading-snug text-bd-mute">
                  <MousePointerClick className="mt-px size-3.5 shrink-0" />
                  {current.prompt} — then:
                </p>
              )}
              {(!rect || current.action) && (
                <button
                  type="button"
                  onClick={() => {
                    if (current.closesDialog) closeDialog();
                    goTo(step + 1);
                  }}
                  className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bd-blue px-3.5 text-xs font-bold text-white transition-colors hover:bg-bd-blue-ink"
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

/** One half of the hand-off chip pair. The one being handed to pops in. */
function Side({ label, lit, delay }: { label: string; lit: boolean; delay: number }) {
  return (
    <span
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-[11px] font-bold",
        lit ? "bd-pop bg-bd-blue text-white" : "bg-bd-chip text-bd-mute",
      )}
      style={lit ? { animationDelay: `${delay}s` } : undefined}
    >
      {label}
    </span>
  );
}

/**
 * An animated cursor that taps the one thing to press: glides in, presses,
 * ripples, lifts away, repeats. Drawn rather than an icon so the arrow's tip
 * sits exactly on (0, 0) — positioning the element positions the tap.
 */
function TapPointer({ x, y }: { x: number; y: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute" style={{ left: x, top: y }}>
      <span className="bd-cursor-ripple absolute left-0 top-0 size-14 rounded-full border-2 border-white bg-white/30" />
      <span className="bd-cursor-tap absolute left-0 top-0 flex items-start">
        <svg
          width="32"
          height="37"
          viewBox="0 0 26 30"
          className="shrink-0 drop-shadow-[0_2px_4px_rgba(16,44,35,0.45)]"
        >
          <path
            d="M1 1 L1 23 L7.2 17.4 L11.4 27.2 L15.6 25.4 L11.5 15.8 L19.8 15.8 Z"
            fill="white"
            stroke="#102c23"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <span className="-ml-1 mt-7 whitespace-nowrap rounded-full bg-bd-blue px-2 py-0.5 text-[11px] font-bold text-white shadow-lg">
          Tap here
        </span>
      </span>
    </span>
  );
}
