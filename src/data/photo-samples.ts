/**
 * The sample photos the AI estimate "reads", and what is actually in them.
 *
 * One source of truth, imported by both the booking flow and the feature-page
 * walkthrough. They used to carry separate lists, and drifted: the feature page
 * went on claiming a sofa and four bags of junk long after the booking flow had
 * been corrected to the chairs, table and bench that are genuinely in the shot.
 * A scan that finds things the photo doesn't contain is the fastest way to lose
 * a prospect, so there is only one list now.
 */

import { company } from "./company";

/**
 * One box drawn on the photo. `item` is the id of the price-list entry it is
 * charged as, so several boxes can be the same kind of thing (six bags = six
 * boxes, one line on the estimate).
 */
export type Detection = {
  id: string;
  /** Price-list id in `company.pricing.items`. */
  item: string;
  label: string;
  /** Percentages: left, top, width, height. */
  box: [number, number, number, number];
};

export type PhotoSample = {
  src: string;
  alt: string;
  title: string;
  detections: Detection[];
};

/** Every box below was placed against the actual photo. */
export const photoSamples: PhotoSample[] = [
  {
    src: "/images/household-junk.webp",
    alt: "Old chairs, a wooden table and a bench stacked outside a house",
    title: "Household clear-out",
    detections: [
      { id: "c1", item: "chair", label: "Chair", box: [1, 50, 19, 48] },
      { id: "c2", item: "chair", label: "Chair", box: [14, 40, 18, 55] },
      { id: "c3", item: "chair", label: "Chair", box: [28, 62, 17, 38] },
      { id: "tub", item: "washtub", label: "Metal tub", box: [23, 25, 15, 20] },
      { id: "tbl", item: "table", label: "Wooden table", box: [46, 60, 42, 32] },
      { id: "bch", item: "bench", label: "Bench seat", box: [64, 45, 18, 25] },
    ],
  },
  {
    src: "/images/yard-cleanout.webp",
    alt: "Six tied bags of yard waste on a back lawn",
    title: "Yard clear-out",
    detections: [
      { id: "b1", item: "yardbag", label: "Yard waste", box: [2, 29, 18, 33] },
      { id: "b2", item: "yardbag", label: "Yard waste", box: [1, 44, 21, 36] },
      { id: "b3", item: "yardbag", label: "Yard waste", box: [19, 33, 15, 22] },
      { id: "b4", item: "yardbag", label: "Yard waste", box: [18, 50, 24, 35] },
      { id: "b5", item: "yardbag", label: "Yard waste", box: [33, 36, 15, 36] },
      { id: "b6", item: "yardbag", label: "Yard waste", box: [45, 38, 16, 37] },
    ],
  },
];

export const priceFor = (id: string) => company.pricing.items.find((i) => i.id === id);

/** Detections collapsed into the priced lines they become. */
export function tally(detections: Detection[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const d of detections) counts.set(d.item, (counts.get(d.item) ?? 0) + 1);
  return [...counts];
}

/** What a set of priced lines is worth, floored at the minimum pickup charge. */
export function estimateFor(lines: [string, number][]) {
  const subtotal = lines.reduce((sum, [item, n]) => sum + (priceFor(item)?.price ?? 0) * n, 0);
  const low = Math.max(subtotal, company.pricing.minimum);
  return { subtotal, low, high: Math.round(low * 1.2) };
}
