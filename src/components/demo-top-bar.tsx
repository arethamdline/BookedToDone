import { Link, useRouterState } from "@tanstack/react-router";
import { Brand } from "./brand";

/** Routes that are the company site, not the demo app. */
const SITE_ROUTES = ["/", "/features"];

export function DemoTopBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onStaffSystem = pathname.startsWith("/staff");

  // The company site has its own header; this bar belongs to the demo only.
  const onSite = pathname === "/" || SITE_ROUTES.some((r) => r !== "/" && pathname.startsWith(r));
  if (onSite) return null;

  return (
    <header className="sticky top-0 z-[60] border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-2.5 sm:px-4">
        <Link to="/" className="flex min-w-0 items-center gap-1.5">
          <Brand className="gap-1.5 [&>span:first-child]:size-7 [&>span:first-child>svg]:size-4 [&>span:last-child]:text-[11px] sm:[&>span:last-child]:text-sm" />
          <span className="shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
            Demo
          </span>
        </Link>
        <nav
          aria-label="System switch"
          className="ml-auto flex shrink-0 items-center rounded-lg border bg-muted p-0.5"
        >
          <Link
            to="/customer"
            aria-current={!onStaffSystem ? "page" : undefined}
            className={`flex h-11 items-center rounded-md px-2 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${!onStaffSystem ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}
          >
            Customer system
          </Link>
          <Link
            to="/staff"
            aria-current={onStaffSystem ? "page" : undefined}
            className={`flex h-11 items-center rounded-md px-2 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${onStaffSystem ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}
          >
            Staff system
          </Link>
        </nav>
      </div>
    </header>
  );
}
