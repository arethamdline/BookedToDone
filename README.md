# Smart-Junk V2

Separate junk-removal prototype adapted from Box Buddy HK. Reuses the customer/staff shells, TanStack routes, UI kit, and mock chat/support interface.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Staff dashboard: `/staff`; support inbox: `/staff/inbox`.

```bash
npm run check
npm run lint
npm run test:demo
npm run build
npm run build:demo
```

Website, chat, phone, and email bookings share one localStorage store. Data persists in this browser and syncs across same-origin tabs. No multi-device sync or authentication. Emails, SMS, payments, invoices, and receipts are simulated. Routes use manual order or ZIP sorting, not travel-time optimization.

Standard estimates use item prices with a configurable minimum and optional explicit fees. Custom cleanups receive staff quotes. Original estimates, quote revisions, approvals, and final charges remain separate. Uploaded photos use IndexedDB (up to 5 images, 5 MB each); metadata stays linked to the booking. V1 browser data migrates without losing historical prices. The demo customer selector is not production authentication.
