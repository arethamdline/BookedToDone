import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { BookingPhotos } from "./booking-photos";
import { dateLabel, money, type Job } from "@/data/mock-data";
import {
  approveQuote,
  jobPrice,
  priceLabel,
  reviseQuote,
  updateJob,
  useJunk,
} from "@/lib/junk-store";
export function BookingProgress({ job }: { job: Job }) {
  const steps = [
    "Requested",
    "Quote review",
    "Confirmed",
    "Assigned",
    "En Route",
    "In Progress",
    "Completed",
  ];
  const index =
    job.status === "Needs Quote" || job.status === "Quoted" ? 1 : steps.indexOf(job.status);
  if (job.status === "Cancelled")
    return <p className="rounded bg-muted p-3 text-sm">This booking was cancelled.</p>;
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {steps.map((s, i) => (
        <li
          className={`flex items-center gap-2 rounded border p-2 text-xs ${i <= index ? "border-primary/30 bg-accent text-primary" : "text-muted-foreground"}`}
          key={s}
        >
          {i < index ? <Check className="size-4" /> : <Circle className="size-4" />}
          {s}
        </li>
      ))}
    </ol>
  );
}
export function PriceHistory({ job }: { job: Job }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Original estimate", job.originalEstimate],
          ["Staff quote", job.quotedAmount],
          ["Final charge", job.finalCharge],
        ].map(([label, amount]) => (
          <div key={String(label)} className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-bold">
              {typeof amount === "number" ? money(amount) : "Not set"}
            </p>
          </div>
        ))}
      </div>
      {job.priceLines.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-semibold">
            Original estimate breakdown
          </summary>
          {job.priceLines.map((l) => (
            <p key={l.label} className="mt-2 flex justify-between gap-3 text-sm">
              <span>{l.label}</span>
              <strong>{money(l.amount)}</strong>
            </p>
          ))}
        </details>
      )}
      {job.quoteHistory.map((q) => (
        <div key={q.id} className="rounded border p-3 text-sm">
          <p className="font-semibold">
            {q.kind} · {money(q.amount)}
            {q.kind === "Quote" ? (q.approved ? " · Approved" : " · Approval pending") : ""}
          </p>
          <p className="mt-1">{q.reason}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {q.author} · {new Date(q.at).toLocaleString("en-US")}
          </p>
        </div>
      ))}
      {!job.quoteHistory.length && (
        <p className="text-xs text-muted-foreground">No staff price revisions yet.</p>
      )}
    </div>
  );
}
export function CommunicationTimeline({
  jobs,
  internal = false,
}: {
  jobs: Job[];
  internal?: boolean;
}) {
  const entries = jobs
    .flatMap((j) => j.communications.map((c) => ({ ...c, booking: j.id })))
    .filter((c) => internal || c.channel !== "Note")
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return (
    <div className="max-h-72 space-y-3 overflow-auto">
      {entries.map((c) => (
        <div
          key={`${c.booking}-${c.id}`}
          className="border-l-2 border-primary/30 bg-muted/50 p-3 text-sm"
        >
          <p className="mb-1 text-xs text-muted-foreground">
            {c.channel} · {c.status} · {c.booking} · {new Date(c.at).toLocaleString("en-US")}
          </p>
          <p className="whitespace-pre-wrap">{c.text}</p>
        </div>
      ))}
      {!entries.length && (
        <p className="text-sm text-muted-foreground">No communication records.</p>
      )}
    </div>
  );
}
export function QuotationEditor({ job }: { job: Job }) {
  const [amount, setAmount] = useState(String(job.quotedAmount ?? job.estimate ?? ""));
  const [reason, setReason] = useState("");
  const [capacity, setCapacity] = useState(String(job.volume || ""));
  const [notice, setNotice] = useState("");
  const run = (fn: () => void) => {
    try {
      fn();
      setNotice("Saved.");
      setReason("");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save.");
    }
  };
  const price = (final: boolean) =>
    run(() => {
      if (!amount.trim()) throw new Error("Enter an amount.");
      reviseQuote(job.id, Number(amount), reason, final);
    });
  return (
    <div className="space-y-4">
      <PriceHistory job={job} />
      <p className="text-xs text-muted-foreground">
        Staff demo session: Sarah Carter. Customer approval and email delivery are simulated.
      </p>
      {notice && (
        <p role="status" className="rounded border p-3 text-sm">
          {notice}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Amount (USD)
          <input
            className="mt-1 h-11 w-full rounded border px-3"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold">
          Reason for price update
          <input
            className="mt-1 h-11 w-full rounded border px-3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required, e.g. extra items confirmed"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={["Completed", "Cancelled"].includes(job.status)}
          onClick={() => price(false)}
        >
          {job.quotedAmount == null ? "Send staff quote" : "Revise quote"}
        </Button>
        <Button
          variant="outline"
          disabled={job.status !== "Quoted" || job.quoteApproved}
          onClick={() => run(() => approveQuote(job.id))}
        >
          Simulate quote approval
        </Button>
        <Button variant="outline" disabled={job.status === "Cancelled"} onClick={() => price(true)}>
          Record final charge
        </Button>
      </div>
      {job.mode === "custom" || job.otherItem ? (
        <div className="border-t pt-4">
          <label className="block text-sm font-semibold">
            Internal capacity estimate (yd³)
            <input
              type="number"
              min="0.1"
              step="0.1"
              className="mt-1 h-11 w-full rounded border px-3"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </label>
          <Button
            className="mt-2"
            variant="outline"
            onClick={() =>
              run(() => {
                const volume = Number(capacity);
                if (!Number.isFinite(volume) || volume <= 0)
                  throw new Error("Enter a positive capacity estimate.");
                updateJob(job.id, (j) => ({ ...j, volume }));
              })
            }
          >
            Save capacity estimate
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            For truck planning only; this does not change the customer quote.
          </p>
        </div>
      ) : null}
    </div>
  );
}
export function CustomerBookingDetails({ job }: { job: Job }) {
  const { data } = useJunk();
  return (
    <div className="space-y-6">
      <BookingProgress job={job} />
      <div className="rounded-lg bg-accent p-4">
        <p className="text-sm text-muted-foreground">{priceLabel(job)}</p>
        <p className="text-2xl font-bold">{money(jobPrice(job))}</p>
        <p className="mt-2 text-xs">Final pricing is agreed after on-site inspection.</p>
      </div>
      <div className="text-sm leading-7">
        <p>
          {dateLabel(job.date)} · {job.window}
        </p>
        <p>
          {job.street}, {job.city}, {job.state} {job.zip}
        </p>
        <p>
          {job.access}
          {job.access.startsWith("Upstairs") ? ` · Floor ${job.floor}` : ""}
        </p>
        {job.project && <p>{job.project}</p>}
        {job.otherItem && <p>Other item: {job.otherItem}</p>}
        <p>
          Contact: {job.email} · {job.phone}
        </p>
      </div>
      {job.mode === "standard" && (
        <div>
          <h3 className="mb-2 font-semibold">Items to remove</h3>
          {data.pricing.items
            .filter((i) => job.items[i.id])
            .map((i) => (
              <p className="text-sm" key={i.id}>
                {job.items[i.id]} × {i.name}
              </p>
            ))}
        </div>
      )}
      <BookingPhotos photos={job.photos} />
      <h3 className="font-semibold">Quotation history</h3>
      <PriceHistory job={job} />
      <h3 className="font-semibold">Communication history</h3>
      <CommunicationTimeline jobs={[job]} />
    </div>
  );
}
