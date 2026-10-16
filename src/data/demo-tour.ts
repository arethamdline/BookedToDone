/**
 * The guided tour through the demo.
 *
 * Each step names one thing, points at the element that does it, and says what
 * to press. Where a step has a `target`, the page dims around that element and
 * pressing it is what advances the tour — so there is only ever one thing to
 * do, and it is the lit one.
 *
 * `target` is a CSS selector. When it matches something on screen the guide
 * lights it and shows a pointer; when it doesn't, the step falls back to the
 * card's own `action` button and still reads fine as plain instruction.
 */

export type TourStep = {
  id: string;
  /** Route this step belongs to. Entering the step navigates here. */
  route: string;
  side: "customer" | "staff";
  title: string;
  body: string;
  /** What to light up and point at. */
  target?: string;
  /** Said beside the pointer when there is a `target`. Keep it imperative. */
  prompt?: string;
  /** Label for the advance button on steps with nothing to press. */
  action?: string;
  /**
   * This step is read, not pressed — the tour moves on from the card's own
   * button, and that button shuts whatever dialog the step is inside first.
   */
  closesDialog?: boolean;
  /** The last step closes the tour out with a call to action. */
  finish?: boolean;
};

export const tour: TourStep[] = [
  {
    id: "site",
    route: "/customer",
    side: "customer",
    title: "You're the customer now",
    body: "This is a sample junk-removal company's website — the kind we'd build around your business. From here on you're following one real job, start to finish.",
    action: "Start the tour",
  },
  {
    id: "assistant",
    route: "/customer",
    side: "customer",
    title: "It answers at 9 pm",
    body: "Ask it anything and it replies from this company's own price list and service area. The message you'd have answered in the morning is a job someone else booked at 9:05 pm.",
    target: '[data-tour="assistant-card"]',
    prompt: "Ask it something — or tap one of the suggestions",
    action: "Now let's book a job",
  },
  {
    id: "start-booking",
    route: "/customer",
    side: "customer",
    title: "No long form to fill in",
    body: "Your customer doesn't type out an inventory. They send a photo of the pile and the system does the rest.",
    target: '[data-tour="photo-cta"]',
    prompt: "Press “Get a photo estimate”",
  },
  {
    id: "photo",
    route: "/book",
    side: "customer",
    title: "A photo becomes a price",
    body: "The AI reads what's actually in the shot, boxes each item and comes back with a range. No site visit, no phone tag.",
    target: '[data-tour="photo-samples"]',
    prompt: "Pick a photo and watch it read the pile",
    action: "Next: did we miss anything?",
  },
  {
    id: "missed",
    route: "/book",
    side: "customer",
    title: "Nothing gets guessed at",
    body: "Before anything is booked it asks whether it missed something, and the customer can add an item straight in. The list stays theirs, so the price isn't a surprise on the day.",
    target: '[data-tour="scan-actions"]',
    prompt: "Confirm the list, or add what it missed",
    action: "Next: holding the slot",
  },
  {
    id: "deposit",
    route: "/book",
    side: "customer",
    title: "A held slot, not a maybe",
    body: "They pick a window your crew can actually cover and leave a deposit, credited against the bill. That's the booking done — on their phone, at any hour.",
    target: '[data-tour="deposit"]',
    prompt: "Take the deposit to finish the booking",
    action: "Now see your office",
  },
  {
    id: "dashboard",
    route: "/staff",
    side: "staff",
    title: "Your office already has it",
    body: "Same job, your side. Address, items, window and price are already filled in — every one of them came from the customer. Nobody in your office typed a thing.",
    target: '[data-tour="needs-attention"]',
    prompt: "Open the booking that just came in",
  },
  {
    id: "job-card",
    route: "/staff",
    side: "staff",
    title: "Nothing on this card was typed",
    body: "Address, items, pickup window, the quote, even which channel they came in on — all of it arrived with the booking. Your office keyed in none of it.",
    target: '[data-tour="booking-detail"]',
    prompt: "Read down the card",
    action: "Close it and carry on",
    closesDialog: true,
  },
  {
    id: "summary",
    route: "/staff",
    side: "staff",
    title: "Your week, written up",
    body: "Jobs booked, what they're worth, what's still unpaid — summarised in plain English, with the charts underneath when you want the detail.",
    target: '[data-tour="ai-summary"]',
    prompt: "Read this week's summary",
    action: "Next: the inbox",
  },
  {
    id: "assistant-staff",
    route: "/staff",
    side: "staff",
    title: "Ask your own records",
    body: '"Who hasn\'t paid?" "What\'s on today?" It answers from your bookings, and says so when it can\'t — it never invents a number.',
    target: '[data-tour="office-assistant"]',
    prompt: "Ask it about your jobs",
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

/**
 * Where to pick the tour up when the visitor moves themselves — switching sides
 * from the demo bar, say. Returns the step for `pathname` closest to where they
 * already are: the last one they'd have seen going back, the first one they
 * haven't going forward. Jumping someone on step 9 back to step 1 for a quick
 * look at the other side would throw away everything they'd done.
 */
export function nearestStepForRoute(pathname: string, from: number): number {
  const matches = tour.reduce<number[]>(
    (acc, s, i) => (s.route === pathname ? [...acc, i] : acc),
    [],
  );
  if (matches.length === 0) return -1;
  const behind = matches.filter((i) => i <= from);
  return behind.length > 0 ? behind[behind.length - 1]! : matches[0]!;
}
