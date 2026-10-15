Update the Booked to Done landing page. The current version is live at
https://bookedtodone.vercel.app and works — this is a reorder plus a copy pass, not a rebuild.
Read AGENTS.md first: don't rewrite published git history (Lovable syncs this branch), and keep
main working.

REORDER THE PAGE (src/routes/index.tsx)

New order, top to bottom:
1. Who we are / what we do — the hero. Keep the headline and buttons, but REMOVE the FlowHero
   diagram from it.
2. The diagram — new standalone section. FlowHero moves here with its own heading.
3. Your issues, and what fixes them — the problem chips.
4. The features — customer side and staff side.
5. Start where it hurts — move this UP, directly beneath the features.
6. The demo — move this DOWN, to after "Start where it hurts".
7. How we work.
8. Who you're talking to.
9. Final CTA.

PROBLEM CHIPS (src/data/site-content.ts)

Reword two. Keep every slug exactly as it is — the slugs are routes.
- "No-shows" becomes "Bookings that fall through" (slug stays booking-deposit)
- "Typing it twice" becomes "Re-entering the same details" (slug stays job-card)

Leave alone: Missed calls, Slow quotes, Endless texting, Chasing payments.

THE FEATURES SECTION

Right now it's headed "One system, two sides / Twelve pieces. One set of data." with a paragraph
about hovering. Make it plainer — this is just the list of what we offer, split by who uses it.
Something like "What we build" / "Everything we offer, on both sides of the job", with one line
saying these are the customer-side and staff-side features and each one feeds its partner on the
other side.

Keep the TwoSidesMap component and its hover-wire interaction working, and keep the mobile
Customer/Staff tabs. Only the wording around it changes.

START WHERE IT HURTS

Three cards: Add one feature, Upgrade your setup, The full system.

- "You only pay for what you need" must be a big, prominent highlight in this section. It's the
  main idea, not a footnote. Give it real visual weight.
- "The full system" should read as the obvious recommended choice — stronger card treatment, a
  badge, a more prominent CTA. The other two stay available but clearly secondary.
- The full system card's CTA goes to the booking flow, not a generic mailto.
- Keep the line about connecting "your calendar, your website, your payment processor". Do NOT add
  integration logos — nothing has been confirmed as buildable yet.

HOW WE WORK

Replace the current three steps with four:
1. A 15-minute call — you tell us how the work actually runs.
2. We hear about your problem — what's costing you jobs, in your words.
3. We build tailored to your solution — your prices, your trucks, your service area.
4. Continued support — we keep changing and updating the system so it flows with how your team
   actually works. No end date.

REMOVE ALL PRICING — THIS MATTERS

Delete from the whole site:
- "About $500 setup, credited"
- "$249-399 per month"
- "Refunded if the pilot misses" — we do NOT refund the setup fee. Remove the promise entirely.
- The three-chip pricing row under the How we work steps.
- Every mention of the 30-day pilot, including the hero line that currently reads
  "Live in 7 days - 30-day pilot - setup refunded if it doesn't book the jobs".

Suggested hero replacement: "Live in 7 days - built around how you already work - you only pay for
what you need".

No prices anywhere on the site. Pricing is a conversation, not a page.

WHO YOU'RE TALKING TO

Two co-founders, both titled Co-founder:
- Jerry Huang
- Aretha Madeline Budiman

Neither photo is in /public yet, so use the existing initials-avatar treatment (JH, AB) and leave a
TODO for the swap. Do NOT invent bios, credentials or history for either of them.

FINAL CTA

Delete the current headline "Let's see what this looks like with your prices in it." We're not
promising a priced mock-up.

Replace it with the real offer: they get to see how the system works across a customer-facing site
and a staff-facing site, with both ends connected. That's what the demo actually shows.

Primary button goes to the booking flow. Secondary stays "Play with the demo first" to /demo.

THE BOOK A CALL BUTTON IS BROKEN — FIX IT

