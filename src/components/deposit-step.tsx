import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { StatusBadge } from "./status-badge";
import { dateLabel, money, type Job } from "@/data/mock-data";

/** Flag the demo guide reads to switch to its "you've booked" step. */
export const BOOKED_FLAG = "bd-demo-booked";
export const BOOKED_EVENT = "bd-demo-booked-change";

export function markDemoBooked() {
  try {
    localStorage.setItem(BOOKED_FLAG, "1");
  } catch {
    /* blocked storage — the guide just won't advance on its own */
  }
  window.dispatchEvent(new Event(BOOKED_EVENT));
}

/**
 * Deposit, then confirmation.
 *
 * Nothing is charged. This exists so the demo shows the moment that actually
 * matters to an owner: the slot is held by money, not by a maybe — and the
 * paid job appears on the office side without anyone typing it.
 */
export function DepositStep({ job, deposit }: { job: Job; deposit: number }) {
  const [phase, setPhase] = useState<"pay" | "processing" | "done">("pay");

  const pay = () => {
    setPhase("processing");
    window.setTimeout(() => {
      setPhase("done");
      markDemoBooked();
    }, 1400);
  };

  if (phase === "done")
    return (
      <Card>
        <CardContent className="space-y-5 p-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-bd-green" />
          <h2 className="font-display text-2xl font-bold">Your pickup is booked.</h2>

          <div className="mx-auto max-w-sm space-y-1 rounded-xl bg-muted/50 p-4 text-sm">
            <p className="font-semibold">
              {job.id} <StatusBadge>{job.status}</StatusBadge>
            </p>
            <p>
              {job.street}, {job.city} {job.zip}
            </p>
            <p>
              {dateLabel(job.date)} · {job.window}
            </p>
            <p className="border-t pt-2 font-semibold text-bd-green">
              {money(deposit)} deposit paid · credited to your final bill
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Confirmation email and text are simulated. Nothing was charged.
          </p>

          <div className="flex flex-col items-center gap-2">
            <Button asChild size="lg">
              <Link to="/staff">
                See it land in the office <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/portal">View my booking</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <CreditCard className="size-6 text-primary" /> Hold your slot
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A {money(deposit)} deposit confirms the booking. It comes straight off your final bill.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/40 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pickup</span>
            <span className="text-right font-medium">
              {dateLabel(job.date)} · {job.window}
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Estimate</span>
            <span className="font-medium">
              {job.estimate == null ? "Staff quote to follow" : money(job.estimate)}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2">
            <span className="font-semibold">Due now</span>
            <span className="font-display text-lg font-extrabold">{money(deposit)}</span>
          </div>
        </div>

        {/* Deliberately not real inputs — we never want card details typed here. */}
        <div className="rounded-xl border p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4 text-muted-foreground" /> Card details
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex h-10 items-center rounded-md border bg-muted/60 px-3 text-sm text-muted-foreground">
              •••• •••• •••• 4242
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex h-10 items-center rounded-md border bg-muted/60 px-3 text-sm text-muted-foreground">
                12 / 29
              </div>
              <div className="flex h-10 items-center rounded-md border bg-muted/60 px-3 text-sm text-muted-foreground">
                CVC •••
              </div>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-bd-green" />
            Demo only — the fields are filled in for you and no card is charged. The real system
            takes payment through your own processor.
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={phase === "processing"}
          onClick={pay}
        >
          {phase === "processing" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Taking deposit…
            </>
          ) : (
            <>Pay {money(deposit)} deposit</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
