import { useEffect, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";

import { PhoneFrame, LaptopFrame } from "./device-frame";
import { featureDemos, type Line } from "@/data/feature-demos";
import { photoSamples } from "@/data/photo-samples";
import { cn } from "@/lib/utils";

/**
 * A small, clickable walkthrough of one feature.
 *
 * Driven entirely by the scripts in `feature-demos.ts` — one renderer, twelve
 * demos — so each page shows the feature actually doing something instead of a
 * static screenshot.
 */

function Scene({ lines }: { lines: Line[] }) {
  return (
    <div className="flex h-full flex-col gap-2 bg-white p-3 text-[11px] leading-snug text-bd-navy">
      {lines.map((line, i) => {
        switch (line.k) {
          case "title":
            return (
              <p
                key={i}
                className="border-b border-bd-line pb-1.5 font-display text-[12px] font-bold"
              >
                {line.text}
              </p>
            );

          case "chat":
            return (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-2.5 py-1.5",
                  line.who === "them" && "ml-auto rounded-br-sm bg-bd-blue text-white",
                  line.who === "you" && "ml-auto rounded-br-sm bg-bd-navy text-white",
                  line.who === "ai" && "rounded-bl-sm bg-bd-chip",
                )}
              >
                {line.text}
                {line.tag && (
                  <p
                    className={cn(
                      "mt-1 text-[8px] font-bold uppercase tracking-wide",
                      line.who === "ai" ? "text-bd-body" : "text-white/70",
                    )}
                  >
                    {line.tag}
                  </p>
                )}
              </div>
            );

          case "row":
            return (
              <div key={i} className="flex items-start justify-between gap-2">
                <span className="text-bd-body">{line.label}</span>
                <span className="flex items-center gap-1 text-right font-medium">
                  {line.value}
                  {line.auto && (
                    <span className="rounded-sm bg-bd-done-tint px-1 text-[8px] font-bold uppercase text-bd-green">
                      auto
                    </span>
                  )}
                </span>
              </div>
            );

          case "item":
            return (
              <div key={i} className="flex items-center gap-1.5 rounded-md bg-bd-chip px-2 py-1.5">
                {line.done ? (
                  <Check className="size-3 shrink-0 text-bd-green" />
                ) : (
                  <span className="size-3 shrink-0 rounded-full border border-bd-line" />
                )}
                <span>{line.text}</span>
              </div>
            );

          case "banner":
            return (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-1.5 rounded-md px-2 py-1.5 font-semibold",
                  line.tone === "ai" && "bd-ai-gradient text-white",
                  line.tone === "done" && "bg-bd-done-tint text-bd-green",
                  line.tone === "warn" && "bg-warning-soft text-warning-strong",
                )}
              >
                {line.tone === "ai" ? (
                  <Sparkles className="mt-0.5 size-3 shrink-0" />
                ) : (
                  <Check className="mt-0.5 size-3 shrink-0" />
                )}
                <span>{line.text}</span>
              </div>
            );

          case "scan": {
            // The actual sample photo and the actual boxes the booking flow
            // draws, so the feature page shows the thing itself rather than a
            // word-picture of it.
            const sample = photoSamples[line.sample]!;
            return (
              <div key={i} className="relative shrink-0 overflow-hidden rounded-md">
                <img
                  src={sample.src}
                  alt={sample.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/11] w-full object-cover"
                />
                {line.boxes === false ? (
                  <span className="bd-scanline absolute inset-x-0 h-0.5 bg-gradient-to-r from-bd-ai-from to-bd-ai-to shadow-[0_0_12px_3px_rgba(124,58,237,0.6)]" />
                ) : (
                  sample.detections.map((d, n) => (
                    <span
                      key={d.id}
                      className="bd-box-in absolute rounded-sm border border-bd-ai-to"
                      style={{
                        left: `${d.box[0]}%`,
                        top: `${d.box[1]}%`,
                        width: `${d.box[2]}%`,
                        height: `${d.box[3]}%`,
                        animationDelay: `${n * 0.22}s`,
                      }}
                    >
                      <span className="bd-ai-gradient absolute -top-3.5 left-0 whitespace-nowrap rounded px-1 text-[8px] font-bold text-white">
                        {d.label}
                      </span>
                    </span>
                  ))
                )}
              </div>
            );
          }

          case "big":
            return (
              <div key={i} className="rounded-md border-2 border-bd-blue p-2">
                <p className="text-[9px] font-bold uppercase tracking-wide text-bd-body">
                  {line.label}
                </p>
                <p className="font-display text-xl font-extrabold tabular-nums">{line.value}</p>
                {line.note && <p className="mt-0.5 text-[9px] text-bd-body">{line.note}</p>}
              </div>
            );
        }
      })}
    </div>
  );
}

export function FeatureDemo({ slug, frame }: { slug: string; frame: "phone" | "laptop" }) {
  const steps = featureDemos[slug];
  const [i, setI] = useState(0);

  // a different feature page means a different script — start it from the top
  useEffect(() => setI(0), [slug]);

  if (!steps?.length) return null;

  const step = steps[i]!;
  const last = i === steps.length - 1;

  const screen = <Scene lines={step.lines} />;
  const stage =
    frame === "phone" ? (
      <PhoneFrame className="mx-auto w-[15rem]">
        {/* pt clears the notch, which otherwise sits over the first line */}
        <div className="h-[24rem] overflow-hidden bg-white pt-5">{screen}</div>
      </PhoneFrame>
    ) : (
      <LaptopFrame className="mx-auto w-full max-w-[26rem]">
        <div className="h-[17rem] overflow-hidden">{screen}</div>
      </LaptopFrame>
    );

  return (
    <div className="rounded-2xl border border-bd-navy/10 bg-bd-paper p-5 sm:p-6">
      {stage}

      <div className="mt-5 flex items-center justify-center gap-1.5">
        {steps.map((_, n) => (
          <span
            key={n}
            className={cn(
              "h-1.5 rounded-full transition-all",
              n === i ? "w-5 bg-bd-blue" : "w-1.5 bg-bd-navy/20",
            )}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        {last ? (
          <button
            type="button"
            onClick={() => setI(0)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-bd-navy/15 bg-white px-4 text-sm font-semibold text-bd-navy transition-colors hover:bg-bd-paper"
          >
            <RotateCcw className="size-3.5" /> Run it again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setI(i + 1)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-bd-blue px-4 text-sm font-bold text-white transition-colors hover:bg-bd-blue-ink"
          >
            {step.action} <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-bd-body">
        Sample data. Nothing is sent or charged.
      </p>
    </div>
  );
}
