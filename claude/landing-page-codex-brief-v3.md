# Landing page v3 — Codex brief

**Repo:** `arethamdline/BookedToDone` · **Branch:** `main` (Lovable-connected) · **Date:** 15 Oct 2026

You are editing an existing, working landing page. **v2 shipped to `main` and is live at
https://bookedtodone.vercel.app.** This brief changes the order of the page, rewrites several
sections, and removes all pricing. It does not rebuild anything from scratch.

Read `AGENTS.md` first. Two rules matter here: do not rewrite published git history (Lovable syncs
this branch), and keep `main` in a working state.

---

## 1. Why this change

The v2 page is structurally right — company first, sample junk company only inside device frames —
but three things are off:

1. The hero does too much. It introduces the company *and* carries the flow diagram. These should
   be two beats: say what we do, then show it.
2. Two of the problem chips don't read clearly to a junk-removal owner.
3. The commercial framing is wrong. Prices are on the page before we've had a conversation, and it
   promises a refund we don't offer.

The fix is a reordering, a copy pass, and the removal of every number.

---

## 2. New page order

`src/routes/index.tsx` currently renders eight numbered sections. Reorder and rework to nine:

| # | Section | What changes |
|---|---|---|
| 1 | **Who we are / what we do** | Hero keeps headline, subcopy and CTAs. **Remove `<FlowHero />` from it.** |
| 2 | **The diagram** | New standalone section. `<FlowHero />` moves here with a heading. |
| 3 | **Your issues → our solutions** | Unchanged position. Two chips reworded (§3). |
| 4 | **The features** | Was "One system, two sides". Reframed (§4). |
| 5 | **Start where it hurts** | **Moves up** to sit directly beneath the features. Reworked (§5). |
| 6 | **The demo** | **Moves down**, to after "Start where it hurts". |
| 7 | **How we work** | Rewritten — four steps (§6). |
| 8 | **Who you're talking to** | Two founders now (§7). |
| 9 | **Final CTA** | Rewritten (§8). |

---

## 3. Problem chips

In `src/data/site-content.ts`, `problems[]`. **Change two labels. Keep every slug as-is** — the
slugs are the routes and must not move.

| Slug | Old label | New label |
|---|---|---|
| `booking-deposit` | No-shows | **Bookings that fall through** |
| `job-card` | Typing it twice | **Re-entering the same details** |

Unchanged: Missed calls · Slow quotes · Endless texting · Chasing payments.

---

## 4. The features section

Currently headed "One system, two sides" / "Twelve pieces. One set of data." with a paragraph about
hovering to see which half of the day a tile feeds.

Make it plainer. This is simply **the list of what we offer, split by who uses it.** Suggested:

- Eyebrow: `What we build`
- Heading: `Everything we offer, on both sides of the job.`
- Subcopy: one line stating these are the customer-side and staff-side features, and that each one
  feeds its partner on the other side.

**Keep the `TwoSidesMap` component and its hover-wire interaction working.** Only the surrounding
framing changes — the wire is still the best proof we have that the two sides are connected. Keep
the mobile Customer/Staff tabs.

---

## 5. Start where it hurts

Three cards in `entryPaths` (`site-content.ts`): Add one feature · Upgrade your setup · The full
system.

**Required changes:**

1. **"You only pay for what you need" must be a prominent highlight in this section** — not a
   footnote. This is the headline idea of the whole section. Give it real visual weight, above or
   beside the three cards.
2. **"The full system" is the obvious choice.** It already has a blue border; push further —
   clearly the recommended option (a badge, stronger card treatment, more prominent CTA). The other
   two stay available but visibly secondary.
3. The full-system card gets a strong CTA that goes to the booking flow (§9), not a generic mailto.

Keep the existing line about connecting "your calendar, your website, your payment processor" —
do **not** add integration logos. No integration has been confirmed as buildable.

---

## 6. How we work

Replace the current three steps entirely. **Four steps now:**

1. **A 15-minute call** — you tell us how the work actually runs.
2. **We hear about your problem** — what's costing you jobs, in your words.
3. **We build tailored to your solution** — your prices, your trucks, your service area.
4. **Continued support** — we keep changing and updating the system so it flows with how your team
   actually works. No end date stated.

**Delete from this section and everywhere else on the site:**

- `About $500 setup, credited`
- `$249–399 per month`
- `Refunded if the pilot misses` — **we do not refund the setup fee. Remove the promise entirely.**
- The whole three-chip pricing row beneath the steps.
- **Every mention of the 30-day pilot**, including the hero microcopy line
  `Live in 7 days · 30-day pilot · setup refunded if it doesn't book the jobs`.

Suggested hero replacement line: `Live in 7 days · built around how you already work · you only pay
for what you need`.

**No prices anywhere on the site.** Pricing is a conversation, not a page.

---

## 7. Who you're talking to

Two co-founders. Both titled **Co-founder**.

- **Jerry Huang** — Co-founder
- **Aretha Madeline Budiman** — Co-founder

Neither photo exists in `/public` yet. Use the existing initials-avatar treatment for both (`JH`,
`AB`) and leave a `TODO` comment for the swap. **Do not invent bios, credentials or history for
either founder.** The existing "You talk. We listen. We build it around you." paragraph can stand
as shared copy.

