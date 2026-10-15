import { Camera, Check, Sparkles, Truck } from "lucide-react";

/**
 * Small, non-interactive renderings of the sample junk company and the office
 * behind it. These are illustrative customer and office screens.
 *
 * Colours follow the Booked to Done palette, so these frames match the demo
 * video. The rules that matter here:
 *   - backgrounds white, text dark green (never pure black)
 *   - brand green for buttons and selected states
 *   - "done" green ONLY on Auto chips, checkmarks and paid/approved moments
 *   - AI moments always carry the purple-to-blue gradient
 */

export function MiniCustomerQuote() {
  return (
    <div className="flex h-full flex-col bg-white text-[10px] leading-tight text-bd-navy">
      <div className="relative h-20 shrink-0 overflow-hidden bg-bd-navy">
        <img
          src="/junk-removal-hero-v2.png"
          alt=""
          aria-hidden="true"
          className="size-full object-cover opacity-80"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bd-navy/90 to-bd-navy/10" />
        <p className="absolute bottom-2 left-2.5 font-display text-[13px] font-extrabold leading-none text-white">
          Junk gone.
          <br />
          Booked in 60 seconds.
        </p>
      </div>

      <div className="flex-1 space-y-2 p-2.5">
        {/* AI moment — gradient, per the palette rules */}
        <div className="bd-ai-gradient flex items-center gap-1.5 rounded-md px-2 py-1.5 text-white">
          <Camera className="size-3 shrink-0" />
          <span className="font-semibold">Photo read · 6 items found</span>
        </div>

        <div className="space-y-1">
          {[
            ["Sofa", "Furniture"],
            ["Mattress", "Special item"],
            ["4 × bags", "General junk"],
          ].map(([item, kind]) => (
            <div
              key={item}
              className="flex justify-between border-b border-dashed border-bd-line pb-0.5"
            >
              <span>{item}</span>
              <span className="font-semibold">{kind}</span>
            </div>
          ))}
        </div>

        <div className="rounded-md border-2 border-bd-blue p-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-bd-body">
            Your estimate
          </p>
          <p className="font-display text-sm font-extrabold text-bd-navy">Price range ready</p>
          <p className="mt-0.5 text-[9px] text-bd-body">Deposit applied at booking</p>
        </div>

        <div className="rounded bg-bd-blue py-1.5 text-center text-[10px] font-bold text-white">
          Book this pickup
        </div>
      </div>
    </div>
  );
}

export function MiniJobCard() {
  return (
    <div className="h-full bg-white text-[10px] leading-tight text-bd-navy">
      <div className="flex items-center justify-between border-b border-bd-line bg-bd-chip px-2.5 py-1.5">
        <span className="font-display text-[11px] font-bold">Job #3 · new</span>
        <span className="rounded bg-bd-blue px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
          0 fields typed
        </span>
      </div>

      <div className="space-y-2 p-2.5">
        {[
          ["Customer", "M. Alvarez"],
          ["Address", "2204 Pine Grove Dr"],
          ["Window", "Sat 10 AM – 12 PM"],
          ["Items", "Sofa, mattress, 4 bags"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <span className="text-bd-body">{label}</span>
            <span className="flex items-center gap-1 text-right font-medium">
              {value}
              {/* Auto chip — "done" green is reserved for exactly this kind of moment */}
              <span className="rounded-sm bg-bd-done-tint px-1 text-[8px] font-bold uppercase text-bd-green">
                auto
              </span>
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-md bg-bd-chip px-2 py-1.5">
          <span className="font-semibold">Estimate</span>
          <span className="font-display text-xs font-extrabold">Range ready</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-bd-done-tint px-2 py-1.5 text-bd-green">
          <Check className="size-3 shrink-0" />
          <span className="font-semibold">Deposit received</span>
        </div>

        <div className="flex items-center gap-1.5 text-bd-body">
          <Truck className="size-3 shrink-0" />
          <span>Unassigned — drag to a truck</span>
        </div>
      </div>
    </div>
  );
}
