import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Archive, Banknote, ChevronRight, Clock3, Plus, Truck, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { StaffShell } from "@/components/staff-shell";
import { BookingPhotos } from "@/components/booking-photos";
import { QuotationEditor, CommunicationTimeline } from "@/components/booking-details";
import { windows } from "@/data/mock-data";
import { JunkBookingForm } from "@/components/junk-booking-form";
import {
  blankJob,
  dateLabel,
  money,
  sources,
  statuses,
  today,
  type DemoData,
  type Job,
  type Pricing,
} from "@/data/mock-data";
import {
  changeData,
  communication,
  quote,
  isCustom,
  jobValue,
  jobPrice,
  priceLabel,
  collectedValue,
  recordPayment,
  cancelJob,
  assignmentError,
  suggestAssignment,
  updateJob,
  useJunk,
} from "@/lib/junk-store";
const pages = [
  "Overview",
  "Bookings",
  "Dispatch",
  "Customers",
  "Payments",
  "Pricing",
  "Routes",
  "Analytics",
];
const input = "h-10 rounded-md border bg-background px-3 text-sm";
export const Route = createFileRoute("/staff")({
  validateSearch: (s: Record<string, unknown>): { section?: string } => ({
    section: typeof s["section"] === "string" ? s["section"] : "Overview",
  }),
  head: () => ({ meta: [{ title: "Operations — Smart-Junk" }] }),
  component: Staff,
});
function Staff() {
  const { section = "Overview" } = Route.useSearch();
  const page = pages.includes(section) ? section : "Overview";
  const { data, ready, error } = useJunk();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const job = data.jobs.find((j) => j.id === selected);
  const act = (fn: () => void) => {
    try {
      fn();
      setNotice("Saved to this demo.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save.");
    }
  };
  return (
    <StaffShell page={page}>
      <div className="space-y-6 p-4 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Smart-Junk operations
            </p>
            <h1 className="font-display text-3xl font-bold">{page}</h1>
          </div>
          <Button disabled={!ready} onClick={() => setCreating(true)}>
            <Plus />
            Create Booking
          </Button>
        </div>
        {(notice || error) && (
          <p
            role="status"
            className="flex items-center justify-between rounded-md border bg-card p-3 text-sm"
          >
            {notice || error}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X />
            </Button>
          </p>
        )}
        {!ready ? (
          <p>Loading demo…</p>
        ) : (
          <>
            {page === "Overview" && <Overview data={data} open={setSelected} />}
            {page === "Bookings" && <Bookings data={data} open={setSelected} />}
            {page === "Dispatch" && <Dispatch data={data} open={setSelected} act={act} />}
            {page === "Routes" && <Routes data={data} open={setSelected} act={act} />}
            {page === "Customers" && <Customers data={data} open={setSelected} />}
            {page === "Pricing" && <PricingEditor data={data} act={act} />}
            {page === "Payments" && <Payments data={data} open={setSelected} act={act} />}
            {page === "Analytics" && <Analytics data={data} />}
          </>
        )}
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>Create Booking</DialogTitle>
              <DialogDescription>
                Phone and email inquiries join the same booking system.
              </DialogDescription>
            </DialogHeader>
            <JunkBookingForm
              manual
              onSaved={(j) => {
                setCreating(false);
                setSelected(j.id);
                setNotice(`Created ${j.id}. Email confirmation simulated.`);
              }}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!job}
          onOpenChange={(v) => {
            if (!v) {
              setSelected("");
              setEditing(false);
            }
          }}
        >
          <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {job?.id} · {job?.name}
              </DialogTitle>
              <DialogDescription>
                Booking details, assignment, and communication history.
              </DialogDescription>
            </DialogHeader>
            {notice && (
              <p role="status" className="rounded border bg-muted p-3 text-sm">
                {notice}
              </p>
            )}
            {job &&
              (editing ? (
                <JunkBookingForm
                  initial={job}
                  manual
                  onSaved={() => {
                    setEditing(false);
                    setNotice("Booking updated. Existing quote preserved.");
                  }}
                />
              ) : (
                <JobDetail
                  key={job.id}
                  job={job}
                  data={data}
                  edit={() => setEditing(true)}
                  act={act}
                />
              ))}
          </DialogContent>
        </Dialog>
      </div>
    </StaffShell>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-5">
        <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
function Metric({
  label,
  value,
  note,
  icon: Icon = Archive,
}: {
  label: string;
  value: string | number;
  note: string;
  icon?: typeof Archive;
}) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-5">
        <span className="grid size-9 place-items-center rounded-md bg-accent text-primary">
          <Icon className="size-4" />
        </span>
        <p className="mt-5 font-display text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
const active = (j: Job) => !["Completed", "Cancelled"].includes(j.status);
function Overview({ data, open }: { data: DemoData; open: (id: string) => void }) {
  const scheduled = data.jobs.filter((j) => j.date === today() && active(j));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric
          icon={Truck}
          label="Today's jobs"
          value={scheduled.length}
          note="Active pickup requests and assignments"
        />
        <Metric
          icon={Clock3}
          label="Pending bookings"
          value={
            data.jobs.filter((j) => ["Requested", "Needs Quote", "Quoted"].includes(j.status))
              .length
          }
          note="Awaiting quote or confirmation"
        />
        <Metric
          label="Completed jobs"
          value={data.jobs.filter((j) => j.status === "Completed").length}
          note="All demo records"
        />
        <Metric
          icon={Banknote}
          label="Estimated revenue"
          value={money(
            data.jobs.filter((j) => j.status !== "Cancelled").reduce((s, j) => s + jobValue(j), 0),
          )}
          note="Non-cancelled quoted value · not collected revenue"
        />
        <Metric
          icon={UsersRound}
          label="Available crews"
          value={
            data.crews.filter((c) => c.available && !scheduled.some((j) => j.crew === c.id)).length
          }
          note="No active job scheduled today"
        />
        <Metric
          icon={Truck}
          label="Available trucks"
          value={
            data.trucks.filter((t) => t.available && !scheduled.some((j) => j.truck === t.id))
              .length
          }
          note="No active job scheduled today"
        />
      </div>
      <Panel title="Needs your attention">
        <div className="grid gap-3 sm:grid-cols-2">
          {data.jobs
            .filter(
              (j) =>
                ["Requested", "Needs Quote", "Quoted"].includes(j.status) ||
                (j.status === "Confirmed" && !j.crew),
            )
            .map((j) => (
              <button
                className="flex items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm hover:bg-accent"
                key={j.id}
                onClick={() => open(j.id)}
              >
                <span>
                  <strong>
                    {j.name} · {j.id}
                  </strong>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {j.status === "Needs Quote"
                      ? "Prepare a custom quote"
                      : j.status === "Quoted"
                        ? "Awaiting customer quote approval"
                        : j.status === "Requested"
                          ? "Review and confirm pickup"
                          : "Assign a crew and truck"}
                  </p>
                </span>
                <ChevronRight className="size-4" />
              </button>
            ))}
        </div>
      </Panel>
      <Panel title="Today's operations">
        <BookingTable jobs={scheduled} open={open} />
      </Panel>
    </div>
  );
}
function BookingTable({ jobs, open }: { jobs: Job[]; open: (id: string) => void }) {
  const { data } = useJunk();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-sm">
        <thead className="border-y bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            {["Booking", "Customer", "Source", "Pickup", "Status", "Payment", "Price"].map((x) => (
              <th className="px-3 py-3" key={x}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="px-3 py-4">
                <button
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                  onClick={() => open(j.id)}
                >
                  {j.id}
                </button>
              </td>
              <td className="px-3">
                {j.name}
                <p className="text-xs text-muted-foreground">
                  {j.city}, {j.state}
                </p>
              </td>
              <td className="px-3">{j.source}</td>
              <td className="px-3">
                {dateLabel(j.date)}
                <p className="text-xs text-muted-foreground">{j.window}</p>
              </td>
              <td className="px-3">
                <StatusBadge>{j.status}</StatusBadge>
                {active(j) && !j.crew && (
                  <p className="mt-1 text-xs text-warning-strong">Unassigned</p>
                )}
                {j.crew && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.crews.find((c) => c.id === j.crew)?.name} ·{" "}
                    {j.volume > 0 ? `${j.volume.toFixed(1)} yd³` : "Capacity needed"}
                  </p>
                )}
                {assignmentError(j, data) && (
                  <p className="mt-1 max-w-40 text-xs text-destructive">
                    {assignmentError(j, data)}
                  </p>
                )}
              </td>
              <td className="px-3">
                <StatusBadge>{j.payment}</StatusBadge>
              </td>
              <td className="px-3 font-semibold">
                {money(jobPrice(j))}
                <p className="text-xs font-normal text-muted-foreground">{priceLabel(j)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!jobs.length && (
        <p className="p-5 text-center text-sm text-muted-foreground">No bookings match.</p>
      )}
    </div>
  );
}
function Bookings({ data, open }: { data: DemoData; open: (id: string) => void }) {
  const [search, setSearch] = useState(""),
    [source, setSource] = useState("All"),
    [status, setStatus] = useState("All"),
    [date, setDate] = useState("");
  const rows = data.jobs.filter(
    (j) =>
      (source === "All" || j.source === source) &&
      (status === "All" || j.status === status) &&
      (!date || j.date === date) &&
      `${j.id} ${j.name} ${j.email} ${j.street}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input
          aria-label="Search bookings"
          placeholder="Search booking, customer, address…"
          className={input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Booking source"
          className={input}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {["All", ...sources].map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All sources" : s}
            </option>
          ))}
        </select>
        <select
          aria-label="Booking status"
          className={input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {["All", ...statuses].map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <input
          aria-label="Filter pickup date"
          type="date"
          className={input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Panel title={`All bookings · ${rows.length}`}>
        <BookingTable jobs={rows} open={open} />
      </Panel>
    </div>
  );
}
function JobDetail({
  job: j,
  data,
  edit,
  act,
}: {
  job: Job;
  data: DemoData;
  edit: () => void;
  act: (fn: () => void) => void;
}) {
  const [crew, setCrew] = useState(j.crew),
    [truck, setTruck] = useState(j.truck),
    [text, setText] = useState(""),
    [channel, setChannel] = useState<"Email" | "SMS" | "Phone" | "Note">("Email");
  const send = (c: typeof channel, t: string) =>
    act(() => {
      updateJob(j.id, (x) => ({
        ...x,
        communications: [...x.communications, communication(c, t)],
      }));
      setText("");
    });
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Pickup details">
          <div className="space-y-2 text-sm">
            <p>
              {j.email} · {j.phone}
            </p>
            <p>
              {j.street}, {j.city}, {j.state} {j.zip}
            </p>
            <p>
              {dateLabel(j.date)} · {j.window}
            </p>
            <p>
              Source: <strong>{j.source}</strong> · Preferred: {j.preferred}
            </p>
            <p>
              {data.pricing.items
                .filter((i) => j.items[i.id])
                .map((i) => `${j.items[i.id]} × ${i.name}`)
                .join(", ")}
            </p>
            <p>
              {j.access}
              {j.access.startsWith("Upstairs") ? ` · Floor ${j.floor}` : ""}
            </p>
            <p>
              Parking nearby: {j.closeParking} · Difficult items: {j.difficult}
            </p>
            {j.project && <p>Project: {j.project}</p>}
            {j.otherItem && <p>Other item: {j.otherItem}</p>}
            <p className="text-xs text-muted-foreground">
              Internal capacity estimate:{" "}
              {j.volume > 0 ? `${j.volume.toFixed(1)} yd³` : "Needs staff review"}
            </p>
            <p>{j.notes || "No additional instructions."}</p>
            <p className="text-lg font-bold">
              {priceLabel(j)}: {money(jobPrice(j))}
            </p>
            <BookingPhotos photos={j.photos} />
            <Button variant="outline" onClick={edit}>
              Edit booking
            </Button>
          </div>
        </Panel>
        <Panel title="Status & dispatch">
          <div className="space-y-3">
            <select
              aria-label="Update job status"
              className={`${input} w-full`}
              value={j.status}
              onChange={(e) => {
                const status = e.target.value as Job["status"];
                act(() =>
                  updateJob(j.id, (x) => ({
                    ...x,
                    status,
                    communications: [
                      ...x.communications,
                      communication(
                        status === "En Route" ? "SMS" : "Email",
                        `${x.id}: ${status === "En Route" ? "Crew arrival update" : status === "Completed" ? "Job completion notification" : `Status updated to ${status}`}.`,
                      ),
                    ],
                  })),
                );
              }}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Select crew"
              className={`${input} w-full`}
              value={crew}
              onChange={(e) => setCrew(e.target.value)}
            >
              <option value="">Select crew</option>
              {data.crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {!c.available ? " · Unavailable" : ""}
                </option>
              ))}
            </select>
            <select
              aria-label="Select truck"
              className={`${input} w-full`}
              value={truck}
              onChange={(e) => setTruck(e.target.value)}
            >
              <option value="">Select truck</option>
              {data.trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.capacity} yd³{!t.available ? " · Unavailable" : ""}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!active(j)}
                onClick={() =>
                  act(() => updateJob(j.id, (x) => ({ ...x, crew, truck, status: "Assigned" })))
                }
              >
                Assign
              </Button>
              <Button
                variant="outline"
                disabled={!active(j)}
                onClick={() =>
                  act(() => {
                    const result = suggestAssignment(j, data);
                    if (!result)
                      throw new Error("No available crew/truck pair fits this window and load.");
                    setCrew(result.crew);
                    setTruck(result.truck);
                  })
                }
              >
                Suggest assignment
              </Button>
              <Button
                variant="outline"
                disabled={!active(j)}
                onClick={() =>
                  act(() => {
                    updateJob(j.id, (x) => ({ ...x, crew: "", truck: "", status: "Confirmed" }));
                    setCrew("");
                    setTruck("");
                  })
                }
              >
                Unassign
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              One crew/truck per two-hour window. Suggestions check availability and load capacity.
            </p>
          </div>
        </Panel>
      </div>
      <Panel title="Quotation & final charge">
        <QuotationEditor job={j} />
      </Panel>
      <Panel title="Communication history">
        <div className="max-h-52 space-y-3 overflow-auto">
          {j.communications.map((c) => (
            <div key={c.id} className="rounded bg-muted p-3 text-sm">
              <p className="mb-1 text-xs text-muted-foreground">
                {c.channel} · {c.status} · {new Date(c.at).toLocaleString("en-US")}
              </p>
              {c.text}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              send(
                "Email",
                `${priceLabel(j)}: ${money(jobPrice(j))}. Final pricing after on-site inspection.`,
              )
            }
          >
            Email quote
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              send(
                "Email",
                `Confirmation: ${j.id}, ${dateLabel(j.date)}, ${j.window}. Status: ${j.status}.`,
              )
            }
          >
            Email confirmation
          </Button>
          <Button
            variant="outline"
            onClick={() => send("SMS", `Pickup reminder: ${dateLabel(j.date)} · ${j.window}.`)}
          >
            SMS reminder
          </Button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[120px_1fr_auto]">
          <select
            aria-label="Communication channel"
            value={channel}
            className={input}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
          >
            {["Email", "SMS", "Phone", "Note"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            aria-label="Communication message"
            placeholder="Message or phone/email inquiry notes"
            className={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button disabled={!text.trim()} onClick={() => send(channel, text.trim())}>
            {channel === "Phone" || channel === "Note" ? "Record" : "Simulate send"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Email is used for quotes, confirmations, invoices, and receipts. SMS is used for reminders
          and arrival updates. No messages are delivered.
        </p>
      </Panel>
    </div>
  );
}
function Dispatch({
  data,
  open,
  act,
}: {
  data: DemoData;
  open: (id: string) => void;
  act: (fn: () => void) => void;
}) {
  const [date, setDate] = useState(today());
  const jobs = data.jobs
    .filter((j) => j.date === date && active(j))
    .sort((a, b) => windows.indexOf(a.window) - windows.indexOf(b.window));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <input
          aria-label="Dispatch date"
          className={input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button variant="outline" onClick={() => setDate(today())}>
          Today
        </Button>
      </div>
      <p className="rounded-lg bg-warning-soft p-3 text-sm text-warning-strong">
        {jobs.filter((j) => !j.crew).length} unassigned job(s) on this date. Open a job to assign
        its crew and truck.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {data.trucks
          .filter((t) => t.available)
          .map((t) => (
            <Panel title={t.name} key={t.id}>
              {windows.map((w) => {
                const assigned = jobs.filter((j) => j.truck === t.id && j.window === w);
                const volume = assigned.reduce((n, j) => n + j.volume, 0);
                return (
                  <div key={w} className="mb-3">
                    <div className="flex justify-between gap-2 text-xs">
                      <span>{w}</span>
                      <strong
                        className={
                          assigned.length > 1 || volume > t.capacity ? "text-destructive" : ""
                        }
                      >
                        {volume.toFixed(1)} / {t.capacity} yd³
                        {assigned.length > 1 ? " · Conflict" : ""}
                      </strong>
                    </div>
                    <div className="mt-1 h-1.5 rounded bg-muted">
                      <div
                        className="h-1.5 rounded bg-primary"
                        style={{ width: `${Math.min(100, (volume / t.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </Panel>
          ))}
      </div>
      <Panel title={`Schedule · ${dateLabel(date)}`}>
        <BookingTable jobs={jobs} open={open} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Crews">
          {data.crews.map((c) => (
            <label
              key={c.id}
              className="flex items-center justify-between gap-3 border-t py-4 text-sm"
            >
              <span>
                <strong>{c.name}</strong>
                <p className="text-xs text-muted-foreground">{c.members}</p>
              </span>
              <span className="flex gap-2">
                <input
                  type="checkbox"
                  checked={c.available}
                  onChange={(e) => {
                    const available = e.target.checked;
                    act(() =>
                      changeData((d) => {
                        if (!available && d.jobs.some((j) => active(j) && j.crew === c.id))
                          throw new Error(
                            "Unassign active jobs before making this crew unavailable.",
                          );
                        return {
                          ...d,
                          crews: d.crews.map((x) => (x.id === c.id ? { ...x, available } : x)),
                        };
                      }),
                    );
                  }}
                />
                Available
              </span>
            </label>
          ))}
        </Panel>
        <Panel title="Trucks">
          {data.trucks.map((t) => (
            <label
              key={t.id}
              className="flex items-center justify-between gap-3 border-t py-4 text-sm"
            >
              <span>
                <strong>{t.name}</strong>
                <p className="text-xs text-muted-foreground">{t.capacity} yd³ capacity</p>
              </span>
              <span className="flex gap-2">
                <input
                  type="checkbox"
                  checked={t.available}
                  onChange={(e) => {
                    const available = e.target.checked;
                    act(() =>
                      changeData((d) => {
                        if (!available && d.jobs.some((j) => active(j) && j.truck === t.id))
                          throw new Error(
                            "Unassign active jobs before making this truck unavailable.",
                          );
                        return {
                          ...d,
                          trucks: d.trucks.map((x) => (x.id === t.id ? { ...x, available } : x)),
                        };
                      }),
                    );
                  }}
                />
                Available
              </span>
            </label>
          ))}
        </Panel>
      </div>
    </div>
  );
}
function Routes({
  data,
  open,
  act,
}: {
  data: DemoData;
  open: (id: string) => void;
  act: (fn: () => void) => void;
}) {
  const [date, setDate] = useState(today());
  const reorder = (ids: string[]) =>
    changeData((d) => ({
      ...d,
      jobs: d.jobs.map((j) => (ids.includes(j.id) ? { ...j, order: ids.indexOf(j.id) } : j)),
    }));
  return (
    <div className="space-y-5">
      <input
        type="date"
        className={input}
        aria-label="Route date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        Manual stop order for the selected day. Suggested order groups ZIP codes; it does not
        optimize distance or travel time and does not change pickup windows.
      </p>
      {data.crews.map((c) => {
        const jobs = data.jobs
          .filter((j) => active(j) && j.date === date && j.crew === c.id)
          .sort((a, b) => a.order - b.order);
        return (
          <Panel key={c.id} title={c.name}>
            <Button
              size="sm"
              variant="outline"
              disabled={jobs.length < 2}
              onClick={() =>
                act(() =>
                  reorder(
                    [...jobs]
                      .sort(
                        (a, b) => a.zip.localeCompare(b.zip) || a.street.localeCompare(b.street),
                      )
                      .map((j) => j.id),
                  ),
                )
              }
            >
              Suggest ZIP order
            </Button>
            {jobs.map((j, i) => (
              <div
                key={j.id}
                className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm"
              >
                <button className="text-left" onClick={() => open(j.id)}>
                  <strong>
                    {i + 1}. {j.name} · {j.id}
                  </strong>
                  <p>
                    {j.street}, {j.zip}
                  </p>
                  <p className="text-xs text-muted-foreground">{j.window}</p>
                </button>
                <div className="flex gap-2">
                  {[-1, 1].map((delta) => (
                    <Button
                      key={delta}
                      size="sm"
                      variant="outline"
                      disabled={i + delta < 0 || i + delta >= jobs.length}
                      onClick={() =>
                        act(() => {
                          const ids = jobs.map((j) => j.id);
                          [ids[i], ids[i + delta]] = [ids[i + delta]!, ids[i]!];
                          reorder(ids);
                        })
                      }
                    >
                      {delta === -1 ? "Move up" : "Move down"}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {!jobs.length && (
              <p className="mt-4 text-sm text-muted-foreground">No assigned stops.</p>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
function Customers({ data, open }: { data: DemoData; open: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const customer = data.customers.find((c) => c.id === selected);
  const jobs = data.jobs.filter((j) => j.customerId === selected);
  const rows = data.customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <input
        aria-label="Search customers"
        placeholder="Search customer name, email, or phone"
        className={`${input} w-full`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Panel title={`Customers · ${rows.length}`}>
        <div className="overflow-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                {["Customer & contact", "Bookings", "Last pickup", "Total paid"].map((h) => (
                  <th className="p-3" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const history = data.jobs.filter((j) => j.customerId === c.id);
                const latest = [...history].sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3">
                      <button
                        className="font-semibold text-primary hover:underline"
                        onClick={() => {
                          setSelected(c.id);
                          setNotes(c.notes);
                          setNotice("");
                        }}
                      >
                        {c.name}
                      </button>
                      <p className="text-xs text-muted-foreground">
                        {c.email} · {c.phone}
                      </p>
                    </td>
                    <td className="p-3">{history.length}</td>
                    <td className="p-3">{latest ? dateLabel(latest.date) : "—"}</td>
                    <td className="p-3 font-semibold">
                      {money(history.reduce((n, j) => n + collectedValue(j), 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-4 text-sm text-muted-foreground">No matching customers.</p>
          )}
        </div>
      </Panel>
      <Dialog
        open={!!customer}
        onOpenChange={(v) => {
          if (!v) setSelected("");
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{customer?.name} · Customer profile</DialogTitle>
            <DialogDescription>
              Contact details, addresses, bookings, payments, and staff notes.
            </DialogDescription>
          </DialogHeader>
          {customer && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Panel title="Contact">
                  <p className="text-sm">
                    {customer.email}
                    <br />
                    {customer.phone}
                    <br />
                    Preferred: {customer.preferred}
                  </p>
                </Panel>
                <Panel title="Saved pickup addresses">
                  {[...new Set(jobs.map((j) => `${j.street}, ${j.city}, ${j.state} ${j.zip}`))].map(
                    (a) => (
                      <p className="mb-2 text-sm" key={a}>
                        {a}
                      </p>
                    ),
                  )}
                </Panel>
              </div>
              <Panel title="Booking history">
                <BookingTable
                  jobs={jobs}
                  open={(id) => {
                    setSelected("");
                    open(id);
                  }}
                />
              </Panel>
              <Panel title="Payment history">
                {jobs.map((j) => (
                  <p key={j.id} className="border-t py-3 text-sm">
                    {j.id} · {j.payment} ·{" "}
                    {j.payment === "Paid" ? money(collectedValue(j)) : "Not collected"}{" "}
                    {j.invoice && `· ${j.invoice}`}
                  </p>
                ))}
              </Panel>
              <Panel title="Internal staff notes">
                <textarea
                  aria-label="Customer staff notes"
                  className="min-h-24 w-full rounded border p-3 text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button
                  className="mt-3"
                  onClick={() => {
                    try {
                      changeData((d) => ({
                        ...d,
                        customers: d.customers.map((c) =>
                          c.id === customer.id ? { ...c, notes } : c,
                        ),
                        jobs: d.jobs.map((j, i) =>
                          i === d.jobs.findIndex((x) => x.customerId === customer.id)
                            ? {
                                ...j,
                                communications: [
                                  ...j.communications,
                                  communication("Note", `Customer profile note: ${notes}`),
                                ],
                              }
                            : j,
                        ),
                      }));
                      setNotice("Customer notes saved.");
                    } catch {
                      setNotice("Could not save notes.");
                    }
                  }}
                >
                  Save notes
                </Button>
                {notice && (
                  <p role="status" className="mt-2 text-sm">
                    {notice}
                  </p>
                )}
              </Panel>
              <Panel title="Communication timeline">
                <CommunicationTimeline jobs={jobs} internal />
              </Panel>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function PricingEditor({ data, act }: { data: DemoData; act: (fn: () => void) => void }) {
  const [p, setP] = useState<Pricing>(() => structuredClone(data.pricing));
  const save = () =>
    act(() => {
      const nums = [...p.items.map((i) => i.price), p.minimum, p.stairs, p.parking, p.heavy];
      if (nums.some((n) => !Number.isFinite(n) || n < 0))
        throw new Error("Enter valid non-negative prices.");
      changeData((d) => ({ ...d, pricing: p }));
    });
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        New quotations use these prices. Existing saved quotations stay unchanged.
      </p>
      <Panel title="Item prices">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((item, i) => (
            <label key={item.id} className="text-sm font-semibold">
              {item.name} · USD
              <input
                className={`${input} mt-1 w-full`}
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) =>
                  setP({
                    ...p,
                    items: p.items.map((x, n) =>
                      n === i ? { ...x, price: Number(e.target.value) } : x,
                    ),
                  })
                }
              />
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Minimum pickup charge">
        <label className="text-sm font-semibold">
          Minimum pickup fee · USD
          <input
            aria-label="Minimum pickup fee"
            className={`${input} mt-2 w-full`}
            type="number"
            min="0"
            step="0.01"
            value={p.minimum}
            onChange={(e) => setP({ ...p, minimum: Number(e.target.value) })}
          />
        </label>
        <p className="mt-3 text-xs text-muted-foreground">
          Standard estimate = higher of item subtotal or this minimum, plus explicitly configured
          fees. Truck capacity never determines a standard price.
        </p>
      </Panel>
      <Panel title="Optional additional service fees">
        <p className="mb-4 text-xs text-muted-foreground">
          All default to $0. A fee applies only for a definite answer that matches the rule. “Not
          sure” is never charged.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {(["stairs", "parking", "heavy"] as const).map((k) => (
            <label className="text-sm" key={k}>
              {k === "stairs"
                ? "Per floor without elevator"
                : k === "parking"
                  ? "Parking / long carry"
                  : "Heavy-item labor"}{" "}
              · USD
              <input
                className={`${input} mt-1 w-full`}
                type="number"
                min="0"
                step="0.01"
                value={p[k]}
                onChange={(e) => setP({ ...p, [k]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
      </Panel>
      <Button onClick={save}>Save pricing</Button>
    </div>
  );
}
function Payments({
  data,
  open,
  act,
}: {
  data: DemoData;
  open: (id: string) => void;
  act: (fn: () => void) => void;
}) {
  return (
    <Panel title="Mock invoices & payments">
      <p className="mb-4 text-xs text-muted-foreground">
        Invoices identify the current estimate, quote, or final charge. Record the final charge in
        job details before collecting a mock payment. All payments and delivery are simulated.
      </p>
      {data.jobs
        .filter((j) => j.status !== "Cancelled")
        .map((j) => (
          <div
            key={j.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t py-4"
          >
            <button onClick={() => open(j.id)} className="text-left text-sm">
              <strong>
                {j.name} · {j.id}
              </strong>
              <p>
                {j.invoice || "Invoice not created"} · {money(jobPrice(j))} · {j.payment}
              </p>
            </button>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  act(() =>
                    updateJob(j.id, (x) => ({
                      ...x,
                      invoice: `INV-${x.id}`,
                      communications: [
                        ...x.communications,
                        communication(
                          "Email",
                          `Invoice INV-${x.id}: ${priceLabel(x)} ${money(jobPrice(x))}.`,
                        ),
                      ],
                    })),
                  )
                }
              >
                Email invoice
              </Button>
              <Button
                size="sm"
                disabled={j.payment === "Paid" || j.finalCharge == null}
                onClick={() => act(() => recordPayment(j.id))}
              >
                Mark paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={j.payment !== "Paid"}
                onClick={() =>
                  act(() =>
                    updateJob(j.id, (x) => ({
                      ...x,
                      payment: "Refunded",
                      communications: [
                        ...x.communications,
                        communication("Email", "Demo refund recorded."),
                      ],
                    })),
                  )
                }
              >
                Mock refund
              </Button>
            </div>
          </div>
        ))}
    </Panel>
  );
}
function Analytics({ data }: { data: DemoData }) {
  const jobs = data.jobs.filter((j) => j.status !== "Cancelled");
  const revenue = jobs.reduce((s, j) => s + jobValue(j), 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Quoted value" value={money(revenue)} note="All non-cancelled jobs" />
        <Metric
          label="Mock collected revenue"
          value={money(data.jobs.reduce((s, j) => s + collectedValue(j), 0))}
          note="Paid demo records only"
        />
        <Metric
          label="Average job value"
          value={money(jobs.length ? revenue / jobs.length : 0)}
          note="Non-cancelled estimates"
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Jobs by status">
          {statuses.map((s) => (
            <div className="flex justify-between border-t py-3 text-sm" key={s}>
              <span>{s}</span>
              <strong>{data.jobs.filter((j) => j.status === s).length}</strong>
            </div>
          ))}
        </Panel>
        <Panel title="Crew workload">
          {data.crews.map((c) => (
            <div className="flex justify-between border-t py-3 text-sm" key={c.id}>
              <span>{c.name}</span>
              <strong>
                {data.jobs.filter((j) => j.crew === c.id && active(j)).length} active jobs
              </strong>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Today's truck utilization estimates">
        <p className="mb-4 text-xs text-muted-foreground">
          Sum of estimated load / truck capacity across five daily windows. Excludes cancelled jobs;
          assumes one unload per window. No GPS or travel-time data.
        </p>
        {data.trucks.map((t) => {
          const load = data.jobs
            .filter((j) => j.truck === t.id && j.date === today() && j.status !== "Cancelled")
            .reduce((s, j) => s + j.volume, 0);
          const percent = Math.min(100, Math.round((load / (t.capacity * 5)) * 100));
          return (
            <div key={t.id} className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>{t.name}</span>
                <strong>
                  {percent}% · {load.toFixed(1)} yd³
                </strong>
              </div>
              <div className="h-2 rounded bg-muted">
                <div className="h-2 rounded bg-primary" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
