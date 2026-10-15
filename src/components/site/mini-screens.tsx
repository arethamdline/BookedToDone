import { Camera, Check, Sparkles, Truck } from "lucide-react";

/**
 * Small, non-interactive renderings of the sample junk company and the office
 * behind it. Numbers follow the demo script: $289–349 quote, $50 deposit,
 * +$65 mattress, $309 → $374, $324 balance.
 */

export function MiniCustomerQuote() {
  return (
    <div className="flex h-full flex-col bg-white text-[10px] leading-tight text-zinc-800">
      <div className="relative h-20 shrink-0 overflow-hidden bg-zinc-900">
        <img
          src="/junk-removal-hero-v2.png"
          alt=""
          aria-hidden="true"
          className="size-full object-cover opacity-80"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
        <p className="absolute bottom-2 left-2.5 font-display text-[13px] font-extrabold leading-none text-white">
          Junk gone.
          <br />
          Booked in 60 seconds.
        </p>
      </div>

      <div className="flex-1 space-y-2 p-2.5">
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5">
          <Camera className="size-3 shrink-0 text-emerald-700" />
          <span className="font-semibold text-emerald-900">Photo read · 6 items found</span>
        </div>

        <div className="space-y-1">
          {[
            ["Sofa", "$85"],
            ["Mattress", "$65"],
            ["4 × bags", "$48"],
          ].map(([item, price]) => (
            <div key={item} className="flex justify-between border-b border-dashed pb-0.5">
              <span>{item}</span>
              <span className="font-semibold tabular-nums">{price}</span>
            </div>
          ))}
        </div>

        <div className="rounded-md border-2 border-emerald-600 p-2">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
            Your estimate
          </p>
          <p className="font-display text-base font-extrabold tabular-nums text-zinc-900">
            $289–349
          </p>
          <p className="mt-0.5 text-[9px] text-zinc-500">$50 deposit · credited to your bill</p>
        </div>

        <div className="rounded bg-emerald-700 py-1.5 text-center text-[10px] font-bold text-white">
          Book this pickup
        </div>
      </div>
    </div>
  );
}

export function MiniJobCard() {
  return (
    <div className="h-full bg-white text-[10px] leading-tight text-zinc-800">
      <div className="flex items-center justify-between border-b bg-zinc-50 px-2.5 py-1.5">
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
            <span className="text-zinc-500">{label}</span>
            <span className="flex items-center gap-1 text-right font-medium">
              {value}
              <span className="rounded-sm bg-bd-blue-soft px-1 text-[8px] font-bold uppercase text-bd-blue-ink">
                auto
              </span>
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-md bg-zinc-100 px-2 py-1.5">
          <span className="font-semibold">Estimate</span>
          <span className="font-display text-xs font-extrabold tabular-nums">$289–349</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-900">
          <Check className="size-3 shrink-0" />
          <span className="font-semibold">Deposit $50 received</span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500">
          <Truck className="size-3 shrink-0" />
          <span>Unassigned — drag to a truck</span>
        </div>
      </div>
    </div>
  );
}

export function MiniAssistant() {
  return (
    <div className="flex h-full flex-col bg-white p-2.5 text-[10px] leading-snug">
      <div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
        <Sparkles className="size-3 text-bd-blue" />
        <span className="font-display text-[11px] font-bold">Sample Junk Co.</span>
        <span className="ml-auto text-[9px] text-zinc-400">9:14 pm</span>
      </div>
      <div className="flex-1 space-y-2">
        <div className="ml-auto w-4/5 rounded-lg rounded-br-sm bg-zinc-900 px-2 py-1.5 text-white">
          Can you take a hot tub Saturday?
        </div>
        <div className="w-5/6 rounded-lg rounded-bl-sm bg-zinc-100 px-2 py-1.5">
          Yes — Saturday 8 AM to 4 PM. Hot tubs are quoted from a photo since access changes the
          price. Send one and I'll price it now.
          <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
            AI answer · from Sample Junk Co.'s price list
          </p>
        </div>
      </div>
      <div className="mt-2 rounded-full border px-2.5 py-1.5 text-[9px] text-zinc-400">
        Type a message…
      </div>
    </div>
  );
}
