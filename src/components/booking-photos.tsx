import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "./ui/button";
import { getPhoto, savePhoto, validatePhoto } from "@/lib/photo-store";
import type { PhotoRef } from "@/data/mock-data";
export function BookingPhotos({
  photos,
  onChange,
  onBusy,
}: {
  photos: PhotoRef[];
  onChange?: (photos: PhotoRef[]) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const picking = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let active = true;
    const created: string[] = [];
    setUrls({});
    Promise.all(
      photos.map(async (p) => {
        try {
          const blob = await getPhoto(p.id);
          if (!blob) return [p.id, ""];
          const url = URL.createObjectURL(blob);
          created.push(url);
          return [p.id, url];
        } catch {
          return [p.id, ""];
        }
      }),
    ).then((entries) => {
      if (active) setUrls(Object.fromEntries(entries));
      else created.forEach((u) => URL.revokeObjectURL(u));
    });
    return () => {
      active = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photos]);
  const upload = async (files: FileList | null) => {
    if (!files || picking.current || !onChange) return;
    picking.current = true;
    setError("");
    setBusy(true);
    onBusy?.(true);
    try {
      const selected = Array.from(files);
      if (photos.length + selected.length > 5) throw new Error("You can add up to 5 photos.");
      selected.forEach(validatePhoto);
      const next = [...photos];
      for (const file of selected) next.push(await savePhoto(file));
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add photos.");
    } finally {
      picking.current = false;
      setBusy(false);
      onBusy?.(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="space-y-3">
      {onChange && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">
                Add photos <span className="font-normal text-muted-foreground">(optional)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Photos help our team prepare for your pickup.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={busy || photos.length >= 5}
              onClick={() => input.current?.click()}
            >
              <Camera />
              {busy ? "Saving…" : "Add photos"}
            </Button>
          </div>
          <input
            ref={input}
            aria-label="Upload pickup photos"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => void upload(e.target.files)}
          />
          <p className="text-xs text-muted-foreground">
            Up to 5 images · JPG, PNG, or WebP · 5 MB each · saved in this browser.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="relative overflow-hidden rounded-lg border bg-muted">
            {urls[p.id] ? (
              <a href={urls[p.id]} target="_blank" rel="noreferrer" aria-label={`View ${p.name}`}>
                <img src={urls[p.id]} className="h-28 w-full object-cover" alt={p.name} />
              </a>
            ) : (
              <p className="grid h-28 place-items-center p-3 text-xs text-muted-foreground">
                {p.id in urls ? "Photo unavailable in this browser" : "Loading photo…"}
              </p>
            )}
            <p className="truncate p-2 text-xs">{p.name}</p>
            {onChange && (
              <Button
                size="icon"
                type="button"
                variant="secondary"
                disabled={busy}
                className="absolute right-1 top-1 size-7"
                aria-label={`Remove ${p.name}`}
                onClick={() => onChange(photos.filter((x) => x.id !== p.id))}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {!onChange && !photos.length && (
        <p className="text-xs text-muted-foreground">No photos attached.</p>
      )}
    </div>
  );
}
