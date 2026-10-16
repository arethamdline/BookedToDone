import type { SupportConversation } from "@/lib/support-types";
import { company } from "@/data/company";
export const statuses = [
  "Requested",
  "Needs Quote",
  "Quoted",
  "Confirmed",
  "Assigned",
  "En Route",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;
export const sources = ["Website", "Chat", "Phone", "Email"] as const;
export type JobStatus = (typeof statuses)[number];
export type BookingSource = (typeof sources)[number];
export type Item = { id: string; name: string; category: string; price: number; volume: number };
export type Pricing = {
  items: Item[];
  minimum: number;
  tiers: { name: string; volume: number; price: number }[];
  stairs: number;
  parking: number;
  heavy: number;
};
export type Communication = {
  id: string;
  at: string;
  channel: "Email" | "SMS" | "Phone" | "Note" | "Chat";
  text: string;
  status: "Simulated" | "Recorded";
};
export type PhotoRef = { id: string; name: string; type: string; size: number };
export type QuoteRevision = {
  id: string;
  at: string;
  amount: number;
  reason: string;
  author: string;
  kind: "Quote" | "Final charge";
  approved: boolean;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferred: "Email" | "SMS" | "Phone";
  notes: string;
};
export type Job = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  items: Record<string, number>;
  volume: number;
  loadSize: number;
  date: string;
  window: string;
  stairs: number;
  parking: boolean;
  heavy: boolean;
  notes: string;
  preferred: "Email" | "SMS" | "Phone";
  source: BookingSource;
  status: JobStatus;
  mode: "standard" | "custom";
  project: string;
  otherItem: string;
  access:
    | "Outside / curbside"
    | "Inside on the ground floor"
    | "Upstairs with elevator"
    | "Upstairs without elevator";
  floor: number;
  closeParking: "Yes" | "No" | "Not sure";
  difficult: "Yes" | "No" | "Not sure";
  photos: PhotoRef[];
  submissionKey: string;
  originalEstimate: number | null;
  quotedAmount: number | null;
  finalCharge: number | null;
  quoteApproved: boolean;
  quoteHistory: QuoteRevision[];
  estimate: number | null;
  priceLines: { label: string; amount: number }[];
  crew: string;
  truck: string;
  order: number;
  payment: "Unpaid" | "Paid" | "Refunded";
  invoice: string;
  communications: Communication[];
  createdAt: string;
};
export type Crew = { id: string; name: string; members: string; available: boolean };
export type Truck = { id: string; name: string; capacity: number; available: boolean };
export type DemoData = {
  version: 2;
  jobs: Job[];
  pricing: Pricing;
  crews: Crew[];
  trucks: Truck[];
  customers: Customer[];
};
export const windows = [
  "8:00 AM–10:00 AM",
  "10:00 AM–12:00 PM",
  "12:00 PM–2:00 PM",
  "2:00 PM–4:00 PM",
  "4:00 PM–6:00 PM",
];
export const services = [
  "Furniture",
  "Appliances",
  "Electronics",
  "General junk",
  "Office cleanouts",
  "Construction debris",
];
export const defaultPricing: Pricing = company.pricing;
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const dateLabel = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const money = (n: number | null | undefined) =>
  n == null
    ? "Quote pending"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
