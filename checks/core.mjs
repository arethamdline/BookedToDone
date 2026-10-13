import assert from "node:assert/strict";
import { build } from "vite";
import { fileURLToPath } from "node:url";
await build({
  configFile: false,
  publicDir: false,
  logLevel: "error",
  resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
  build: {
    lib: {
      entry: { store: "src/lib/junk-store.ts", photos: "src/lib/photo-store.ts" },
      formats: ["es"],
      fileName: (_format, name) => name + ".js",
    },
    outDir: ".checks",
    emptyOutDir: true,
    minify: false,
    rollupOptions: { external: ["react"] },
  },
});
const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => memory.set(k, v),
};
globalThis.window = new EventTarget();
const store = await import("../.checks/store.js");
const data = store.readData();
const template = {
  ...data.jobs[0],
  id: "",
  name: "Test Customer",
  email: "test@example.com",
  phone: "5125550199",
  items: { sofa: 1 },
  volume: 0,
  loadSize: 0,
  crew: "",
  truck: "",
  status: "Requested",
  communications: [],
  invoice: "",
  payment: "Unpaid",
};
const baseline = store.quote(template, data.pricing);
assert.equal(baseline.estimate, 125);
assert.equal(baseline.volume, 2.5);
const first = store.saveJob({ ...template, source: "Website" });
const second = store.saveJob({ ...template, source: "Phone" });
const third = store.saveJob({ ...template, email: "other@example.com", source: "Email" });
const fourth = store.saveJob({ ...template, source: "Chat" });
assert.equal(new Set([first.id, second.id, third.id, fourth.id]).size, 4);
assert.equal(first.customerId, second.customerId);
assert.equal(first.customerId, third.customerId);
assert.equal(first.customerId, fourth.customerId);
assert.equal(store.readData().jobs.filter((j) => j.customerId === first.customerId).length, 4);
assert.equal(first.communications[0].status, "Simulated");
const before = first.estimate;
store.changeData((d) => ({
  ...d,
  pricing: {
    ...d.pricing,
    items: d.pricing.items.map((i) => (i.id === "sofa" ? { ...i, price: 500 } : i)),
  },
}));
assert.equal(store.quote(template, store.readData().pricing).estimate, 500);
assert.equal(store.readData().jobs.find((j) => j.id === first.id).estimate, before);
const available = store.suggestAssignment(
  { ...first, window: "10:00 AM–12:00 PM" },
  store.readData(),
);
assert.ok(available);
store.updateJob(first.id, (j) => ({
  ...j,
  window: available.window,
  crew: available.crew,
  truck: available.truck,
  status: "Assigned",
}));
assert.throws(
  () =>
    store.updateJob(second.id, (j) => ({
      ...j,
      window: available.window,
      crew: available.crew,
      truck: available.truck,
      status: "Assigned",
    })),
  /Scheduling conflict/,
);
const fresh = store.readData().jobs.find((j) => j.id === first.id);
assert.throws(() => store.saveJob({ ...fresh, date: "2020-01-01" }), /future/);
assert.throws(
  () => store.updateJob(second.id, (j) => ({ ...j, status: "Assigned" })),
  /Assign a crew/,
);
store.updateJob(first.id, (j) => ({ ...j, status: "Cancelled" }));
store.updateJob(second.id, (j) => ({
  ...j,
  window: available.window,
  crew: available.crew,
  truck: available.truck,
  status: "Assigned",
}));
const large = store.saveJob({ ...template, items: { debris: 100 }, volume: 0 });
assert.match(
  store.assignmentError(
    { ...large, crew: "c1", truck: "t1", status: "Assigned" },
    store.readData(),
  ),
  /capacity/,
);
assert.throws(() => store.saveJob({ ...template, items: { sofa: -1 } }), /Select at least one/);
assert.throws(() => store.recordPayment(second.id), /final charge/);
store.reviseQuote(second.id, 125, "On-site inspection confirmed the original item list.", true);
store.recordPayment(second.id);
const updated = store.readData().jobs.find((j) => j.id === second.id);
assert.equal(updated.payment, "Paid");
assert.equal(updated.communications.at(-1).channel, "Email");
const reloaded = await import("../.checks/store.js?refresh=1");
assert.equal(reloaded.readData().jobs.find((j) => j.id === second.id).invoice, `INV-${second.id}`);

