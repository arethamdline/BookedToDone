/**
 * The guided tour through the demo.
 *
 * This replaces a four-step, route-matched guide that only said "you're on the
 * customer side" / "you're on the staff side" and left the visitor to find
 * everything themselves. Each step now names one thing, points at the element
 * that does it, and says what to press.
 *
 * `target` is a CSS selector. When it matches something on screen the guide
 * rings it and shows a "tap here" pointer; when it doesn't, the step still
 * reads fine as plain instruction.
 */

export type TourStep = {
  id: string;
  /** Route this step belongs to. Entering the step navigates here. */
  route: string;
  side: "customer" | "staff";
  title: string;
  body: string;
  /** What to ring and point at. */
  target?: string;
  /** Label for the advance button when the visitor should act first. */
  action?: string;
  /** The last step closes the tour out with a call to action. */
  finish?: boolean;
};

export const tour: TourStep[] = [
  {
    id: "site",
    route: "/customer",
    side: "customer",
    title: "This is your customer's view",
    body: "A sample junk-removal company's website — the kind we'd build around your business. Everything from here on is one real job, start to finish.",
    action: "Show me the AI",
  },
  {
    id: "assistant",
    route: "/customer",
    side: "customer",
    title: "It answers at 9 pm",
    body: "Ask anything and the assistant replies from this company's own price list and service area. A missed call is a job someone else books.",
    target: '[data-tour="assistant-card"]',
    action: "Now let's book a job",
  },
  {
    id: "start-booking",
    route: "/customer",
    side: "customer",
    title: "Start the booking",
    body: "Your customer doesn't fill in a long form. They send a photo.",
    target: '[data-tour="photo-cta"]',
    action: "Open the booking",
  },
  {
    id: "photo",
    route: "/book",
    side: "customer",
    title: "A photo becomes a price",
    body: "Pick one of the sample photos. The AI reads what's in the pile, labels each item and comes back with a range — no site visit, no phone tag.",
    target: '[data-tour="photo-samples"]',
    action: "I've seen the scan",
  },
  {
    id: "missed",
    route: "/book",
    side: "customer",
    title: "Nothing gets guessed at",
    body: "Before anything is booked it asks whether it missed something, and the customer can type an extra item straight in. The list stays theirs.",
    target: "#missed-item",
    action: "Next: the slot",
  },
  {
    id: "deposit",
    route: "/book",
    side: "customer",
    title: "A held slot, not a maybe",
    body: "They pick a window your crew can actually cover and leave a $50 deposit, credited against the bill. That's the booking done — on their phone, at any hour.",
    action: "Now see your office",
  },
  {
    id: "dashboard",
    route: "/staff",
    side: "staff",
    title: "Your office already has it",
    body: "The booking is here — address, items, window and price. Every field tagged AUTO came from the customer. Nobody in your office typed a thing.",
    action: "What else is on this screen?",
  },
  {
    id: "summary",
    route: "/staff",
    side: "staff",
    title: "Your week, written up",
    body: "Jobs booked, what they're worth, what's still unpaid — summarised in plain English, with the charts underneath if you want the detail.",
    target: '[data-tour="ai-summary"]',
    action: "Next: the inbox",
  },
  {
    id: "assistant-staff",
    route: "/staff",
    side: "staff",
    title: "Ask your own records",
    body: '"Who hasn\'t paid?" "What\'s on today?" It answers from your bookings, and says so when it can\'t — it never invents a number.',
    target: '[data-tour="office-assistant"]',
    action: "Last stop",
  },
  {
    id: "inbox",
    route: "/staff/inbox",
    side: "staff",
    title: "One inbox, every channel",
    body: "Chat, phone, web and email land in a single thread per customer, with what the assistant already answered. One screen instead of four.",
    finish: true,
  },
];

export const tourLength = tour.length;

export function stepIndexForRoute(pathname: string, from = 0): number {
  const exact = tour.findIndex((s, i) => i >= from && s.route === pathname);
  if (exact !== -1) return exact;
  return tour.findIndex((s) => s.route === pathname);
}
