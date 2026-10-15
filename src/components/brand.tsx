import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Truck className="size-5" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-normal">Booked to Done</span>
      )}
    </div>
  );
}
