import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { CustomerShell } from "@/components/customer-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { CustomerBookingDetails } from "@/components/booking-details";
import { dateLabel, money } from "@/data/mock-data";
import {
  approveQuote,
  canCancel,
  cancelJob,
  customerJobs,
  jobPrice,
  priceLabel,
  selectCustomer,
  useJunk,
} from "@/lib/junk-store";
export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "My bookings — Sample Junk Co." }] }),
  component: Portal,
});
function Portal() {
  const { data, ready, error } = useJunk();
  const [customerId, setCustomerId] = useState("");
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!ready) return;
    const saved = localStorage.getItem("smart-junk-customer-session");
    setCustomerId(
      data.customers.some((c) => c.id === saved) ? saved! : (data.customers[0]?.id ?? ""),
    );
  }, [data, ready]);
  const customer = data.customers.find((c) => c.id === customerId);
  const jobs = customerJobs(data, customerId);
  const detail = jobs.find((j) => j.id === selected);
  const groups = [
    {
      name: "Upcoming pickups",
      rows: jobs.filter((j) => !["Completed", "Cancelled"].includes(j.status)),
    },
    {
      name: "Past bookings",
      rows: jobs.filter((j) => ["Completed", "Cancelled"].includes(j.status)),
    },
  ];
  const action = (fn: () => void) => {
    try {
      fn();
      setNotice("Saved to this demo.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save.");
    }
  };
  return (
    <CustomerShell>
      <div className="mx-auto max-w-5xl space-y-7 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Your pickups, in one place
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold">My bookings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {customer
                ? `Hi ${customer.name.split(" ")[0]}, here's what's coming up.`
                : "Choose a demo account to view its bookings."}
            </p>
          </div>
          <Button asChild>
            <Link to="/book">
              Request a pickup <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <label className="block text-sm font-semibold">
            Demo customer account
            <select
              aria-label="Demo customer account"
              className="mt-2 h-11 w-full rounded border bg-background px-3 sm:max-w-lg"
              disabled={!ready}
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                selectCustomer(e.target.value);
                setSelected("");
                setNotice("");
              }}
            >
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            Demo authentication only. This selector is not production security. Only the selected
            customer's bookings are shown.
          </p>
        </div>
        {(error || notice) && (
          <p role="status" className="rounded border p-3 text-sm">
            {error || notice}
          </p>
        )}
        {!ready ? (
          <p>Loading your bookings…</p>
        ) : (
          groups.map((g) => (
            <section key={g.name}>
              <h2 className="mb-4 font-display text-xl font-bold">
                {g.name} <span className="text-base text-muted-foreground">({g.rows.length})</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.rows
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((j) => (
                    <Card key={j.id} className="rounded-xl shadow-sm">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold">{j.id}</h3>
                          <StatusBadge>{j.status}</StatusBadge>
                        </div>
                        <p className="flex items-start gap-2 text-sm">
                          <CalendarDays className="size-4 shrink-0 text-primary" />
                          <span>
                            {dateLabel(j.date)}
                            <br />
                            <span className="text-muted-foreground">{j.window}</span>
                          </span>
                        </p>
                        <p className="flex items-start gap-2 text-sm">
                          <MapPin className="size-4 shrink-0 text-primary" />
                          <span>
                            {j.street}
                            <br />
                            <span className="text-muted-foreground">
                              {j.city}, {j.state} {j.zip}
                            </span>
                          </span>
                        </p>
                        <div className="flex items-center justify-between border-t pt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">{priceLabel(j)}</p>
                            <p className="text-lg font-bold">{money(jobPrice(j))}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(j.id);
                              setNotice("");
                            }}
                          >
                            View details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              {!g.rows.length && (
                <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  {g.name === "Upcoming pickups"
                    ? "No upcoming pickups. Ready to make some space?"
                    : "No past bookings yet."}
                </p>
              )}
            </section>
          ))
        )}
      </div>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setSelected("");
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detail?.id} · Pickup details</DialogTitle>
            <DialogDescription>Track your pickup, photos, quote, and messages.</DialogDescription>
          </DialogHeader>
          {notice && (
            <p role="status" className="rounded border p-3 text-sm">
              {notice}
            </p>
          )}
          {detail && (
            <>
              <CustomerBookingDetails job={detail} />
              <div className="flex flex-wrap gap-2">
                {detail.status === "Quoted" &&
                  !detail.quoteApproved &&
                  detail.quotedAmount != null && (
                    <Button onClick={() => action(() => approveQuote(detail.id))}>
                      Approve quote (demo)
                    </Button>
                  )}
                {canCancel(detail) && (
                  <Button variant="outline" onClick={() => action(() => cancelJob(detail.id))}>
                    Cancel pickup
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </CustomerShell>
  );
}
