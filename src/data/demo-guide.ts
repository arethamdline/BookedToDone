/**
 * The guided path through the demo.
 *
 * The demo used to drop visitors onto the sample company's homepage with no
 * idea what they were looking at or what to do. These steps follow one job all
 * the way through, so the "nothing typed twice" moment actually lands.
 */

export type GuideStep = {
  /** Route this step applies to. Matched longest-prefix-first. */
  match: string;
  side: "customer" | "staff";
  title: string;
  body: string;
  /** Where "Next" goes, and what it says. Omit on the last step. */
  next?: { to: string; label: string };
  /** Where "Back" goes, so a visitor can re-read a step they skipped past. */
  back?: { to: string; label: string };
  /** The last step closes the demo out with a call to action. */
  finish?: boolean;
};

export const guideSteps: GuideStep[] = [
  {
    match: "/customer",
    side: "customer",
    title: "You're the customer",
    body: "This is a sample junk-removal company's website — the kind we'd build for you. Start a booking with “Get a photo estimate”.",
    next: { to: "/book", label: "Start a booking" },
  },
  {
    match: "/book",
    side: "customer",
    title: "Pick a photo and watch it price itself",
    body: "Choose one of the sample photos. The AI reads what's in the pile, labels each item, and comes back with a price range — then you check whether it missed anything.",
    next: { to: "/staff", label: "Now see the office" },
    back: { to: "/customer", label: "Back to the website" },
  },
  {
    match: "/portal",
    side: "customer",
    title: "The customer's own portal",
    body: "Where they track the job, approve changes and pay — without calling you.",
    next: { to: "/staff", label: "Now see the office" },
    back: { to: "/book", label: "Back to the booking" },
  },
  {
    match: "/staff/inbox",
    side: "staff",
    title: "One inbox",
    body: "Chat, phone, web and email land in a single thread per customer, with what the assistant already answered. That's the whole loop — one job, both sides, nothing typed twice.",
    back: { to: "/staff", label: "Back to the dashboard" },
    finish: true,
  },
  {
    match: "/staff",
    side: "staff",
    title: "Your office, already updated",
    body: "The booking you just made is here — address, items and price filled in. Zero fields typed by staff.",
    next: { to: "/staff/inbox", label: "See the inbox" },
    back: { to: "/book", label: "Back to the booking" },
  },
];

export function stepForPath(pathname: string): GuideStep | undefined {
  return [...guideSteps]
    .sort((a, b) => b.match.length - a.match.length)
    .find((s) => pathname === s.match || pathname.startsWith(`${s.match}/`));
}

export function stepNumber(step: GuideStep): { index: number; total: number } {
  const ordered = ["/customer", "/book", "/staff", "/staff/inbox"];
  const i = ordered.indexOf(step.match);
  return { index: i === -1 ? 1 : i + 1, total: ordered.length };
}
