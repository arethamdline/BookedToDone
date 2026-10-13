import { cn } from "@/lib/utils";
const tones: Record<string, string> = {
  "Needs Quote": "bg-warning-soft text-warning-strong",
  Requested: "bg-warning-soft text-warning-strong",
  Quoted: "bg-warning-soft text-warning-strong",
  Assigned: "bg-info-soft text-info-strong",
  "En Route": "bg-info-soft text-info-strong",
  "In Progress": "bg-success-soft text-success-strong",
  Active: "bg-success-soft text-success-strong",
  Confirmed: "bg-info-soft text-info-strong",
  Paid: "bg-success-soft text-success-strong",
  Held: "bg-warning-soft text-warning-strong",
  "Pending Payment": "bg-warning-soft text-warning-strong",
  Pending: "bg-warning-soft text-warning-strong",
  Completed: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
  Refunded: "bg-info-soft text-info-strong",
  "Under Review": "bg-warning-soft text-warning-strong",
};
export function StatusBadge({ children }: { children: string }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[children] ?? "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
