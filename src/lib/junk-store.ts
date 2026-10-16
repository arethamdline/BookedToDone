import { useEffect, useState } from "react";
import {
  blankJob,
  seedData,
  today,
  windows,
  type DemoData,
  type Job,
  type Pricing,
  type Communication,
  type Customer,
} from "@/data/mock-data";
const KEY = "smart-junk-demo-v1",
  EVENT = "smart-junk-change";
export function migrateData(raw: DemoData): DemoData {
  if (raw.version === 2) return raw;
  const jobs = raw.jobs.map((old) => ({
    ...blankJob(),
    ...old,
    submissionKey: old.id,
    originalEstimate: old.estimate,
    finalCharge: old.payment === "Paid" ? old.estimate : null,
    access:
      old.stairs > 0 ? ("Upstairs without elevator" as const) : ("Outside / curbside" as const),
    floor: old.stairs || 1,
    closeParking: old.parking ? ("No" as const) : ("Yes" as const),
    difficult: old.heavy ? ("Yes" as const) : ("No" as const),
  }));
  return {
    ...raw,
    version: 2,
    jobs,
    pricing: { ...raw.pricing, minimum: 125, stairs: 0, parking: 0, heavy: 0 },
    customers: jobs
      .filter((j, i, a) => a.findIndex((x) => x.customerId === j.customerId) === i)
      .map((j) => ({
        id: j.customerId,
        name: j.name,
        email: j.email,
        phone: j.phone,
        preferred: j.preferred,
        notes: "",
      })),
  };
}
export function readData(): DemoData {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const original = JSON.parse(raw);
    const data = migrateData(original);
    if (original.version !== 2) localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }
  const data = seedData();
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}
export const isCustom = (j: Job) => j.mode === "custom" || !!j.otherItem.trim();
export const jobValue = (j: Job) => j.finalCharge ?? j.quotedAmount ?? j.estimate ?? 0;
export const priceLabel = (j: Job) =>
  j.finalCharge != null
    ? "Final charge"
    : j.quotedAmount != null
      ? "Staff quote"
      : j.estimate != null
        ? "Estimate"
        : "Needs a quote";
export const jobPrice = (j: Job) => j.finalCharge ?? j.quotedAmount ?? j.estimate;
export const collectedValue = (j: Job) => (j.payment === "Paid" ? jobValue(j) : 0);
export const canCancel = (j: Job) =>
  ["Requested", "Needs Quote", "Quoted", "Confirmed", "Assigned"].includes(j.status);
export const customerJobs = (data: DemoData, customerId: string) =>
  data.jobs.filter((j) => j.customerId === customerId);
