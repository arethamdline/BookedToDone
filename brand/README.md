# Booked to Done — brand kit

Source of truth for colour and logo. Taken from the demo video palette (v3, 15 October 2026)
and the logo sheet supplied by the team.

Machine-readable version: [`palette.json`](palette.json).
Live implementation: the `bd-*` tokens in [`../src/styles.css`](../src/styles.css).

---

## Logo

| File | What it is | Use it for |
|---|---|---|
| [`logo-sheet.png`](logo-sheet.png) | The original supplied sheet, all four variants | Reference / master |
| `../public/brand/bd-mark.png` | Icon only, brand green, transparent | Favicons, app icons, tight spaces |
| `../public/brand/bd-mark-white.png` | Icon only, white, transparent | On dark green surfaces |
| `../public/brand/bd-logo-horizontal.png` | Mark + wordmark, side by side | Site header, email signatures, docs |
| `../public/brand/bd-logo-stacked.png` | Mark above wordmark | Square/centred placements |
| `../public/brand/bd-wordmark.png` | Wordmark only | Where the mark already appears |

The mark is a `b` and a `d` sharing one continuous bowl, with a `>` in the counter — booked,
flowing through to done.

> **These are PNGs cropped from the supplied sheet.** They are sharp at the sizes the site uses,
> but they are raster. If the original vector file exists, drop the `.svg` into `public/brand/`
> and swap the `<img src>` in `src/components/site/site-chrome.tsx` — scalable, themeable with
> `currentColor`, and a fraction of the file size.

---

## Colour

### Brand

| Colour | Hex | Use |
|---|---|---|
| Brand green | `#176344` | Logo icon, buttons, chat bubbles, selected options, progress bar, email pill, the brand line and its underline |
| Dark green | `#102C23` | Headlines, main text, wordmark, problem words |
| Deep green | `#0F4A32` | Small labels, crew "on site" screen |
| Light green | `#CFE5D9` | Offset shadows behind phones, cards and the email pill |
| Pale green | `#E2F1E8` | "Your prices / trucks / dump / crew" chips |
| White | `#FFFFFF` | Every background |

### Neutrals

| Colour | Hex | Use |
|---|---|---|
| Body grey | `#475569` | Sub-headlines and supporting text |
| Light grey | `#94A3B8` | Timestamps, full time slots |
| Line grey | `#E2E8F0` | Card borders and dividers |
| Chip grey | `#F1F5F9` | AI chat bubble, empty item chips |

### Signal colours

Each one marks a meaning, not the brand. Keep them to these jobs so viewers learn them fast.

| Colour | Hex | Use |
|---|---|---|
| "Done" green | `#16A34A` | Auto chips, checkmarks, Paid and Approved callouts |
| "Done" tint | `#DCFCE7` | Background behind done states |
| AI purple | `#7C3AED` | Start of the AI gradient |
| AI blue | `#2563EB` | End of the AI gradient |
| Problem red | `#EF4444` | The X next to each problem |
| Demo orange | `#9A3412` | "This is a demo" tag text, on `#FFEDD5` |
| Review gold | `#F59E0B` | Review stars |

---

## Rules

1. Backgrounds are white. Text is dark green, **never pure black**.
2. Brand green is for buttons, selected states, the logo and key lines such as
   "We build it around you."
3. "Done" green appears **only** on Auto chips, checkmarks and paid or approved moments.
4. AI moments always use the purple-to-blue gradient chip.
5. Red appears **only** on the problem X marks.

---

## Type

| Role | Family | Weight |
|---|---|---|
| Headlines | **Outfit** | Bold (700) |
| Body and app screens | **Instrument Sans** | 400 / 600 / 700 |

> **Not yet implemented.** The site currently loads Manrope (display) and DM Sans (body) from the
> original template. Switching is a change to the font links in `src/routes/__root.tsx` and the
> `--font-sans` / `--font-display` tokens in `src/styles.css`.

---

## How this maps to code

Brand colours live as Tailwind tokens in `src/styles.css`. The names are historical — they were
written when the brand was blue — so read `bd-blue*` as "primary" and `bd-navy*` as "ink":

| Token | Hex | Palette name |
|---|---|---|
| `bd-blue` | `#176344` | Brand green |
| `bd-blue-ink` | `#0F4A32` | Deep green (hover) |
| `bd-blue-soft` | `#E2F1E8` | Pale green |
| `bd-navy` | `#102C23` | Dark green |
| `bd-navy-soft` | `#0F4A32` | Deep green |
| `bd-green` | `#16A34A` | "Done" green |
| `bd-paper` | `#E2F1E8` | Pale green (section tint) |
| `bd-light` | `#CFE5D9` | Light green |
| `bd-done-tint` | `#DCFCE7` | "Done" tint |
| `bd-ai-from` / `bd-ai-to` | `#7C3AED` / `#2563EB` | AI gradient |
| `bd-problem` | `#EF4444` | Problem red |
| `bd-body` | `#475569` | Body grey |
| `bd-mute` | `#94A3B8` | Light grey |
| `bd-line` | `#E2E8F0` | Line grey |
| `bd-chip` | `#F1F5F9` | Chip grey |

Use the `.bd-ai-gradient` class for AI moments.
