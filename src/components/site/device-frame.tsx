import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The sample junk company only ever appears inside one of these frames — never
 * as a full page a visitor can land on.
 */

export function PhoneFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-[1.75rem] border-[6px] border-bd-navy bg-bd-navy shadow-2xl shadow-bd-navy/25">
        <div className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-bd-navy" />
        <div className="overflow-hidden rounded-[1.3rem] bg-white">{children}</div>
      </div>
      {label && (
        <p className="mt-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}

export function LaptopFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-t-xl border-[6px] border-b-0 border-bd-navy bg-bd-navy shadow-2xl shadow-bd-navy/25">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="size-1.5 rounded-full bg-white/25" />
          <span className="size-1.5 rounded-full bg-white/25" />
          <span className="size-1.5 rounded-full bg-white/25" />
        </div>
        <div className="overflow-hidden rounded-t-md bg-white">{children}</div>
      </div>
      <div className="h-2 rounded-b-xl bg-bd-navy-soft" />
      <div className="mx-auto h-1 w-1/3 rounded-b-md bg-bd-navy/60" />
      {label && (
        <p className="mt-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
