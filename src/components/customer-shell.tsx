import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, CalendarPlus, Home, LayoutDashboard, UserRound } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";

import { useT } from "@/lib/i18n";
export function CustomerShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const items = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/book" as const, label: "Book", icon: CalendarPlus },
    { to: "/portal" as const, label: "My bookings", icon: UserRound },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <Link to="/" aria-label="Smart-Junk home" className="min-w-0">
            <Brand className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {items.map((i) => (
              <Button asChild variant="ghost" key={i.to}>
                <Link
                  to={i.to}
                  activeOptions={{ exact: i.to === "/" }}
                  activeProps={{ className: "bg-accent text-accent-foreground" }}
                >
                  <i.icon />
                  {t(i.label)}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link to="/assistant">
                <Bot />
                {t("Ask Bot")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="inline-flex">
              <Link to="/staff">
                <LayoutDashboard />
                {t("Staff")}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="pb-24 lg:pb-0">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t bg-background px-2 pb-[max(env(safe-area-inset-bottom),0.375rem)] pt-1.5 lg:hidden">
        {[
          ...items.slice(0, 1),
          { to: "/assistant" as const, label: "Ask Bot", icon: Bot },
          ...items.slice(1),
        ].map((i) => {
          const active =
            i.to === "/" ? pathname === "/" : pathname === i.to || pathname.startsWith(`${i.to}/`);
          return (
            <Link
              key={i.to}
              to={i.to}
              className={`relative flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-primary after:absolute after:inset-x-4 after:-top-1 after:h-0.5 after:bg-primary" : "text-muted-foreground"}`}
            >
              <i.icon className="size-5" />
              <span className="truncate">{t(i.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