It's currently a mailto: and on most machines clicking it does nothing. It's the primary CTA, so
this is the worst bug on the page.

Reword it to something like "Book a meeting at a time that suits you", with a supporting line
saying the team will set up a meeting to learn exactly what your problem is and suggest solutions.

Implement it as a single exported constant, same pattern as VIDEO_SRC in
src/components/site/demo-video.tsx:

    /** Paste the Calendly / Cal.com URL here and every booking button goes live. */
    export const BOOKING_URL: string | null = null;

Leave BOOKING_URL as null. The Calendly account doesn't exist yet — this placeholder is deliberate,
not something to fill in. Do not invent a URL.

While it's null, booking buttons fall back to the existing mailtoFor(...) so nothing is a dead
link. Be aware the fallback may still not open a mail client, so this CTA isn't truly fixed until
the real URL is pasted in. When BOOKING_URL is set, every booking button on the site should switch
to it at once — header, hero, full system card, final CTA. One edit, one place.

EMAIL

Change jerryhuangpro@gmail.com to bookedtodone@gmail.com everywhere: contactEmail in
site-content.ts, the footer in site-chrome.tsx, every mailtoFor CTA, and the prefilled "Add this to
my business" links on all 12 /features/[slug] pages. Grep for the old address and confirm zero hits
when you're done.

FILES YOU'LL BE IN

- src/routes/index.tsx — section order and layout
- src/data/site-content.ts — problems, entryPaths, howWeWork, contactEmail, mailtoFor
- src/components/site/site-chrome.tsx — header, footer, booking CTA
- src/components/site/flow-hero.tsx — diagram, moves sections, component itself unchanged
- src/components/site/two-sides-map.tsx — framing changes, interaction stays
- src/components/site/demo-video.tsx — the pattern to copy for BOOKING_URL

DO NOT TOUCH

These are real problems but not part of this job — changing them here makes the diff unreviewable:
- The demo app internals: 7 seeded jobs (target is 2), SJ- booking IDs, "Sarah Carter" as operator,
  the PROTOTYPE badge, company.ts still named "BookedToDone Demo".
- The $138/$150 seeded estimates that contradict the video's $289-349 / $50 / $309-374 / $324.
- The per-feature interactive demos, still stubbed behind "Interactive demo coming". Those need the
  separate demo-app brief.
- The walkthrough video — VIDEO_SRC is null on purpose until the v3 file is delivered.
- Anything in src/components/ui/ (shadcn primitives).

CONSTRAINTS

- The Booked to Done shell uses the bd-* tokens in src/styles.css: blue #1F5BFF, navy #0B1B3A,
  green #16C47F for completion moments only. The sample junk company inside the device frames keeps
  its own warm/green palette. Don't merge the two.
- Business records stay in src/data/mock-data.ts per AGENTS.md; site copy stays in site-content.ts.
- ?prospect= must keep working on every route — it personalises the hero, the final CTA and the
  prefilled mailto, and we send /features/[slug]?prospect=Name links in cold emails.
- No invented statistics. Every proof number on the site is either definitional ("24/7", "0 fields
  typed") or from the demo script ("$309 to $374", "+$65"). No conversion rates, percentages or
  market claims — we have to defend these on a call.
- 375px wide must work with no horizontal scroll.
- Keep noindex on every route.
- The sample junk company must never be a page a visitor lands on — /demo and device frames only.

DONE WHEN

npm run check, npm run lint (0 errors), npm run test:demo (PASS) and npm run build all succeed, and:
- Sections are in the order above.
- No price, no refund promise, no "30-day pilot" anywhere.
- "You only pay for what you need" reads as a headline, not a footnote.
- "The full system" is visibly the recommended option.
- grep -ri "jerryhuangpro" returns nothing.
- Both founders listed as Co-founder, with nothing invented.
- Every booking button reads from the single BOOKING_URL constant.
- / and /features/photo-estimate?prospect=Test both render at 375px with no horizontal scroll.
