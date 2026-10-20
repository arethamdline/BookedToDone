import { useEffect } from "react";

/**
 * Where the guided tour keeps its place. `sessionStorage`, so it belongs to one
 * browser tab: two visitors on two devices can never see each other's progress,
 * and a refresh mid-tour doesn't throw the visitor back to the start.
 */
export const TOUR_KEYS = {
  step: "bd-demo-tour-step",
  collapsed: "bd-demo-guide-dismissed",
  finished: "bd-demo-tour-finished",
} as const;

/**
 * Forget where the tour was. Called on the way in ("Start the guided demo") and
 * on the way out ("Exit demo"), so going back in means starting again — rather
 * than the same tab dropping you on whatever step you'd wandered off at.
 */
export function resetTour() {
  try {
    Object.values(TOUR_KEYS).forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* blocked storage — the tour couldn't have saved a place either */
  }
}

/**
 * Fired by the guided tour whenever it moves to a different step.
 *
 * Anything that opens over the page — the customer's chat, the office
 * assistant — listens for it and closes itself. A visitor who opened the chat
 * on the assistant step used to arrive at the next step with that chat still
 * covering the thing the step was pointing at. Each panel owns its own close,
 * so the tour never has to know which panels exist.
 */
export const TOUR_STEP_EVENT = "bd:tour-step";

export function announceTourStep() {
  window.dispatchEvent(new Event(TOUR_STEP_EVENT));
}

/** Run `close` whenever the tour moves on. */
export function useCloseOnTourStep(close: () => void) {
  useEffect(() => {
    window.addEventListener(TOUR_STEP_EVENT, close);
    return () => window.removeEventListener(TOUR_STEP_EVENT, close);
  }, [close]);
}
