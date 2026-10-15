import type { Pricing } from "./mock-data";

export const company = {
  name: "Sample Junk Co.",
  city: "Austin",
  state: "TX",
  serviceZips: ["78701", "78702", "78703", "78704", "78705", "78745", "78756"],
  hours: {
    weekdays: "Monday through Friday, 8 AM to 6 PM",
    saturday: "Saturday, 8 AM to 4 PM",
    sunday: "Sunday, closed",
  },
  sameDaySurcharge: 25,
  /** Held at booking and credited against the final bill. */
  deposit: 50,
  trucks: [
    { name: "Pickup", capacity: "small item loads" },
    { name: "Box truck", capacity: "up to 16 cubic yards" },
  ],
  itemRules: {
    accepted: "Furniture, appliances, electronics, household junk, and non-hazardous debris",
    special: "Hot tubs need a photo quote; mattresses may include a recycling fee.",
    excluded: "Paint, chemicals, asbestos, and other hazardous materials are not accepted.",
  },
  dumpRules: "Loads are sorted for donation and recycling where local facilities accept them.",
  pricing: {
    minimum: 125,
    items: [
      { id: "sofa", name: "Sofa", category: "Furniture", price: 85, volume: 2.5 },
      { id: "mattress", name: "Mattress", category: "Furniture", price: 65, volume: 1.5 },
      { id: "table", name: "Dining table", category: "Furniture", price: 55, volume: 1 },
      { id: "fridge", name: "Refrigerator", category: "Appliances", price: 95, volume: 2 },
      { id: "washer", name: "Washer / dryer", category: "Appliances", price: 75, volume: 1.5 },
      { id: "tv", name: "TV / monitor", category: "Electronics", price: 35, volume: 0.4 },
      { id: "bags", name: "Bag of general junk", category: "General junk", price: 12, volume: 0.2 },
      { id: "desk", name: "Office desk", category: "Office cleanouts", price: 45, volume: 1 },
      {
        id: "debris",
        name: "Debris container (50 lb max)",
        category: "Construction debris",
        price: 30,
        volume: 0.4,
      },
    ],
    tiers: [
      { name: "Minimum / ⅛ load", volume: 2, price: 125 },
      { name: "¼ load", volume: 4, price: 225 },
      { name: "½ load", volume: 8, price: 375 },
      { name: "¾ load", volume: 12, price: 525 },
      { name: "Full load", volume: 16, price: 675 },
    ],
    stairs: 0,
    parking: 0,
    heavy: 0,
  } satisfies Pricing,
};

const formatPrice = (amount: number) => `$${amount.toLocaleString("en-US")}`;

export function answerCompanyQuestion(question: string, pricing: Pricing = company.pricing) {
  const text = question.toLowerCase();
  const zip = question.match(/\b\d{5}\b/)?.[0];

  if (zip) {
    return company.serviceZips.includes(zip)
      ? `Yes, we serve ${zip} in the ${company.city} area. Want a price? Send me a photo.`
      : `We don't currently serve ${zip}. Share a nearby ZIP and I'll check that area too.`;
  }
  if (/paint|chemical|hazard|asbestos/.test(text))
    return `We can't take paint or other hazardous materials. ${company.itemRules.excluded}`;
  if (/hot tub|jacuzzi|spa/.test(text))
    return "Yes, we can remove a hot tub. Since size and access change the price, send a photo and we'll put together a quote.";
  if (/mattress/.test(text)) {
    const item = pricing.items.find((entry) => entry.id === "mattress");
    return `Yes, we take mattresses. They're ${formatPrice(item?.price ?? 65)} each, and a recycling fee may apply. Want a price? Send me a photo.`;
  }
  if (/fridge|refrigerator/.test(text)) {
    const item = pricing.items.find((entry) => entry.id === "fridge");
    return `Yes, we take refrigerators. The item price starts at ${formatPrice(item?.price ?? 95)}; access and refrigerant rules can affect the final quote. Want a price? Send me a photo.`;
  }
  if (/same.?day|today|right away/.test(text))
    return `Same-day pickups depend on crew availability and add ${formatPrice(company.sameDaySurcharge)}. Tell me your ZIP and I'll check the service area.`;
  if (/saturday|weekend/.test(text))
    return `Yes, we're available Saturday from 8 AM to 4 PM. Pickup times are two-hour windows, subject to crew availability.`;
  if (/stairs|upstairs|elevator/.test(text))
    return "We can handle stairs. Let us know how many flights and whether there's an elevator so the crew can plan ahead; this demo doesn't add an automatic stair fee.";
  if (/garage|yard|cleanout/.test(text)) {
    const quarter = pricing.tiers.find((tier) => tier.volume === 4)?.price ?? 225;
    const half = pricing.tiers.find((tier) => tier.volume === 8)?.price ?? 375;
    return `Most garage and yard cleanouts land around ${formatPrice(quarter)}–${formatPrice(half)}, depending on how much space the items take. Send a photo for a closer estimate.`;
  }
  if (/price|cost|estimate|how much|rate/.test(text)) {
    const first = pricing.tiers[0]?.price ?? pricing.minimum;
    const last = pricing.tiers.at(-1)?.price ?? 675;
    return `Pickup pricing starts at ${formatPrice(pricing.minimum)} and runs from ${formatPrice(first)} for a small load to ${formatPrice(last)} for a full truck. The final price depends on the space your items take.`;
  }
  if (/hours|open|close/.test(text))
    return `We're open ${company.hours.weekdays.toLowerCase()} and ${company.hours.saturday.toLowerCase()}. ${company.hours.sunday}.`;
  if (/dump|donat|recycl/.test(text)) return company.dumpRules;
  if (/take|haul|remove|accept|service/.test(text))
    return `We haul ${company.itemRules.accepted.toLowerCase()}. ${company.itemRules.special}`;

  return null;
}