const p = store.readData().pricing;
assert.equal(
  store.quote({ ...template, loadSize: 16, volume: 16 }, p).estimate,
  500,
  "Customer load size must not affect pricing.",
);
const withFees = { ...p, stairs: 25, parking: 20, heavy: 65 };
assert.equal(
  store.quote(
    {
      ...template,
      access: "Upstairs without elevator",
      floor: 2,
      closeParking: "Not sure",
      difficult: "Not sure",
    },
    withFees,
  ).estimate,
  550,
);
assert.equal(
  store.quote(
    {
      ...template,
      access: "Upstairs with elevator",
      floor: 2,
      closeParking: "Yes",
      difficult: "No",
    },
    withFees,
  ).estimate,
  500,
);
assert.equal(store.quote({ ...template, items: { tv: 1 } }, p).estimate, 125);
const custom = store.saveJob({
  ...template,
  mode: "custom",
  project: "Garage cleanout",
  items: {},
  volume: 0,
  submissionKey: "same-request",
  photos: [{ id: "photo-test", name: "garage.jpg", type: "image/jpeg", size: 20 }],
});
assert.equal(custom.status, "Needs Quote");
assert.equal(custom.estimate, null);
assert.equal(custom.originalEstimate, null);
assert.equal(
  store.saveJob({
    ...template,
    mode: "custom",
    project: "Garage cleanout",
    items: {},
    submissionKey: "same-request",
  }).id,
  custom.id,
  "Repeated submissions should return the existing booking.",
);
assert.equal(store.readData().jobs.filter((j) => j.submissionKey === "same-request").length, 1);
assert.throws(() => store.reviseQuote(custom.id, 300, ""), /reason/);
store.reviseQuote(custom.id, 300, "Garage scope reviewed by staff.");
let current = store.readData().jobs.find((j) => j.id === custom.id);
assert.equal(current.estimate, null);
assert.equal(current.quotedAmount, 300);
assert.equal(current.status, "Quoted");
assert.equal(current.quoteApproved, false);
assert.match(
  store.assignmentError(
    { ...current, status: "Assigned", crew: "c2", truck: "t2" },
    store.readData(),
  ),
  /approve/i,
);
store.approveQuote(custom.id);
current = store.readData().jobs.find((j) => j.id === custom.id);
assert.equal(current.status, "Confirmed");
assert.equal(current.quoteApproved, true);
assert.match(
  store.assignmentError(
    { ...current, status: "Assigned", crew: "c2", truck: "t2" },
    store.readData(),
  ),
  /capacity estimate/,
);
store.updateJob(custom.id, (j) => ({
  ...j,
  volume: 6,
  crew: "c2",
  truck: "t2",
  window: "12:00 PM–2:00 PM",
  status: "Assigned",
}));
store.reviseQuote(custom.id, 320, "Additional shelving confirmed.", true);
store.recordPayment(custom.id);
current = store.readData().jobs.find((j) => j.id === custom.id);
assert.equal(store.collectedValue(current), 320);
assert.equal(store.jobPrice(current), 320);
assert.equal(current.originalEstimate, null);
assert.equal(current.quoteHistory.length, 2);
assert.equal(current.photos[0].id, "photo-test");
store.updateJob(custom.id, (j) => ({ ...j, status: "Completed" }));
assert.throws(() => store.cancelJob(custom.id), /no longer/);
assert.throws(
  () => store.updateJob(custom.id, (j) => ({ ...j, status: "Cancelled" })),
  /Completed jobs/,
);
assert.equal(store.canCancel(current), true);
const unpaid = store.readData().jobs.find((j) => j.id === fourth.id);
assert.equal(store.collectedValue(unpaid), 0);
assert.ok(
  store
    .customerJobs(store.readData(), first.customerId)
    .every((j) => j.customerId === first.customerId),
);
assert.equal(store.customerJobs(store.readData(), "missing-customer").length, 0);
store.changeData((d) => ({
  ...d,
  customers: d.customers.map((c) =>
    c.id === first.customerId ? { ...c, notes: "Prefers morning pickups." } : c,
  ),
}));
store.saveJob({ ...fourth, name: "Updated Customer" });
assert.equal(
  store.readData().customers.find((c) => c.id === first.customerId).notes,
  "Prefers morning pickups.",
);
const migrated = store.migrateData({
  ...data,
  version: undefined,
  customers: undefined,
  pricing: { ...data.pricing, stairs: 25, parking: 20, heavy: 65 },
  jobs: data.jobs.map((j) => ({
    ...j,
    estimate: 375,
    payment: "Paid",
    originalEstimate: undefined,
  })),
});
assert.equal(migrated.jobs[0].originalEstimate, 375);
assert.equal(migrated.jobs[0].finalCharge, 375);
assert.equal(migrated.pricing.stairs, 0);
assert.ok(migrated.customers.length);
assert.equal(migrated.version, 2);
const photos = await import("../.checks/photos.js");
photos.validatePhoto({ type: "image/jpeg", size: 100 });
assert.throws(() => photos.validatePhoto({ type: "image/gif", size: 10 }), /JPG/);
assert.throws(() => photos.validatePhoto({ type: "image/png", size: 6 * 1024 * 1024 }), /5 MB/);
console.log(
  "PASS V2: item pricing, minimum fees, uncertainty, four channels, duplicate prevention, customer scoping, V1 migration, quotes and approvals, historical prices, custom dispatch capacity, photo references/validation, final payments, and cancellation rules.",
);
