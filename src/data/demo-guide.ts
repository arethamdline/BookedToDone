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
  next?: { to: string; label: string; section?: string };
  /** Where "Back" goes, so a visitor can re-read a step they skipped past. */
  back?: { to: string; label: string; section?: string };
  section?: string;
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
    title: "Every channel. One inbox.",
    body: "See Website, WhatsApp, SMS, and Facebook/Instagram conversations together. Replies are simulated; the Website example shows an AI-to-human handoff with context preserved.",
    back: { to: "/staff", section: "Payments", label: "Back to payment tracking" },
    finish: true,
  },
  {
    match: "/staff",
    side: "staff",
    section: "Overview",
    title: "Your office, already updated",
    body: "The customer booking appears here automatically with contact details, pickup address, detected items, and estimate. Ask AI for a live booking summary or business insight from this demo data.",
    next: { to: "/staff", section: "Bookings", label: "Review and edit a booking" },
    back: { to: "/book", label: "Back to the booking" },
  },
  {
    match: "/staff",
    side: "staff",
    section: "Bookings",
    title: "Override details when plans change",
    body: "Open the customer-submitted booking, choose Edit booking, then update customer details, items, schedule, crew, truck, or price. Save changes keeps the original estimate for comparison.",
    next: { to: "/staff", section: "Payments", label: "Track job and payment" },
    back: { to: "/staff", section: "Overview", label: "Back to the dashboard" },
  },
  {
    match: "/staff",
    side: "staff",
    section: "Payments",
    title: "Track jobs and payments",
    body: "Follow each job from estimate through completion, review pending balances, and record a simulated payment. Changes remain in the shared demo booking data.",
    next: { to: "/staff/inbox", label: "Open the centralized inbox" },
    back: { to: "/staff", section: "Bookings", label: "Back to booking edits" },
  },
];

export function stepForPath(pathname: string, section = "Overview"): GuideStep | undefined {
  if (pathname === "/staff")
    return guideSteps.find((step) => step.match === pathname && step.section === section);
  return [...guideSteps]
    .sort((a, b) => b.match.length - a.match.length)
    .find((s) => pathname === s.match || pathname.startsWith(`${s.match}/`));
}

export function stepNumber(step: GuideStep): { index: number; total: number } {
  const ordered = [
    "/customer",
    "/book",
    "/staff:Overview",
    "/staff:Bookings",
    "/staff:Payments",
    "/staff/inbox",
  ];
  const key = step.match === "/staff" ? `${step.match}:${step.section}` : step.match;
  const i = ordered.indexOf(key);
  return { index: i === -1 ? 1 : i + 1, total: ordered.length };
}