export function selectCustomer(id: string) {
  localStorage.setItem("smart-junk-customer-session", id);
  window.dispatchEvent(new Event(EVENT));
}
export function cancelJob(id: string) {
  updateJob(id, (j) => {
    if (!canCancel(j))
      throw new Error("This pickup can no longer be cancelled. Contact staff for help.");
    return {
      ...j,
      status: "Cancelled",
      communications: [
        ...j.communications,
        communication("Email", "Pickup cancelled. Confirmation simulated."),
      ],
    };
  });
}
export function changeData(fn: (d: DemoData) => DemoData) {
  const next = fn(readData());
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}
export function useJunk() {
  const [data, setData] = useState<DemoData>(() => seedData());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const sync = () => {
      try {
        setData(readData());
        setError("");
      } catch {
        setError("Demo data could not be loaded. Check browser storage.");
      }
      setReady(true);
    };
    sync();
    const storage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) sync();
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return { data, ready, error };
}
export function quote(job: Job, p: Pricing) {
  const itemTotal = p.items.reduce((s, i) => s + i.price * (job.items[i.id] || 0), 0);
  const itemVolume = p.items.reduce((s, i) => s + i.volume * (job.items[i.id] || 0), 0);
  const volume = isCustom(job) ? Math.max(job.volume || 0, itemVolume) : itemVolume;
  const lines = p.items
    .filter((i) => (job.items[i.id] || 0) > 0)
    .map((i) => ({ label: `${job.items[i.id]} × ${i.name}`, amount: i.price * job.items[i.id]! }));
  if (isCustom(job)) return { volume, estimate: null, lines: job.mode === "custom" ? [] : lines };
  if (itemTotal < p.minimum)
    lines.push({
      label: `Minimum pickup charge (${p.minimum.toFixed(2)} USD minimum)`,
      amount: p.minimum - itemTotal,
    });
  if (job.access === "Upstairs without elevator" && p.stairs > 0)
    lines.push({ label: `Upstairs access · ${job.floor} floor(s)`, amount: job.floor * p.stairs });
  if (job.closeParking === "No" && p.parking > 0)
    lines.push({ label: "Additional parking / carry fee", amount: p.parking });
  if (job.difficult === "Yes" && p.heavy > 0)
    lines.push({ label: "Additional heavy-item labor", amount: p.heavy });
  return {
    volume,
    estimate: Math.round(lines.reduce((s, l) => s + l.amount, 0) * 100) / 100,
    lines,
  };
}
export function validateJob(j: Job, p: Pricing) {
  if (!j.name.trim() || !/^\S+@\S+\.\S+$/.test(j.email) || j.phone.replace(/\D/g, "").length < 10)
    return "Enter a name, valid email, and US phone number.";
  if (
    !j.street.trim() ||
    !j.city.trim() ||
    !/^[A-Z]{2}$/.test(j.state) ||
    !/^\d{5}(-\d{4})?$/.test(j.zip)
  )
    return "Enter a complete US pickup address with state abbreviation and ZIP code.";
  if (
    Object.keys(j.items).some((id) => !p.items.some((item) => item.id === id)) ||
    (!isCustom(j) && !Object.values(j.items).some((n) => n > 0)) ||
    Object.values(j.items).some((n) => !Number.isInteger(n) || n < 0 || n > 100)
  )
    return "Select at least one item, with whole quantities from 0 to 100.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(j.date) || j.date < today() || !windows.includes(j.window))
    return "Choose today or a future date and a valid time window.";
  if (
    !Number.isInteger(j.stairs) ||
    j.stairs < 0 ||
    j.stairs > 10 ||
    !Number.isFinite(j.loadSize) ||
    j.loadSize < 0
  )
    return "Please check your pickup details.";
  if (j.mode === "custom" && !j.project.trim())
    return "Tell us a little about your cleanup project.";
  if (j.photos.length > 5) return "You can attach up to 5 photos.";
  if (
    j.access.startsWith("Upstairs") &&
    (!Number.isInteger(j.floor) || j.floor < 1 || j.floor > 100)
  )
    return "Enter a floor number from 1 to 100.";
  return "";
}
export function assignmentError(j: Job, d: DemoData) {
  if (["Cancelled", "Completed"].includes(j.status)) return "";
  if (
    isCustom(j) &&
    ["Confirmed", "Assigned", "En Route", "In Progress"].includes(j.status) &&
    !j.quoteApproved
  )
    return "Prepare and approve the customer quote first.";
  if (
    j.quotedAmount != null &&
    !j.quoteApproved &&
    ["Confirmed", "Assigned", "En Route", "In Progress"].includes(j.status)
  )
    return "Approve the current quote before confirming or assigning.";
  if (!j.crew && !j.truck)
    return ["Assigned", "En Route", "In Progress"].includes(j.status)
      ? "Assign a crew and truck first."
      : "";
  if (!j.crew || !j.truck) return "Choose both a crew and a truck.";
  const crew = d.crews.find((c) => c.id === j.crew),
    truck = d.trucks.find((t) => t.id === j.truck);
  if (!crew?.available || !truck?.available) return "Selected crew or truck is unavailable.";
  if (isCustom(j) && j.volume <= 0)
    return "Set an internal capacity estimate before assigning this custom pickup.";
  if (!truck || quote(j, d.pricing).volume > truck.capacity) return "Load exceeds truck capacity.";
  if (
    d.jobs.some(
      (x) =>
        x.id !== j.id &&
        !["Completed", "Cancelled"].includes(x.status) &&
        x.date === j.date &&
        x.window === j.window &&
        (x.crew === j.crew || x.truck === j.truck),
    )
  )
    return "Scheduling conflict: crew or truck is already assigned in this window.";
  return "";
}
export function suggestAssignment(j: Job, d: DemoData) {
  for (const crew of d.crews)
    for (const truck of d.trucks) {
      const candidate = { ...j, crew: crew.id, truck: truck.id };
      if (!assignmentError(candidate, d)) return candidate;
    }
  return null;
}
export function communication(channel: Communication["channel"], text: string): Communication {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    channel,
    text,
    status: channel === "Phone" || channel === "Note" ? "Recorded" : "Simulated",
  };
}
export function saveJob(draft: Job, staffOverride = false) {
  let saved: Job | undefined;
  changeData((d) => {
    const repeat =
      !draft.id && draft.submissionKey
        ? d.jobs.find((j) => j.submissionKey === draft.submissionKey)
        : undefined;
    if (repeat) {
      saved = repeat;
      return d;
    }
    const existing = d.jobs.find((j) => j.id === draft.id);
    const invalid = validateJob(draft, d.pricing) || assignmentError(draft, d);
    if (invalid) throw new Error(invalid);
    const q = quote(draft, d.pricing);
    const match = d.customers.find(
      (c) =>
        c.email.toLowerCase() === draft.email.trim().toLowerCase() ||
        c.phone.replace(/\D/g, "") === draft.phone.replace(/\D/g, ""),
    );
    let id = existing?.id ?? `SJ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    while (!existing && d.jobs.some((j) => j.id === id))
      id = `SJ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const customerId = existing?.customerId ?? match?.id ?? crypto.randomUUID();
    saved = {
      ...draft,
      id,
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      customerId,
      volume: q.volume,
      estimate: existing ? (staffOverride ? draft.estimate : existing.estimate) : q.estimate,
      originalEstimate: existing?.originalEstimate ?? q.estimate,
      quotedAmount:
        existing && !staffOverride ? existing.quotedAmount : (draft.quotedAmount ?? null),
      finalCharge: existing && !staffOverride ? existing.finalCharge : (draft.finalCharge ?? null),
      quoteApproved: existing && !staffOverride ? existing.quoteApproved : draft.quoteApproved,
      quoteHistory: existing?.quoteHistory ?? [],
      priceLines:
        existing && !staffOverride
          ? existing.priceLines
          : draft.priceLines.length
            ? draft.priceLines
            : q.lines,
      status: existing ? draft.status : isCustom(draft) ? "Needs Quote" : "Requested",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      communications: existing
        ? [...existing.communications, communication("Note", "Booking details updated by staff.")]
        : [
            ...draft.communications,
            communication(
              "Email",
              isCustom(draft)
                ? `Request ${id} received. Staff will prepare a quote.`
                : `Request ${id} received. Estimated pickup cost ${q.estimate!.toFixed(2)} USD.`,
            ),
          ],
    };
    const customer: Customer = {
      id: customerId,
      name: saved.name,
      email: saved.email,
      phone: saved.phone,
      preferred: saved.preferred,
      notes: d.customers.find((c) => c.id === customerId)?.notes ?? "",
    };
    return {
      ...d,
      jobs: existing ? d.jobs.map((j) => (j.id === id ? saved! : j)) : [saved, ...d.jobs],
      customers: d.customers.some((c) => c.id === customerId)
        ? d.customers.map((c) => (c.id === customerId ? customer : c))
        : [customer, ...d.customers],
    };
  });
  if (!draft.id) selectCustomer(saved!.customerId);
  return saved!;
}
export function reviseQuote(id: string, amount: number, reason: string, final = false) {
  if (!reason.trim()) throw new Error("Add a reason for this price update.");
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Enter a valid amount.");
  updateJob(id, (j) => {
    if (j.status === "Cancelled" || (!final && j.status === "Completed"))
      throw new Error("This booking is closed.");
    const revision = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      amount,
      reason: reason.trim(),
      author: "Sarah Carter",
      kind: final ? ("Final charge" as const) : ("Quote" as const),
      approved: final,
    };
    return {
      ...j,
      ...(final
        ? { finalCharge: amount }
        : { quotedAmount: amount, quoteApproved: false, status: "Quoted" as const }),
      quoteHistory: [...j.quoteHistory, revision],
      communications: [
        ...j.communications,
        communication(
          final ? "Note" : "Email",
          `${final ? "Final charge" : "Staff quote"}: ${amount.toFixed(2)} USD. Reason: ${reason.trim()}. ${final ? "" : "Customer approval pending; delivery simulated."}`,
        ),
      ],
    };
  });
}
export function approveQuote(id: string) {
  updateJob(id, (j) => {
    if (j.quotedAmount == null || j.status !== "Quoted")
      throw new Error("There is no current quote awaiting approval.");
    return {
      ...j,
      quoteApproved: true,
      status: "Confirmed",
      quoteHistory: j.quoteHistory.map((q, i) =>
        q.id === [...j.quoteHistory].reverse().find((x) => x.kind === "Quote")?.id
          ? { ...q, approved: true }
          : q,
      ),
      communications: [
        ...j.communications,
        communication("Email", "Customer quote approval simulated. Pickup confirmed."),
      ],
    };
  });
}
export function recordPayment(id: string) {
  updateJob(id, (j) => {
    if (j.finalCharge == null)
      throw new Error("Record the final charge before marking payment received.");
    if (j.payment === "Paid") return j;
    return {
      ...j,
      payment: "Paid",
      invoice: j.invoice || `INV-${j.id}`,
      communications: [
        ...j.communications,
        communication("Email", `Receipt: ${j.finalCharge.toFixed(2)} USD paid in this demo.`),
      ],
    };
  });
}
export function updateJob(id: string, fn: (j: Job) => Job) {
  changeData((d) => {
    const old = d.jobs.find((j) => j.id === id);
    if (!old) throw new Error("Booking not found.");
    const next = fn(old);
    if (old.status === "Completed" && next.status === "Cancelled")
      throw new Error("Completed jobs cannot be cancelled.");
    if (old.status !== "Quoted" && next.status === "Quoted" && next.quotedAmount == null)
      throw new Error("Create a staff quote before marking this job quoted.");
    const conflict = assignmentError(next, d);
    if (conflict) throw new Error(conflict);
    return { ...d, jobs: d.jobs.map((j) => (j.id === id ? next : j)) };
  });
}
export function readChatDraft(): Job {
  try {
    return {
      ...blankJob(),
      ...JSON.parse(localStorage.getItem("smart-junk-chat-draft") || "{}"),
      source: "Chat",
    };
  } catch {
    return { ...blankJob(), source: "Chat" };
  }
}
export function setChatDraft(j: Job) {
  localStorage.setItem("smart-junk-chat-draft", JSON.stringify(j));
}
