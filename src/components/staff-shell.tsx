import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Archive,
  Truck,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useSupport } from "@/lib/support-store";
const navigation = [
  ["Overview", LayoutDashboard],
  ["Inbox", Inbox],
  ["Bookings", Archive],
  ["Dispatch", CalendarDays],
  ["Customers", UsersRound],
  ["Payments", WalletCards],
  ["Pricing", CircleDollarSign],
  ["Routes", Truck],
  ["Analytics", Settings],
] as const;
export function StaffShell({ page, children }: { page: string; children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const { conversations } = useSupport();
  const needsStaff = conversations.filter((c) => c.status === "needs_staff").length;
  return (
    <div className="min-h-screen bg-muted/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-foreground text-background transition-transform lg:translate-x-0",
          mobile ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-background/10 px-5">
          <Brand className="text-background" />
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobile(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <p className="px-6 pb-2 pt-7 text-[10px] font-semibold tracking-[0.2em] text-background/40">
          WORKSPACE
        </p>
        <nav className="flex-1 space-y-1 overflow-auto px-3 py-2">
          {navigation.map(([name, Icon]) => {
            const className = cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-background/65 hover:bg-background/10 hover:text-background",
              page === name && "bg-background/15 text-background",
            );
            const content = (
              <>
                <Icon className="size-4" />
                {name}
                {name === "Inbox" && needsStaff > 0 && (
                  <span className="ml-auto rounded bg-accent-strong px-1.5 py-0.5 text-[10px] font-bold text-accent-strong-foreground">
                    {needsStaff}
                  </span>
                )}
              </>
            );
            return name === "Inbox" ? (
              <Link
                key={name}
                to="/staff/inbox"
                onClick={() => setMobile(false)}
                className={className}
              >
                {content}
              </Link>
            ) : (
              <Link
                key={name}
                to="/staff"
                search={{ section: name }}
                onClick={() => setMobile(false)}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-background/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-background/60 hover:bg-background/10"
          >
            <LogOut className="size-4" />
            Customer app
          </Link>
        </div>
      </aside>
      {mobile && (
        <button
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobile(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <main className="lg:pl-60">
        <header className="flex h-16 items-center gap-3 border-b bg-background px-4 lg:px-7">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              Workspace <span className="mx-2 text-border">/</span>{" "}
              <span className="font-semibold text-foreground">{page}</span>
            </p>
          </div>
          <span className="hidden rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground sm:block">
            PROTOTYPE
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            SC
          </span>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold">Sarah Carter</p>
            <p className="text-[10px] text-muted-foreground">Operations manager</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