export const blankJob = (): Job => ({
  id: "",
  customerId: "",
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "Austin",
  state: "TX",
  zip: "",
  items: {},
  volume: 0,
  loadSize: 0,
  date: today(),
  window: windows[0]!,
  stairs: 0,
  parking: false,
  heavy: false,
  notes: "",
  preferred: "Email",
  source: "Website",
  status: "Requested",
  mode: "standard",
  project: "",
  otherItem: "",
  access: "Outside / curbside",
  floor: 1,
  closeParking: "Yes",
  difficult: "No",
  photos: [],
  submissionKey: "",
  originalEstimate: null,
  quotedAmount: null,
  finalCharge: null,
  quoteApproved: false,
  quoteHistory: [],
  estimate: 0,
  priceLines: [],
  crew: "",
  truck: "",
  order: 0,
  payment: "Unpaid",
  invoice: "",
  communications: [],
  createdAt: "",
});
export function seedData(): DemoData {
  const crews: Crew[] = [
    { id: "c1", name: "Green Team", members: "Marcus Reed · Jamie Park", available: true },
    { id: "c2", name: "Lime Team", members: "Sofia Diaz · Ethan Brooks", available: true },
    { id: "c3", name: "Oak Team", members: "Noah Wilson · Ava Chen", available: false },
  ];
  const trucks: Truck[] = [
    { id: "t1", name: "Truck 01 · Ford F-550", capacity: 16, available: true },
    { id: "t2", name: "Truck 02 · Isuzu NPR", capacity: 12, available: true },
    { id: "t3", name: "Truck 03 · Service", capacity: 16, available: false },
  ];
  const people = [
    ["Olivia Bennett", "1420 S Congress Ave", "78704"],
    ["James Walker", "2210 E Cesar Chavez St", "78702"],
    ["Emma Rodriguez", "4800 Burnet Rd", "78756"],
    ["Michael Davis", "310 W 5th St", "78701"],
    ["Sophia Miller", "6200 S 1st St", "78745"],
    ["Daniel Thompson", "900 W 6th St", "78703"],
  ];
  const jobs = people.map((p, i): Job => ({
    ...blankJob(),
    id: `SJ-100${i + 1}`,
    customerId: `customer-${i}`,
    name: p[0]!,
    email: `${p[0]!.split(" ")[0]!.toLowerCase()}@example.com`,
    phone: `(512) 555-01${String(i).padStart(2, "0")}`,
    street: p[1]!,
    zip: p[2]!,
    items: i % 2 ? { desk: 2, bags: 4 } : { sofa: 1, mattress: 1 },
    volume: i % 2 ? 4 : 4.5,
    loadSize: i % 2 ? 4 : 4.5,
    window: windows[i % 5]!,
    source: sources[i % 4]!,
    status: (
      ["Assigned", "Requested", "Quoted", "Completed", "En Route", "Cancelled"] as JobStatus[]
    )[i]!,
    estimate: i % 2 ? 138 : 150,
    originalEstimate: i % 2 ? 138 : 150,
    quotedAmount: i === 2 ? 165 : null,
    quoteHistory:
      i === 2
        ? [
            {
              id: "sample-quote",
              at: new Date().toISOString(),
              amount: 165,
              reason: "Customer added a small item after the original estimate.",
              author: "Sarah Carter",
              kind: "Quote",
              approved: false,
            },
          ]
        : [],
    finalCharge: i === 3 ? 138 : null,
    priceLines:
      i % 2
        ? [
            { label: "2 × Office desk", amount: 90 },
            { label: "4 × Bag of general junk", amount: 48 },
          ]
        : [
            { label: "1 × Sofa", amount: 85 },
            { label: "1 × Mattress", amount: 65 },
          ],
    crew: i === 0 || i === 4 ? "c1" : i === 3 ? "c2" : "",
    truck: i === 0 || i === 4 ? "t1" : i === 3 ? "t2" : "",
    order: i,
    payment: i === 3 ? "Paid" : "Unpaid",
    invoice: i === 3 ? "INV-SJ-1004" : "",
    createdAt: new Date().toISOString(),
    communications: [
      {
        id: `seed-${i}`,
        at: new Date().toISOString(),
        channel: "Email",
        text: "Booking request received. Demo confirmation.",
        status: "Simulated",
      },
    ],
  }));
  jobs.push({
    ...blankJob(),
    id: "SJ-1007",
    customerId: "customer-0",
    name: jobs[0]!.name,
    email: jobs[0]!.email,
    phone: jobs[0]!.phone,
    street: "1420 S Congress Ave",
    zip: "78704",
    mode: "custom",
    project: "Garage cleanout with shelving, old boxes, and several bulky pieces.",
    status: "Needs Quote",
    estimate: null,
    originalEstimate: null,
    source: "Chat",
    createdAt: new Date().toISOString(),
    communications: [
      {
        id: "garage-chat",
        at: new Date().toISOString(),
        channel: "Chat",
        status: "Recorded",
        text: "Customer: I need help clearing my garage. Assistant: Let’s request a custom quote and review your pickup details.",
      },
    ],
  });
  const customers = jobs
    .filter((j, i, a) => a.findIndex((x) => x.customerId === j.customerId) === i)
    .map((j) => ({
      id: j.customerId,
      name: j.name,
      email: j.email,
      phone: j.phone,
      preferred: j.preferred,
      notes: "",
    }));
  return { version: 2, jobs, pricing: structuredClone(defaultPricing), crews, trucks, customers };
}
export function createSupportConversations(now = Date.now()): SupportConversation[] {
  return [
    {
      id: "web-james",
      threadId: "pickup-demo",
      customer: "James Walker",
      contact: "james@example.com",
      channel: "website",
      status: "needs_staff",
      assignee: "",
      subject: "Desk pickup and access question",
      summary:
        "Website chat: two office desks and four bags. Customer asked about elevator access.",
      bookingId: "SJ-1002",
      lastCustomerAt: now,
      unread: true,
      messages: [
        {
          id: "web-customer",
          source: "customer",
          author: "James Walker",
          text: "I have 2 office desks and 4 bags. Can you use our building elevator?",
          at: now - 60000,
        },
        {
          id: "web-bot",
          source: "bot",
          author: "Sample Junk Co.",
          text: "The item estimate is $138. Our staff can confirm elevator access and pickup details.",
          at: now - 30000,
        },
      ],
    },
    {
      id: "email-olivia",
      customer: "Olivia Bennett",
      contact: "olivia@example.com",
      channel: "email",
      status: "needs_staff",
      assignee: "",
      subject: "Question about stairs",
      summary: "Please confirm second-floor access for the sofa pickup.",
      bookingId: "SJ-1001",
      lastCustomerAt: now,
      unread: true,
      messages: [
        {
          id: "seed-message",
          source: "customer",
          author: "Olivia Bennett",
          text: "Can your crew carry the sofa down two flights of stairs?",
          at: now,
        },
      ],
    },
    {
      id: "whatsapp-demo",
      customer: "Priya Shah",
      contact: "+1 (512) 555-0144 · sample",
      channel: "whatsapp",
      status: "human",
      assignee: "Sarah Carter",
      subject: "Can I change my pickup window?",
      summary: "Simulated WhatsApp inquiry about moving a pickup to the afternoon.",
      lastCustomerAt: now - 180000,
      unread: false,
      messages: [
        {
          id: "whatsapp-message",
          source: "customer",
          author: "Priya Shah",
          text: "Could I move my pickup to the afternoon window?",
          at: now - 180000,
          delivery: "simulated",
        },
      ],
    },
    {
      id: "sms-demo",
      customer: "Andre Lewis",
      contact: "+1 (512) 555-0182 · sample",
      channel: "sms",
      status: "needs_staff",
      assignee: "",
      subject: "Arrival time",
      summary: "Simulated SMS asking when the crew will arrive.",
      lastCustomerAt: now - 360000,
      unread: true,
      messages: [
        {
          id: "sms-message",
          source: "customer",
          author: "Andre Lewis",
          text: "Do you have an updated arrival time for today?",
          at: now - 360000,
          delivery: "simulated",
        },
      ],
    },
    {
      id: "social-demo",
      customer: "Maya Chen",
      contact: "Facebook / Instagram · sample",
      channel: "social",
      status: "bot",
      assignee: "",
      subject: "Furniture removal estimate",
      summary:
        "Simulated social message. The assistant collected the item list and handed off for staff review.",
      lastCustomerAt: now - 540000,
      unread: true,
      messages: [
        {
          id: "social-customer",
          source: "customer",
          author: "Maya Chen",
          text: "Can you remove a sofa and two chairs?",
          at: now - 600000,
          delivery: "simulated",
        },
        {
          id: "social-bot",
          source: "bot",
          author: "Sample Junk Co. AI",
          text: "I have the item list. A staff member can confirm the estimate and pickup options.",
          at: now - 540000,
          delivery: "simulated",
        },
      ],
    },
  ];
}
export const supportStaff = ["Sarah Carter", "Alex Morgan"];
export const supportQuickReplies = [
  {
    label: "Acknowledge",
    text: "Thanks for contacting Sample Junk Co. I’m checking this for you.",
  },
  {
    label: "Access details",
    text: "Please confirm the number of stairs, elevator availability, and parking access.",
  },
];
export const supportFollowupTemplate =
  "Hello! Sample Junk Co. is following up on your removal request. Please reply with your preferred pickup date.";
export const supportPhoneReply = "Recorded phone follow-up: customer asked about crew arrival.";
