import { cn } from "@/lib/utils";

/**
 * Booked to Done lockup used inside the demo app (top bar, sample-site footer).
 *
 * Assets live in `public/brand/`, documented in `brand/README.md`. Swap the
 * `src` for an `.svg` if the original vector turns up — nothing else changes.
 */
export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/brand/bd-mark.png"
        alt=""
        aria-hidden="true"
        width="347"
        height="294"
        className="h-7 w-auto shrink-0"
      />
      {!compact && (
        <span className="font-display text-lg font-bold tracking-normal">Booked to Done</span>
      )}
    </div>
  );
}
