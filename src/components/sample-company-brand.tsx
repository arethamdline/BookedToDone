import { Truck } from "lucide-react";

import { useProspect } from "@/lib/prospect";
import { cn } from "@/lib/utils";

/**
 * The SAMPLE company's own mark — not Booked to Done's.
 *
 * The customer-facing site inside the demo is meant to be a junk-removal
 * company's website. It used to show the Booked to Done lockup, which stacked
 * our brand directly under the demo band and made the two indistinguishable.
 */
export function SampleCompanyBrand({ className }: { className?: string }) {
  const prospect = useProspect();
  const name = prospect ?? "Sample Junk Co.";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Truck className="size-5" />
      </span>
      <span className="truncate font-display text-lg font-bold tracking-normal">{name}</span>
    </div>
  );
}
