import { PhoneFrame, LaptopFrame } from "./device-frame";
import { MiniCustomerQuote, MiniJobCard } from "./mini-screens";

/**
 * The hero visual: the customer's phone and the office laptop joined by a rail,
 * with job data travelling across it on its own. This is the whole pitch in one
 * picture — the customer side fills the staff side, nobody types it twice.
 */

const travelling = [
  { label: "Photo quote", to: "Job card", delay: "0s" },
  { label: "Deposit paid", to: "Schedule", delay: "2.7s" },
  { label: "Crew added item", to: "Invoice", delay: "5.4s" },
];

function TravelChip({ label, to }: { label: string; to: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-bd-blue/25 bg-white px-2.5 py-1 text-[10px] font-semibold text-bd-navy shadow-lg shadow-bd-navy/10 sm:text-[11px]">
      {label}
      <span className="text-bd-blue">→</span>
      <span className="text-muted-foreground">{to}</span>
    </span>
  );
}

export function FlowHero() {
  return (
    <div className="relative">
      {/* Desktop: phone — rail — laptop */}
      <div className="hidden items-center gap-3 lg:grid lg:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,19rem)]">
        <PhoneFrame label="Your customer">
          <div className="h-[19rem]">
            <MiniCustomerQuote />
          </div>
        </PhoneFrame>

        <div className="relative h-24" aria-hidden="true">
          <svg
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 10"
          >
            <line
              x1="0"
              y1="5"
              x2="100"
              y2="5"
              stroke="currentColor"
              strokeWidth="0.4"
              className="bd-dash text-bd-blue/60"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {travelling.map((chip) => (
            <span
              key={chip.label}
              className="bd-rail-x absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDelay: chip.delay }}
            >
              <TravelChip label={chip.label} to={chip.to} />
            </span>
          ))}
        </div>

        <LaptopFrame label="Your office">
          <div className="h-[13.5rem]">
            <MiniJobCard />
          </div>
        </LaptopFrame>
      </div>

      {/* Mobile / tablet: phone above, laptop below, rail running down */}
      <div className="grid gap-2 lg:hidden">
        <PhoneFrame className="mx-auto w-[9.5rem]" label="Your customer">
          <div className="h-[17rem]">
            <MiniCustomerQuote />
          </div>
        </PhoneFrame>

        <div className="relative mx-auto h-24 w-full max-w-xs" aria-hidden="true">
          <svg
            className="absolute inset-0 size-full"
            preserveAspectRatio="none"
            viewBox="0 0 10 100"
          >
            <line
              x1="5"
              y1="0"
              x2="5"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.4"
              className="bd-dash text-bd-blue/60"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {travelling.map((chip) => (
            <span
              key={chip.label}
              className="bd-rail-y absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDelay: chip.delay }}
            >
              <TravelChip label={chip.label} to={chip.to} />
            </span>
          ))}
        </div>

        <LaptopFrame className="mx-auto w-full max-w-[18rem]" label="Your office">
          <div className="h-[13rem]">
            <MiniJobCard />
          </div>
        </LaptopFrame>
      </div>
    </div>
  );
}
