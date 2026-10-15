import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The walkthrough video.
 *
 * To replace it, drop a new file at `public/video/demo-v3.mp4`. POSTER_SRC is
 * the still shown before playback — swap it for a frame from the video itself
 * when one is exported.
 */
const VIDEO_SRC: string | null = "/video/demo-v3.mp4";
const POSTER_SRC = "/junk-removal-hero-v2.png";

export function DemoVideo({ className }: { className?: string }) {
  if (VIDEO_SRC) {
    return (
      <figure
        className={cn(
          "overflow-hidden rounded-xl border border-bd-navy/10 bg-bd-navy shadow-xl",
          className,
        )}
      >
        <video
          controls
          playsInline
          preload="none"
          poster={POSTER_SRC}
          aria-label="Booked to Done, 64-second walkthrough"
          className="aspect-video w-full object-cover"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </figure>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-dashed border-bd-navy/25 bg-bd-paper",
        className,
      )}
    >
      <img
        src={POSTER_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover opacity-20 blur-[1px]"
        loading="lazy"
        decoding="async"
      />
      <div className="relative grid size-full place-items-center p-6 text-center">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-bd-navy/90 text-white shadow-lg">
            <Play className="size-6 translate-x-0.5" fill="currentColor" />
          </span>
          <p className="mt-3 font-display text-sm font-bold text-bd-navy">64-second walkthrough</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Video placeholder — the final cut drops in here.
          </p>
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded bg-bd-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Placeholder
      </span>
    </div>
  );
}
