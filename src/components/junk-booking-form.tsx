import { useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  Truck,
  Sofa,
  Refrigerator,
  Monitor,
  Package,
  Briefcase,
  Hammer,
  HelpCircle,
  Check,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { StatusBadge } from "./status-badge";
import { BookingPhotos } from "./booking-photos";
import { PhotoEstimateStep } from "./photo-estimate-step";
import { DepositStep } from "./deposit-step";
import { company } from "@/data/company";
import {
  blankJob,
  dateLabel,
  money,
  services,
  sources,
  today,
  windows,
  type Job,
  type Communication,
} from "@/data/mock-data";
import { isCustom, quote, saveJob, useJunk, validateJob } from "@/lib/junk-store";
import { cn } from "@/lib/utils";
const input = "mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm";
const icons = [Sofa, Refrigerator, Monitor, Package, Briefcase, Hammer];
export function JunkBookingForm({
  initial,
  manual = false,
  onSaved,
  chatHistory = [],
}: {
  initial?: Job;
  manual?: boolean;
  onSaved?: (j: Job) => void;
  chatHistory?: Communication[];
}) {
  const { data, ready, error: storeError } = useJunk();
  const [job, setJob] = useState<Job>(() => ({
    ...blankJob(),
    ...initial,
    source: initial?.source ?? (manual ? "Phone" : "Website"),
    submissionKey: initial?.submissionKey || crypto.randomUUID(),
  }));
  const [step, setStep] = useState(manual ? 1 : 0);
  const [extraItem, setExtraItem] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Job | null>(null);
  const [category, setCategory] = useState("Furniture");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const set = <K extends keyof Job>(key: K, value: Job[K]) =>
    setJob((j) => ({ ...j, [key]: value }));
  const [extraNote, setExtraNote] = useState("");
  const addExtraItem = () => {
    const raw = extraItem.trim();
    if (!raw) return;
    const qty = Number(raw.match(/\d+/)?.[0] ?? 1) || 1;
    const words = raw.toLowerCase().replace(/\d+/g, "").trim();
    const match = data.pricing.items.find(
      (i) => words.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(words),
    );
    if (match) {
      setJob((j) => ({ ...j, items: { ...j.items, [match.id]: (j.items[match.id] || 0) + qty } }));
      setExtraNote(`Added ${qty} × ${match.name}.`);
    } else {
      setJob((j) => ({ ...j, otherItem: [j.otherItem, raw].filter(Boolean).join(", ") }));
      setExtraNote(`"${raw}" isn't on the price list — staff will quote it.`);
    }
    setExtraItem("");
  };
  const q = quote(job, data.pricing);
  const labels = [
    "Photo estimate",
    "Did we miss anything?",
    "Pickup details",
    "Contact & schedule",
    "Review & request",
  ];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current || busy) return;
    setError("");
    // step 1 — confirm the item list the photo scan produced
    if (step === 1) {
      if (
        job.mode === "custom"
          ? !job.project.trim()
          : !Object.values(job.items).some((n) => n > 0) && !job.otherItem.trim()
      ) {
        setError(
          job.mode === "custom"
            ? "Tell us about your cleanup."
            : "Choose an item or describe an unlisted item.",
        );
        return;
      }
      setStep(2);
      return;
    }
    // step 2 — pickup details
    if (step === 2) {
      if (
        job.access.startsWith("Upstairs") &&
        (!Number.isInteger(job.floor) || job.floor < 1 || job.floor > 100)
      ) {
        setError("Enter a floor number from 1 to 100.");
        return;
      }
      setStep(3);
      return;
    }
    const invalid = validateJob(job, data.pricing);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    submitting.current = true;
    try {
      const record = saveJob({
        ...job,
        communications: initial?.id
          ? job.communications
          : chatHistory.length
            ? [...chatHistory, ...job.communications]
            : job.communications,
      });
      setSaved(record);
      onSaved?.(record);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save booking.");
      submitting.current = false;
    }
  };
  const existingCustomer = (id: string) => {
    const c = data.customers.find((c) => c.id === id);
    if (!c) {
      setJob((j) => ({
        ...j,
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "Austin",
        state: "TX",
        zip: "",
        preferred: "Email",
        customerId: "",
      }));
      return;
    }
    const previous = data.jobs.find((j) => j.customerId === id);
    setJob((j) => ({
      ...j,
      name: c.name,
      email: c.email,
      phone: c.phone,
      preferred: c.preferred,
      street: previous?.street ?? "",
      city: previous?.city ?? "Austin",
      state: previous?.state ?? "TX",
      zip: previous?.zip ?? "",
    }));
  };
  // A saved booking now goes to the deposit, which confirms it. Manual
  // (staff-entered) bookings skip payment — the office isn't taking a card.
  if (saved)
    return manual ? (
      <Card>
        <CardContent className="space-y-5 p-6 text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h2 className="font-display text-2xl font-bold">
            {initial?.id ? "Booking updated" : "Booking created"}
          </h2>
          <p className="font-semibold">
            {saved.id} <StatusBadge>{saved.status}</StatusBadge>
          </p>
          <Button asChild>
            <Link to="/staff">Back to the dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    ) : (
      <DepositStep job={saved} deposit={company.deposit} />
    );
  return (
    <form onSubmit={submit} className="space-y-6 pb-14 lg:pb-0">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {labels.map((l, i) => (
          <li key={l}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className="w-full text-left"
            >
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
              <p
                className={cn(
                  "mt-2 text-xs sm:text-sm",
                  i === step ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                {i + 1}. {l}
              </p>
            </button>
          </li>
        ))}
      </ol>
      {(error || storeError) && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error || storeError}
        </p>
      )}
      <div className="grid items-start gap-6">
        <Card>
          <CardContent className="space-y-6 p-5 sm:p-6">
            {step === 0 && (
              <PhotoEstimateStep
                minimum={data.pricing.minimum}
                onConfirm={(items, addMore) => {
                  setJob((j) => ({ ...j, mode: "standard", items: { ...j.items, ...items } }));
                  // "Looks right" skips the edit step entirely — only people who
                  // say something is missing get sent there.
                  setStep(addMore ? 1 : 2);
                }}
                onSkip={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <>
                <h2 className="font-display text-2xl font-bold">Did we miss anything?</h2>
                <p className="-mt-3 text-sm text-muted-foreground">
                  Add or remove anything before we price it. Nothing is booked yet.
                </p>

                {/* Type what the photo missed — matches the price list where it can. */}
                <div className="rounded-xl border bg-accent/40 p-4">
                  <label htmlFor="missed-item" className="text-sm font-semibold">
                    Something the photo missed?
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="missed-item"
                      value={extraItem}
                      onChange={(e) => setExtraItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExtraItem();
                        }
                      }}
                      placeholder="e.g. mattress, fridge, 3 bags"
                      className="h-11 flex-1 rounded-md border bg-background px-3 text-sm"
                    />
                    <Button type="button" variant="outline" onClick={addExtraItem}>
                      <Plus className="size-4" /> Add
                    </Button>
                  </div>
                  {extraNote && (
                    <p className="mt-2 text-xs font-medium text-primary">{extraNote}</p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["standard", "custom"] as const).map((mode) => (
                    <button
                      type="button"
                      aria-pressed={job.mode === mode}
                      key={mode}
                      onClick={() => set("mode", mode)}
                      className={cn(
                        "rounded-xl border-2 p-4 text-left transition",
                        job.mode === mode
                          ? "border-primary bg-accent"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        {mode === "standard" ? (
                          <Sofa className="text-primary" />
                        ) : (
                          <Truck className="text-primary" />
                        )}
                        {job.mode === mode && <Check className="size-5 text-primary" />}
                      </div>
                      <h3 className="font-bold">
                        {mode === "standard" ? "Select Your Items" : "Large Cleanup / Custom Quote"}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {mode === "standard"
                          ? "Choose the items you'd like removed and get an instant estimate."
                          : "Clearing out a room, garage, or property? Tell us about it and we'll prepare a quote."}
                      </p>
                    </button>
                  ))}
                </div>
                {job.mode === "standard" ? (
                  <>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Item categories">
                      {services.map((s) => (
                        <Button
                          type="button"
                          key={s}
                          variant={category === s ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCategory(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.pricing.items
                        .filter((i) => i.category === category)
                        .map((i) => {
                          const Icon = icons[services.indexOf(i.category)] ?? Package;
                          return (
                            <div
                              className={cn(
                                "rounded-xl border p-4",
                                job.items[i.id] ? "border-primary bg-accent/40" : "bg-card",
                              )}
                              key={i.id}
                            >
                              <Icon className="mb-3 size-8 text-primary" />
                              <h3 className="font-semibold">{i.name}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {money(i.price)} each
                              </p>
                              <div className="mt-4 flex items-center justify-between gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  disabled={!job.items[i.id]}
                                  aria-label={`Remove ${i.name}`}
                                  onClick={() =>
                                    set("items", {
                                      ...job.items,
                                      [i.id]: Math.max(0, (job.items[i.id] || 0) - 1),
                                    })
                                  }
                                >
                                  <Minus />
                                </Button>
                                <input
                                  aria-label={`${i.name} quantity`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="h-10 w-14 rounded border text-center text-sm"
                                  value={job.items[i.id] || 0}
                                  onChange={(e) =>
                                    set("items", { ...job.items, [i.id]: Number(e.target.value) })
                                  }
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  disabled={(job.items[i.id] || 0) >= 100}
                                  aria-label={`Add ${i.name}`}
                                  onClick={() =>
                                    set("items", {
                                      ...job.items,
                                      [i.id]: (job.items[i.id] || 0) + 1,
                                    })
                                  }
                                >
                                  <Plus />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <label className="block rounded-xl border bg-muted/40 p-4 text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <HelpCircle className="size-4" />
                        Other item
                      </span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        Can't find your item? Describe it and our team will prepare a quote for your
                        request.
                      </span>
                      <input
                        className={input}
                        value={job.otherItem}
                        onChange={(e) => set("otherItem", e.target.value)}
                        placeholder="Item name, quantity, and a few details"
                      />
                    </label>
                  </>
                ) : (
                  <label className="block text-sm font-semibold">
                    Tell us about your cleanup
                    <textarea
                      className="mt-2 min-h-32 w-full rounded-md border p-3 text-sm"
                      value={job.project}
                      onChange={(e) => set("project", e.target.value)}
                      placeholder="What space are you clearing? What needs to go?"
                    />
                    <span className="mt-2 block text-xs font-normal text-muted-foreground">
                      A few photos are especially helpful for large cleanups. Our team reviews them
                      before preparing a quote.
                    </span>
                  </label>
                )}
                <BookingPhotos
                  photos={job.photos}
                  onChange={(photos) => set("photos", photos)}
                  onBusy={setBusy}
                />
                <p className="rounded bg-muted p-3 text-xs text-muted-foreground">
                  We can't accept hazardous waste, chemicals, asbestos, weapons, or medical waste.
                  Contact staff about uncertain items.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-display text-2xl font-bold">Pickup details</h2>
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">
                    Where will our team collect the items?
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        "Outside / curbside",
                        "Inside on the ground floor",
                        "Upstairs with elevator",
                        "Upstairs without elevator",
                      ] as const
                    ).map((access) => (
                      <label
                        key={access}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm",
                          job.access === access ? "border-primary bg-accent" : "",
                        )}
                      >
                        <input
                          type="radio"
                          name="access"
                          checked={job.access === access}
                          onChange={() => set("access", access)}
                        />
                        {access}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {job.access.startsWith("Upstairs") && (
                  <label className="block text-sm font-semibold">
                    Which floor are the items on?
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className={input}
                      value={job.floor}
                      onChange={(e) => set("floor", Number(e.target.value))}
                    />
                  </label>
                )}
                {(
                  [
                    {
                      key: "closeParking",
                      label: "Can our truck park close to your pickup location?",
                    },
                    {
                      key: "difficult",
                      label: "Are any items unusually heavy or difficult to move?",
                    },
                  ] as const
                ).map(({ key, label }) => (
                  <fieldset key={key}>
                    <legend className="mb-3 text-sm font-semibold">{label}</legend>
                    <div className="flex flex-wrap gap-3">
                      {(["Yes", "No", "Not sure"] as const).map((v) => (
                        <label
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm",
                            job[key] === v ? "border-primary bg-accent" : "",
                          )}
                          key={v}
                        >
                          <input
                            type="radio"
                            name={key}
                            checked={job[key] === v}
                            onChange={() => set(key, v)}
                          />
                          {v}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <p className="rounded-lg bg-accent p-4 text-sm">
                  These details help our team plan your pickup. “Not sure” won't add a fee. Any
                  configured charges appear in your estimate before you submit.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="font-display text-2xl font-bold">Contact & schedule</h2>
                {manual && !initial?.id && (
                  <label className="block text-sm font-semibold">
                    Customer
                    <select
                      className={input}
                      defaultValue=""
                      onChange={(e) => existingCustomer(e.target.value)}
                    >
                      <option value="">Create a new customer</option>
                      {data.customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} · {c.email}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["name", "email", "phone", "street", "city", "state", "zip"] as const).map(
                    (k) => (
                      <label
                        key={k}
                        className={cn(
                          "block text-sm font-semibold",
                          k === "street" ? "sm:col-span-2" : "",
                        )}
                      >
                        {
                          {
                            name: "Full name",
                            email: "Email",
                            phone: "US phone",
                            street: "Street address / apartment",
                            city: "City",
                            state: "State (e.g. TX)",
                            zip: "ZIP code",
                          }[k]
                        }
                        <input
                          required
                          className={input}
                          type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                          value={job[k]}
                          onChange={(e) =>
                            set(k, k === "state" ? e.target.value.toUpperCase() : e.target.value)
                          }
                          autoComplete={
                            k === "name"
                              ? "name"
                              : k === "email"
                                ? "email"
                                : k === "phone"
                                  ? "tel"
                                  : k === "street"
                                    ? "street-address"
                                    : undefined
                          }
                        />
                      </label>
                    ),
                  )}
                  <label className="block text-sm font-semibold">
                    Pickup date
                    <input
                      required
                      type="date"
                      min={today()}
                      className={input}
                      value={job.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                  </label>
                  <label className="block text-sm font-semibold">
                    Preferred time window
                    <select
                      className={input}
                      value={job.window}
                      onChange={(e) => set("window", e.target.value)}
                    >
                      {windows.map((w) => (
                        <option key={w}>{w}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">
                    Preferred contact
                    <select
                      className={input}
                      value={job.preferred}
                      onChange={(e) => set("preferred", e.target.value as Job["preferred"])}
                    >
                      {["Email", "SMS", "Phone"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  {manual && (
                    <label className="block text-sm font-semibold">
                      Booking source
                      <select
                        className={input}
                        value={job.source}
                        onChange={(e) => set("source", e.target.value as Job["source"])}
                      >
                        {sources.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <label className="block text-sm font-semibold">
                  Additional notes
                  <textarea
                    className="mt-1 min-h-24 w-full rounded-md border p-3 text-sm"
                    value={job.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Elevator, parking, gate code, item details…"
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Austin metro demo. Your time window is a request until staff confirms
                  availability.
                </p>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="font-display text-2xl font-bold">Review & request</h2>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Items & pickup</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(3)}>
                    Edit items
                  </Button>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm leading-7">
                  {job.mode === "custom" ? (
                    <p>{job.project}</p>
                  ) : (
                    data.pricing.items
                      .filter((i) => job.items[i.id])
                      .map((i) => (
                        <p key={i.id}>
                          {job.items[i.id]} × {i.name}
                        </p>
                      ))
                  )}
                  {job.otherItem && <p>Other item: {job.otherItem} · staff review required</p>}
                  <p>
                    {job.access}
                    {job.access.startsWith("Upstairs") ? ` · Floor ${job.floor}` : ""}
                  </p>
                  <p>
                    Truck parking nearby: {job.closeParking} · Difficult items: {job.difficult}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Edit pickup details
                </Button>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Contact & schedule</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(2)}>
                    Edit contact
                  </Button>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm leading-7">
                  <p className="font-semibold">{job.name}</p>
                  <p>
                    {job.email} · {job.phone}
                  </p>
                  <p>
                    {job.street}, {job.city}, {job.state} {job.zip}
                  </p>
                  <p>
                    {dateLabel(job.date)} · {job.window}
                  </p>
                  <p>Preferred contact: {job.preferred}</p>
                  <p>{job.notes}</p>
                </div>
                <BookingPhotos photos={job.photos} />
                <p className="text-sm text-muted-foreground">
                  By requesting a pickup, you agree that staff will review availability. Estimates
                  are subject to on-site inspection; your team will confirm the final charge before
                  removal. No payment is collected here.
                </p>
                {initial?.id && (
                  <p className="rounded border p-3 text-xs text-muted-foreground">
                    Your saved price stays unchanged when editing details. Staff can revise it with
                    a reason.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeft />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button size="lg" disabled={!ready || busy} type="submit">
          {step === 4 ? (initial?.id ? "Save changes" : "Request Pickup") : "Continue"}
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
