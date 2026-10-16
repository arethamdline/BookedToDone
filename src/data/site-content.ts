/**
 * Marketing-site content for the Booked to Done company site.
 *
 * This is site copy, not prototype business records — the job/customer/pricing
 * data that the demo app runs on stays in `mock-data.ts` per AGENTS.md.
 */

import {
  BadgeCheck,
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck,
  CalendarDays,
  Camera,
  ClipboardList,
  CreditCard,
  Inbox,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type FeatureSide = "customer" | "staff";

export type Feature = {
  slug: string;
  side: FeatureSide;
  /** Short label used on the map tile. */
  title: string;
  /** One line under the tile title. */
  tagline: string;
  /** Shown beside the title so the list can be skimmed. */
  icon: LucideIcon;
  /** The slug of the tile this one is wired to on the other side. */
  partner: string;
  /** The pain, in one line. */
  problem: string;
  /** What the feature does. Exactly three. */
  does: [string, string, string];
  /**
   * One proof number. These are definitional or taken from the demo script —
   * deliberately not invented market statistics.
   */
  proof: { value: string; label: string };
  /** "Where it goes next" — the result landing on the other side. */
  next: { title: string; line: string };
  frame: "phone" | "laptop";
};

export const features: Feature[] = [
  {
    slug: "ai-assistant",
    side: "customer",
    title: "AI assistant, 24/7",
    tagline: "Answers at 9 pm, in your prices.",
    icon: Bot,
    partner: "inbox",
    problem: "The message you don't see until morning is the job someone else booked at 9:05 pm.",
    does: [
      "Answers from your price list and service area — not a generic chatbot.",
      "Books the job outright, or captures the lead with the full conversation attached.",
      "Says when it doesn't know, and hands the thread to you instead of guessing.",
    ],
    proof: { value: "24/7", label: "replies without hiring" },
    next: {
      title: "Lands in your inbox",
      line: "The thread arrives as a lead with the address, the items discussed and the quoted range already filled in.",
    },
    frame: "phone",
  },
  {
    slug: "photo-estimate",
    side: "customer",
    title: "AI photo estimate",
    tagline: "A photo becomes a price range.",
    icon: Camera,
    partner: "job-card",
    problem:
      "Every quote costs you a site visit or a long back-and-forth about what's in the pile.",
    does: [
      "The customer photographs the pile; the items come back labeled.",
      "Returns a range, not a number you have to defend.",
      "Asks 'did we miss anything?' before anything is booked, so the list is theirs too.",
    ],
    proof: { value: "60 sec", label: "from photo to price range" },
    next: {
      title: "Becomes the job card",
      line: "The item list, the photos and the range arrive as a job card nobody had to retype.",
    },
    frame: "phone",
  },
  {
    slug: "booking-deposit",
    side: "customer",
    title: "Booking + deposit",
    tagline: "A held slot, not a maybe.",
    icon: CalendarCheck,
    partner: "schedule",
    problem: "A booking with nothing behind it is a slot you're holding for free.",
    does: [
      "Shows the windows your crew can actually cover, not a blank calendar.",
      "Takes a deposit at booking, credited against the final bill.",
      "Confirms by text and email the moment it's taken.",
    ],
    proof: { value: "$50", label: "deposit holds the slot" },
    next: {
      title: "Appears on the schedule",
      line: "The job drops onto the day with the deposit already recorded against it.",
    },
    frame: "phone",
  },
  {
    slug: "reminders",
    side: "customer",
    title: "Reminders + on-my-way",
    tagline: "They know when you're coming.",
    icon: BellRing,
    partner: "crew-app",
    problem: "Half your phone time is customers asking where the truck is.",
    does: [
      "Sends the two-hour window the day before, automatically.",
      "Fires an on-my-way text when the crew marks themselves en route.",
      "Lets the customer reschedule from the text instead of calling you.",
    ],
    proof: { value: "2-hour", label: "window, texted on its own" },
    next: {
      title: "Driven by the crew app",
      line: "One tap on 'En route' by the crew is what sends it — nobody types the message.",
    },
    frame: "phone",
  },
  {
    slug: "price-approval",
    side: "customer",
    title: "On-site price approval",
    tagline: "The change is agreed, in writing.",
    icon: BadgeCheck,
    partner: "payments",
    problem: "The pile is bigger than the photo, and now it's an argument in a driveway.",
    does: [
      "The crew adds the extra item; the new total appears on the customer's phone.",
      "Shows the original and updated price side by side on the customer's phone.",
      "The job only moves forward once they tap approve.",
    ],
    proof: { value: "$309 → $374", label: "approved on their phone" },
    next: {
      title: "Rewrites the invoice",
      line: "The approved amount becomes the invoice total, with the change and the timestamp on the record.",
    },
    frame: "phone",
  },
  {
    slug: "tap-to-pay",
    side: "customer",
    title: "Tap to pay + review",
    tagline: "Paid before the truck pulls away.",
    icon: CreditCard,
    partner: "owner-dashboard",
    problem: "The work is done, the money is thirty days out, and you're the one chasing it.",
    does: [
      "Takes the remaining balance on site, with the deposit already deducted.",
      "Emails the receipt itself, with the item list on it.",
      "Asks for the review while the driveway is still empty.",
    ],
    proof: { value: "$324", label: "collected before the truck leaves" },
    next: {
      title: "Counts on the dashboard",
      line: "The payment lands in the week's numbers without anyone opening a spreadsheet.",
    },
    frame: "phone",
  },

  {
    slug: "inbox",
    side: "staff",
    title: "One inbox",
    tagline: "Chat, phone, web and email, one thread.",
    icon: Inbox,
    partner: "ai-assistant",
    problem: "The same customer reaches you four ways and you piece the story together each time.",
    does: [
      "Every channel lands in one thread per customer, in order.",
      "Shows what the assistant already answered, so you don't repeat it.",
      "Take over mid-conversation whenever you want the human touch.",
    ],
    proof: { value: "4 channels", label: "in a single thread" },
    next: {
      title: "Came from the assistant",
      line: "The conversation that filled this thread happened while you were asleep.",
    },
    frame: "laptop",
  },
  {
    slug: "job-card",
    side: "staff",
    title: "Self-filling job card",
    tagline: "Zero fields typed by staff.",
    icon: ClipboardList,
    partner: "photo-estimate",
    problem: "Everything the customer already told you gets typed again, by you.",
    does: [
      "Address, items, photos, window and price arrive already filled.",
      "Auto-filled fields are tagged, so you can see what you never touched.",
      "Edit anything — your change becomes the record, with the original kept.",
    ],
    proof: { value: "0 fields", label: "typed by staff" },
    next: {
      title: "Came from the photo estimate",
      line: "The customer's photos and confirmed item list are what filled it.",
    },
    frame: "laptop",
  },
  {
    slug: "schedule",
    side: "staff",
    title: "Schedule by truck and crew",
    tagline: "The day, on one screen.",
    icon: CalendarDays,
    partner: "booking-deposit",
    problem: "The day lives in a whiteboard, a group chat and your head.",
    does: [
      "Drag a job onto a truck; the crew sees it immediately.",
      "Flags the loads a truck can't physically take before you promise them.",
      "Reorder the stops and every customer's window updates with it.",
    ],
    proof: { value: "1 drag", label: "from inbox to truck" },
    next: {
      title: "Came from the booking",
      line: "The customer picked this window themselves, with the deposit attached.",
    },
    frame: "laptop",
  },
  {
    slug: "crew-app",
    side: "staff",
    title: "Crew app",
    tagline: "The phone in the truck.",
    icon: Truck,
    partner: "reminders",
    problem: "Your crew calls you for the details, and calls you again with the changes.",
    does: [
      "The stop list, the address and the photos, on their phone.",
      "One tap marks en route, on site and done.",
      "Add an item on site and the updated price moves with it.",
    ],
    proof: { value: "+$65", label: "added on site, priced instantly" },
    next: {
      title: "Texts the customer",
      line: "Marking 'en route' is what sends the on-my-way message. No one writes it.",
    },
    frame: "phone",
  },
  {
    slug: "payments",
    side: "staff",
    title: "Payments + follow-ups",
    tagline: "Invoices that chase themselves.",
    icon: Receipt,
    partner: "price-approval",
    problem: "Unpaid jobs sit there until you remember to go looking for them.",
    does: [
      "Deposit, approved changes and balance land on one invoice automatically.",
      "Unpaid balances send their own reminders on your schedule.",
      "Shows what's owed today without you building a report.",
    ],
    proof: { value: "0", label: "invoices chased by hand" },
    next: {
      title: "Came from the approval",
      line: "The total here is the one the customer tapped to approve in the driveway.",
    },
    frame: "laptop",
  },
  {
    slug: "owner-dashboard",
    side: "staff",
    title: "Owner dashboard",
    tagline: "Your week, written up by AI.",
    icon: BarChart3,
    partner: "tap-to-pay",
    problem: "You find out how the week went once it's already over.",
    does: [
      "Jobs, revenue and what's still owed, as it happens.",
      "A weekly summary in plain English — what moved, what slipped, what to watch.",
      "Where the jobs came from, so you stop guessing which channel pays.",
    ],
    proof: { value: "1 page", label: "the whole week" },
    next: {
      title: "Built from the payments",
      line: "Every tap-to-pay on site is a line in this number. Nothing is keyed in.",
    },
    frame: "laptop",
  },
];

export const customerFeatures = features.filter((f) => f.side === "customer");
export const staffFeatures = features.filter((f) => f.side === "staff");

export function getFeature(slug: string) {
  return features.find((f) => f.slug === slug);
}

/** The six pains from the demo video, each pointing at the thing that fixes it. */
export const problems: { label: string; slug: string }[] = [
  { label: "Enquiries you reply to late", slug: "ai-assistant" },
  { label: "Slow quotes", slug: "photo-estimate" },
  { label: "Endless texting", slug: "reminders" },
  { label: "Bookings that fall through", slug: "booking-deposit" },
  { label: "Re-entering the same details", slug: "job-card" },
  { label: "Chasing payments", slug: "payments" },
];

/** "Start where it hurts" — the three ways in. */
export const entryPaths = [
  {
    title: "Add one feature",
    body: "Keep everything you run today. We bolt on the one piece that's costing you jobs — usually the assistant or the photo quote.",
    detail: "Keep your current tools",
  },
  {
    title: "Upgrade your setup",
    body: "We connect what you already use — your calendar, your website, your payment processor — so the pieces stop living apart.",
    detail: "Connect what you have",
  },
  {
    title: "The full system",
    body: "Customer side and office side, built as one. The customer books, the crew gets it done, and nothing is typed twice.",
    detail: "Both sides, wired together",
  },
];

export const howWeWork = [
  {
    step: "01",
    title: "A 30-minute call",
    body: "You tell us how the work actually runs.",
  },
  {
    step: "02",
    title: "We hear about your problem",
    body: "What's costing you jobs, in your words.",
  },
  {
    step: "03",
    title: "We build tailored to your solution",
    body: "Your prices, your trucks, your service area.",
  },
  {
    step: "04",
    title: "Continued support",
    body: "We keep changing and updating the system so it flows with how your team actually works. No end date.",
  },
];

export const contactEmail = "bookedtodone@gmail.com";

/** Paste the Calendly / Cal.com URL here and every booking button goes live. */
export const BOOKING_URL: string | null = "https://calendly.com/bookedtodone/30min";

export function mailtoFor(subject: string, prospect?: string) {
  const body = prospect ? `Hi Jerry,\n\nI'm with ${prospect}. ` : "Hi Jerry,\n\n";
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function bookingHrefFor(subject: string, prospect?: string) {
  if (!BOOKING_URL) return mailtoFor(subject, prospect);
  if (!prospect) return BOOKING_URL;

  const url = new URL(BOOKING_URL);
  url.searchParams.set("prospect", prospect);
  return url.toString();
}
