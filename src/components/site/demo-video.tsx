import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The walkthrough video.
 *
 * Shown as its title card; playing opens it in a full-screen lightbox rather
 * than running inside the ~590px card, where the on-screen text in the video
 * is too small to read.
 *
 * To replace it, drop a new file at `public/video/demo-v3.mp4` and a still at
 * `public/video/demo-v3-poster.jpg`.
 */
const VIDEO_SRC = "/video/demo-v3.mp4";
const POSTER_SRC = "/video/demo-v3-poster.jpg";

export function DemoVideo({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // don't let the page scroll behind the lightbox
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    videoRef.current?.play().catch(() => {
      /* autoplay blocked — the controls are right there */
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Play the 64-second walkthrough"
        className={cn(
          "group relative block aspect-video w-full overflow-hidden rounded-xl border border-bd-navy/10 bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-blue focus-visible:ring-offset-2",
          className,
        )}
      >
        <img
          src={POSTER_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute inset-0 grid place-items-center transition-colors group-hover:bg-bd-navy/10">
          <span className="grid size-16 place-items-center rounded-full bg-bd-navy/90 text-white shadow-xl transition-transform group-hover:scale-110">
            <Play className="size-7 translate-x-0.5" fill="currentColor" />
          </span>
        </span>
        <span className="absolute bottom-3 left-3 rounded bg-bd-navy/90 px-2 py-1 text-[11px] font-bold text-white">
          64-second walkthrough
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Booked to Done walkthrough"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close the video"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <video
            ref={videoRef}
            onClick={(e) => e.stopPropagation()}
            controls
            playsInline
            preload="auto"
            poster={POSTER_SRC}
            aria-label="Booked to Done, 64-second walkthrough"
            className="max-h-full w-full max-w-6xl rounded-lg shadow-2xl"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </div>
      )}
    </>
  );
}
