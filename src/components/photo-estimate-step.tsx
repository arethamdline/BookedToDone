import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Plus, Sparkles, Upload } from "lucide-react";

import { Button } from "./ui/button";
import { company } from "@/data/company";
import { estimateFor, photoSamples, priceFor, tally } from "@/data/photo-samples";

/**
 * The headline feature: a photo becomes a priced item list.
 *
 * The three sample photos have FIXED, SCRIPTED results that match what is
 * actually visible in each image. A visitor's own upload is never scanned and
 * never has items invented for it — this demo has no vision model behind it, so
 * it says so and sends them to the confirm step to list items themselves.
 */

type Phase = "choose" | "scanning" | "result" | "unscannable";

export function PhotoEstimateStep({
  onConfirm,
  onSkip,
  minimum,
}: {
  /**
   * Hands the detected items to the booking form.
   * `addMore` is true when the visitor wants the edit step, false when the
   * scan looked right and they'd rather go straight on to pickup details.
   */
  onConfirm: (items: Record<string, number>, addMore: boolean) => void;
  onSkip: () => void;
  minimum: number;
}) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [picked, setPicked] = useState<number | null>(null);
  const [ownPhoto, setOwnPhoto] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [caption, setCaption] = useState("Reading the photo…");
  const timers = useRef<number[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const sample = picked === null ? null : photoSamples[picked]!;

  const runScan = (index: number) => {
    setPicked(index);
    setRevealed(0);
    setPhase("scanning");
    setCaption("Reading the photo…");
    const found = photoSamples[index]!.detections;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    found.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setRevealed(i + 1), 700 + i * 260));
    });
    timers.current.push(
      window.setTimeout(() => setCaption("Estimating load size…"), 700 + found.length * 260),
    );
    timers.current.push(window.setTimeout(() => setPhase("result"), 1300 + found.length * 260));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOwnPhoto(URL.createObjectURL(file));
    setPhase("unscannable");
  };

  const lines = tally(sample?.detections ?? []);

  const confirmWith = (addMore: boolean) => onConfirm(Object.fromEntries(lines), addMore);

  const { subtotal, low, high } = estimateFor(lines);

  /* ---------------------------------------------------------------- choose */
  if (phase === "choose")
    return (
      <div className="space-y-5">
        <Header />
        <div data-tour="photo-samples" className="grid gap-3 sm:grid-cols-2">
          {photoSamples.map((s, i) => (
            <button
              key={s.src}
              type="button"
              data-tour-point={i === 0 ? "" : undefined}
              onClick={() => runScan(i)}
              className="group overflow-hidden rounded-xl border-2 border-transparent bg-card text-left shadow-sm transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={s.src}
                alt={s.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <p className="p-3 text-sm font-semibold">{s.title}</p>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-dashed p-4 text-center">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" /> Use my own photo
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            In this demo only the sample photos are scanned.
          </p>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Skip — I'd rather pick items from a list
        </button>
      </div>
    );

  /* ------------------------------------------------------------ own upload */
  if (phase === "unscannable")
    return (
      <div className="space-y-5">
        <Header />
        {ownPhoto && (
          <img
            src={ownPhoto}
            alt="The photo you uploaded"
            className="max-h-72 w-full rounded-xl object-cover"
          />
        )}
        <div className="rounded-xl border bg-warning-soft/50 p-4">
          <p className="text-sm font-semibold text-warning-strong">We're not scanning this one.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The real system reads your photo with a vision model. This demo doesn't have one
            running, and we won't invent a list of your belongings — so add the items on the next
            step instead.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSkip}>
            Add items myself <Check className="size-4" />
          </Button>
          <Button type="button" variant="outline" onClick={() => setPhase("choose")}>
            Try a sample photo
          </Button>
        </div>
      </div>
    );

  /* ------------------------------------------------------- scanning/result */
  const detections = sample!.detections;
  const scanning = phase === "scanning";

  return (
    <div className="space-y-5">
      <Header />

      <div className="relative overflow-hidden rounded-xl">
        <img src={sample!.src} alt={sample!.alt} className="aspect-[16/10] w-full object-cover" />

        {scanning && (
          <>
            <div className="absolute inset-0 bg-bd-navy/30" />
            <div className="bd-scanline absolute inset-x-0 h-1 bg-gradient-to-r from-bd-ai-from to-bd-ai-to shadow-[0_0_18px_4px_rgba(124,58,237,0.6)]" />
          </>
        )}

        {detections.slice(0, scanning ? revealed : detections.length).map((d) => (
          <span
            key={d.id}
            className="absolute rounded-md border-2 border-bd-ai-to"
            style={{
              left: `${d.box[0]}%`,
              top: `${d.box[1]}%`,
              width: `${d.box[2]}%`,
              height: `${d.box[3]}%`,
            }}
          >
            <span className="bd-ai-gradient absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
              {d.label}
            </span>
          </span>
        ))}

        <span className="bd-ai-gradient absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">
          {scanning ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          {scanning ? caption : "Scan complete"}
        </span>
      </div>

      {phase === "result" && (
        <>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              What we found
            </p>
            <ul className="mt-3 space-y-2">
              {lines.map(([item, n]) => (
                <li key={item} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-bd-green" />
                    {n} × {priceFor(item)?.name ?? item}
                  </span>
                  <span className="font-semibold tabular-nums text-muted-foreground">
                    ${((priceFor(item)?.price ?? 0) * n).toFixed(0)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Your estimate
              </p>
              <p className="font-display text-2xl font-extrabold tabular-nums">
                ${low}–{high}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {subtotal < company.pricing.minimum
                  ? `These items come to $${subtotal}, under the $${company.pricing.minimum} minimum pickup — so the minimum is what's quoted.`
                  : "A range, not a number you'll be held to. Final price is agreed on site."}
              </p>
            </div>
          </div>

          <div data-tour="scan-actions" className="flex flex-wrap gap-2">
            <Button type="button" data-tour-point="" onClick={() => confirmWith(false)}>
              Looks right <Check className="size-4" />
            </Button>
            <Button type="button" variant="outline" onClick={() => confirmWith(true)}>
              <Plus className="size-4" /> Something's missing
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPhase("choose")}>
              Try another photo
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Minimum pickup charge ${minimum}. If your items total less we only add the difference.
            Final price is agreed on site.
          </p>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
        <Camera className="size-6 text-primary" /> Start with a photo
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Point your camera at the pile. The AI reads what's in it and prices it — no site visit, no
        long phone call.
      </p>
    </div>
  );
}
