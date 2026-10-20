import { useEffect } from "react";

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