---

## 8. Final CTA

Delete the current headline — `Let's see what this looks like with your prices in it.` We are not
promising a priced mock-up.

Replace with the honest offer: they get to see **how the system works across a customer-facing site
and a staff-facing site, with both ends connected.** That is what the demo actually shows.

Primary button goes to the booking flow (§9). Secondary stays "Play with the demo first" → `/demo`.

---

## 9. Booking a meeting — the broken button

**The current "Book a call" button does not work.** It is a `mailto:` and on most machines nothing
happens when you click it. This is the single most damaging bug on the page: it is the primary CTA.

**Replace it with a real scheduling link.**

- New CTA wording, roughly: **"Book a meeting at a time that suits you."** Supporting line: the
  team will set up a meeting to learn exactly what your problem is and suggest solutions.
- Implement as **one exported constant**, same pattern as `VIDEO_SRC` in
  `src/components/site/demo-video.tsx`:

  ```ts
  /** Paste the Calendly / Cal.com URL here and every booking button on the site goes live. */
  export const BOOKING_URL: string | null = null;
  ```

- **`BOOKING_URL` stays `null` for now — the Calendly account does not exist yet.** This is a
  deliberate placeholder, not an oversight.
- While it is `null`, every booking button falls back to the existing `mailtoFor(...)` so nothing is
  a dead link. **Be aware the fallback still may not open a mail client** — this CTA is not truly
  fixed until the real URL is pasted in.
- When `BOOKING_URL` is set, **every** booking button across the site switches to it at once:
  header, hero, full-system card, final CTA. One edit, one place.

---

## 10. Contact email

`jerryhuangpro@gmail.com` → **`bookedtodone@gmail.com`**, **everywhere**:

- `contactEmail` in `src/data/site-content.ts`
- the footer in `src/components/site/site-chrome.tsx`
- every `mailtoFor(...)` CTA
- the prefilled "Add this to my business" links on all 12 `/features/[slug]` pages

Grep for the old address and confirm zero hits when you're done.

---

## 11. Files you'll be touching

| File | Role |
|---|---|
| `src/routes/index.tsx` | The landing page — section order and layout |
| `src/data/site-content.ts` | All copy: `problems`, `entryPaths`, `howWeWork`, `contactEmail`, `mailtoFor` |
| `src/components/site/site-chrome.tsx` | Header, footer, booking CTA |
| `src/components/site/flow-hero.tsx` | The diagram — moves sections, component itself unchanged |
| `src/components/site/two-sides-map.tsx` | Feature map — framing changes, interaction stays |
| `src/components/site/demo-video.tsx` | Pattern to copy for `BOOKING_URL` |

---

## 12. Out of scope — do not touch

These are real outstanding problems, but **not** part of this brief. Changing them here will make
the diff unreviewable:

- The demo app internals: **7 seeded jobs** (target is 2), `SJ-` booking IDs, "Sarah Carter" as
  operator, the `PROTOTYPE` badge, `company.ts` still named "BookedToDone Demo".
- The **$138 / $150** seeded job estimates, which contradict the video's $289–349 / $50 / $309→$374
  / $324.
- The per-feature **interactive demos**, still stubbed behind an "Interactive demo coming" badge.
  These need the separate demo-app brief.
- The **walkthrough video** — `VIDEO_SRC` is `null` on purpose until the v3 file is delivered.
- Anything inside `src/components/ui/` (shadcn primitives).

---

## 13. Constraints

- **Brand:** the Booked to Done shell uses the `bd-*` tokens in `src/styles.css` — blue `#1F5BFF`,
  navy `#0B1B3A`, green `#16C47F` (completion moments only). The sample junk company inside the
  frames keeps its own warm/green palette. Don't merge the two.
- **Business records stay in `src/data/mock-data.ts`** per AGENTS.md. Site copy stays in
  `site-content.ts`. Don't move either.
- **`?prospect=` must keep working on every route** — it personalises the hero, the final CTA and
  the prefilled mailto, and Jerry sends `/features/[slug]?prospect=Name` links in cold emails.
- **No invented statistics.** Every proof number on the site is either definitional ("24/7", "0
  fields typed") or taken from the demo script ("$309 → $374", "+$65"). Do not add conversion rates,
  percentages or market claims — Jerry has to defend these on a call.
- **375px wide must work**, and no horizontal scroll.
- Keep `noindex` on every route.
- The sample junk company must never be a page a visitor can land on — `/demo` and device frames
  only.

---

## 14. Done when

```bash
npm run check      # tsc --noEmit, clean
npm run lint       # 0 errors (pre-existing warnings are fine)
npm run test:demo  # PASS
npm run build      # succeeds
```

Plus, by eye:

- [ ] Sections appear in the order in §2.
- [ ] No price, no refund promise, and no "30-day pilot" anywhere on the site.
- [ ] "You only pay for what you need" reads as a headline, not a footnote.
- [ ] "The full system" is visibly the recommended option.
- [ ] `grep -ri "jerryhuangpro"` returns nothing.
- [ ] Both founders listed as Co-founder, no invented detail.
- [ ] Every booking button reads from the single `BOOKING_URL` constant.
- [ ] `/` and `/features/photo-estimate?prospect=Test` both render at 375px with no horizontal
      scroll.
