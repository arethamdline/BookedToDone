/**
 * Short, clickable walkthroughs for each feature page.
 *
 * Every demo is 3–4 taps and shows one job moving. Numbers follow the demo
 * script throughout: $289–349 quote, $50 deposit, +$65 mattress, $309 → $374,
 * $324 balance. Nothing here is a real transaction.
 */

export type Line =
  | { k: "chat"; who: "them" | "ai" | "you"; text: string; tag?: string }
  | { k: "row"; label: string; value: string; auto?: boolean }
  | { k: "banner"; text: string; tone: "ai" | "done" | "warn" }
  | { k: "big"; label: string; value: string; note?: string }
  | { k: "item"; text: string; done?: boolean }
  | { k: "title"; text: string }
  /**
   * The real sample photo with its real detection boxes, the same scan the
   * booking flow runs. `boxes: false` shows the bare photo, for the step
   * before the AI has read it.
   */
  | { k: "scan"; sample: number; boxes?: boolean };

export type Step = {
  lines: Line[];
  /** Label on the button that advances. Omitted on the final step. */
  action?: string;
};

export const featureDemos: Record<string, Step[]> = {
  "ai-assistant": [
    {
      lines: [
        { k: "title", text: "Sample Junk Co. · 9:14 pm" },
        { k: "chat", who: "them", text: "Can you take a hot tub Saturday?" },
      ],
      action: "See the reply",
    },
    {
      lines: [
        { k: "title", text: "Sample Junk Co. · 9:14 pm" },
        { k: "chat", who: "them", text: "Can you take a hot tub Saturday?" },
        {
          k: "chat",
          who: "ai",
          text: "Yes — Saturday 8 AM to 4 PM. Hot tubs are priced from a photo since access changes the job. Send one and I'll price it now.",
          tag: "AI answer · from your price list",
        },
      ],
      action: "Send a photo",
    },
    {
      lines: [
        { k: "title", text: "Sample Junk Co. · 9:15 pm" },
        { k: "chat", who: "them", text: "📷 Photo sent" },
        {
          k: "chat",
          who: "ai",
          text: "Two-person job, side-gate access. $289–349. Saturday 10 AM–12 PM is open — shall I hold it?",
          tag: "AI answer · from your price list",
        },
      ],
      action: "Customer says yes",
    },
    {
      lines: [
        { k: "banner", text: "Lead created in your inbox", tone: "done" },
        { k: "row", label: "Customer", value: "M. Alvarez", auto: true },
        { k: "row", label: "Job", value: "Hot tub removal", auto: true },
        { k: "row", label: "Quoted", value: "$289–349", auto: true },
        { k: "row", label: "You were", value: "asleep" },
      ],
    },
  ],

  /*
   * Driven by the real sample photo. The items and the price come from
   * `photo-samples.ts`, the same list the booking flow scans: 3 chairs, a metal
   * tub, a wooden table and a bench seat, $195 — plus the $65 mattress the
   * customer adds here, so $260 before the range.
   */
  "photo-estimate": [
    {
      lines: [
        { k: "title", text: "Your photo" },
        { k: "scan", sample: 0, boxes: false },
        { k: "banner", text: "Reading the photo…", tone: "ai" },
      ],
      action: "See what it found",
    },
    {
      lines: [
        { k: "title", text: "What we found" },
        { k: "scan", sample: 0 },
        { k: "item", text: "3 × Chair", done: true },
        { k: "item", text: "1 × Wooden table", done: true },
        { k: "item", text: "1 × Bench seat", done: true },
        { k: "item", text: "1 × Metal tub", done: true },
      ],
      action: "Did it miss anything?",
    },
    {
      lines: [
        { k: "title", text: "Add what we missed" },
        { k: "item", text: "3 × Chair", done: true },
        { k: "item", text: "1 × Wooden table", done: true },
        { k: "item", text: "1 × Bench seat", done: true },
        { k: "item", text: "1 × Metal tub", done: true },
        { k: "chat", who: "you", text: "there's a mattress inside too" },
      ],
      action: "Add it",
    },
    {
      lines: [
        { k: "item", text: "1 × Mattress — added by you", done: true },
        {
          k: "big",
          label: "Your estimate",
          value: "$260–312",
          note: "A range, not a number you'll be held to.",
        },
        { k: "banner", text: "Sent to the office as a job card", tone: "done" },
      ],
    },
  ],
  "booking-deposit": [
    {
      lines: [
        { k: "title", text: "Pick a window" },
        { k: "item", text: "Sat 8 AM – 10 AM" },
        { k: "item", text: "Sat 10 AM – 12 PM" },
        { k: "item", text: "Sat 12 PM – 2 PM — full" },
      ],
      action: "Pick 10 AM – 12 PM",
    },
    {
      lines: [
        { k: "row", label: "Pickup", value: "Sat 10 AM – 12 PM", auto: true },
        { k: "row", label: "Estimate", value: "$289–349", auto: true },
        { k: "big", label: "Due now", value: "$50", note: "Credited against your final bill." },
      ],
      action: "Pay the deposit",
    },
    {
      lines: [
        { k: "banner", text: "Slot held · $50 deposit paid", tone: "done" },
        { k: "row", label: "On your schedule", value: "Sat 10 AM", auto: true },
        { k: "row", label: "Staff typing", value: "none" },
      ],
    },
  ],

  reminders: [
    {
      lines: [
        { k: "title", text: "Day before the job" },
        { k: "row", label: "Job", value: "Sat 10 AM – 12 PM" },
        { k: "row", label: "Customer", value: "M. Alvarez" },
      ],
      action: "Send the reminder",
    },
    {
      lines: [
        {
          k: "chat",
          who: "ai",
          text: "Reminder: your pickup is tomorrow, Sat 10 AM–12 PM. Reply R to reschedule.",
          tag: "Sent automatically",
        },
      ],
      action: "Crew taps 'En route'",
    },
    {
      lines: [
        {
          k: "chat",
          who: "ai",
          text: "On our way — about 12 minutes out.",
          tag: "Triggered by the crew app",
        },
        { k: "banner", text: "Nobody wrote that message", tone: "done" },
      ],
    },
  ],

  "price-approval": [
    {
      lines: [
        { k: "title", text: "On site" },
        { k: "row", label: "Agreed price", value: "$309" },
        { k: "row", label: "Found", value: "one extra mattress", auto: true },
      ],
      action: "Crew adds the mattress",
    },
    {
      lines: [
        { k: "row", label: "Original", value: "$309" },
        { k: "row", label: "Mattress", value: "+$65", auto: true },
        { k: "big", label: "New total", value: "$374", note: "Waiting on the customer's phone." },
      ],
      action: "Customer taps approve",
    },
    {
      lines: [
        { k: "banner", text: "Approved — $309 → $374", tone: "done" },
        { k: "row", label: "Invoice", value: "updated", auto: true },
        { k: "row", label: "Argument in the driveway", value: "none" },
      ],
    },
  ],

  "tap-to-pay": [
    {
      lines: [
        { k: "title", text: "Job finished" },
        { k: "row", label: "Total", value: "$374" },
        { k: "row", label: "Deposit paid", value: "−$50", auto: true },
        { k: "big", label: "Balance due", value: "$324" },
      ],
      action: "Tap the card",
    },
    {
      lines: [
        { k: "banner", text: "Paid $324 — before the truck left", tone: "done" },
        { k: "row", label: "Receipt", value: "emailed", auto: true },
      ],
      action: "Ask for a review",
    },
    {
      lines: [
        { k: "chat", who: "ai", text: "Thanks! How did we do? ★★★★★", tag: "Sent automatically" },
        { k: "banner", text: "Counted in this week's numbers", tone: "done" },
      ],
    },
  ],

  inbox: [
    {
      lines: [
        { k: "title", text: "One inbox · 3 open" },
        { k: "item", text: "M. Alvarez — Website chat" },
        { k: "item", text: "J. Walker — Phone" },
        { k: "item", text: "E. Rodriguez — Email" },
      ],
      action: "Open M. Alvarez",
    },
    {
      lines: [
        { k: "title", text: "M. Alvarez · one thread" },
        { k: "chat", who: "them", text: "Can you take a hot tub Saturday?", tag: "Website chat" },
        {
          k: "chat",
          who: "ai",
          text: "Yes — $289–349. Saturday 10 AM is open.",
          tag: "AI answered at 9:14 pm",
        },
        { k: "chat", who: "them", text: "Can the crew call first?", tag: "Phone · this morning" },
      ],
      action: "Take over from the AI",
    },
    {
      lines: [
        { k: "banner", text: "You're replying — AI paused on this thread", tone: "done" },
        { k: "row", label: "Channels in this thread", value: "3", auto: true },
        { k: "row", label: "Screens you checked", value: "1" },
      ],
    },
  ],

  "job-card": [
    {
      lines: [
        { k: "title", text: "New job card" },
        { k: "row", label: "Customer", value: "—" },
        { k: "row", label: "Address", value: "—" },
        { k: "row", label: "Items", value: "—" },
      ],
      action: "Customer finishes booking",
    },
    {
      lines: [
        { k: "title", text: "Job #3 · new" },
        { k: "row", label: "Customer", value: "M. Alvarez", auto: true },
        { k: "row", label: "Address", value: "2204 Pine Grove Dr", auto: true },
        { k: "row", label: "Window", value: "Sat 10 AM – 12 PM", auto: true },
        { k: "row", label: "Items", value: "Sofa, mattress, 4 bags", auto: true },
      ],
      action: "Count what staff typed",
    },
    {
      lines: [
        {
          k: "big",
          label: "Typed by staff",
          value: "0",
          note: "Every tagged field came from the customer.",
        },
        { k: "banner", text: "Edit anything — your change becomes the record", tone: "done" },
      ],
    },
  ],

  schedule: [
    {
      lines: [
        { k: "title", text: "Saturday" },
        { k: "row", label: "Truck 01", value: "2 stops" },
        { k: "row", label: "Unassigned", value: "M. Alvarez", auto: true },
      ],
      action: "Drag onto Truck 01",
    },
    {
      lines: [
        { k: "title", text: "Truck 01 · Saturday" },
        { k: "item", text: "8 AM — J. Walker", done: true },
        { k: "item", text: "10 AM — M. Alvarez", done: true },
        { k: "item", text: "1 PM — E. Rodriguez", done: true },
      ],
      action: "Reorder the stops",
    },
    {
      lines: [
        { k: "banner", text: "Windows updated · customers notified", tone: "done" },
        { k: "row", label: "Crew sees it", value: "immediately", auto: true },
        { k: "row", label: "Calls you had to make", value: "0" },
      ],
    },
  ],

  "crew-app": [
    {
      lines: [
        { k: "title", text: "Your stops today" },
        { k: "item", text: "10 AM — 2204 Pine Grove Dr" },
        { k: "row", label: "Items", value: "Sofa, mattress, 4 bags" },
      ],
      action: "Tap 'En route'",
    },
    {
      lines: [
        { k: "banner", text: "Customer texted automatically", tone: "done" },
        { k: "title", text: "On site" },
        { k: "row", label: "Extra found", value: "1 mattress" },
      ],
      action: "Add it to the job",
    },
    {
      lines: [
        { k: "row", label: "Mattress", value: "+$65", auto: true },
        { k: "banner", text: "Sent to the customer's phone to approve", tone: "done" },
        { k: "row", label: "Calls to the office", value: "0" },
      ],
    },
  ],

  payments: [
    {
      lines: [
        { k: "title", text: "Invoice · M. Alvarez" },
        { k: "row", label: "Deposit", value: "−$50", auto: true },
        { k: "row", label: "Approved change", value: "+$65", auto: true },
        { k: "row", label: "Balance", value: "$324", auto: true },
      ],
      action: "Send the invoice",
    },
    {
      lines: [
        { k: "banner", text: "Invoice sent — built from the job, not typed", tone: "done" },
        { k: "title", text: "Still owed" },
        { k: "row", label: "J. Walker", value: "$138 · 9 days" },
      ],
      action: "Chase it",
    },
    {
      lines: [
        { k: "banner", text: "Reminder scheduled — and the next one too", tone: "done" },
        { k: "big", label: "Chased by hand", value: "0" },
      ],
    },
  ],

  "owner-dashboard": [
    {
      lines: [
        { k: "title", text: "This week" },
        { k: "row", label: "Jobs booked", value: "7" },
        { k: "row", label: "Booked value", value: "$879" },
        { k: "row", label: "Unpaid", value: "$138" },
      ],
      action: "Ask the AI for the week",
    },
    {
      lines: [
        {
          k: "banner",
          text: "7 jobs booked, worth $879. Thursday was busiest. Most work came through the website. One completed job is unpaid — $138.",
          tone: "ai",
        },
      ],
      action: "Where did they come from?",
    },
    {
      lines: [
        { k: "title", text: "By channel" },
        { k: "row", label: "Website", value: "3", auto: true },
        { k: "row", label: "Chat", value: "3", auto: true },
        { k: "row", label: "Phone", value: "1", auto: true },
        { k: "banner", text: "Stop guessing which channel pays", tone: "done" },
      ],
    },
  ],
};
