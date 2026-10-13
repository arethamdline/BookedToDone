import type { PhotoRef } from "@/data/mock-data";
const MAX = 5 * 1024 * 1024,
  types = ["image/jpeg", "image/png", "image/webp"];
let database: Promise<IDBDatabase> | undefined;
function open() {
  return (database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("smart-junk-photos", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      database = undefined;
      reject(new Error("Photo storage is unavailable in this browser."));
    };
  }));
}
export function validatePhoto(file: Pick<File, "type" | "size">) {
  if (!types.includes(file.type)) throw new Error("Choose JPG, PNG, or WebP images.");
  if (file.size > MAX || file.size === 0)
    throw new Error("Each photo must be between 1 byte and 5 MB.");
}
export async function savePhoto(file: File): Promise<PhotoRef> {
  validatePhoto(file);
  const db = await open();
  const id = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Photo could not be saved. Browser storage may be full."));
    tx.onabort = () => reject(new Error("Photo could not be saved."));
  });
  return { id, name: file.name, type: file.type, size: file.size };
}
export async function getPhoto(id: string): Promise<Blob | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const r = db.transaction("photos", "readonly").objectStore("photos").get(id);
    r.onsuccess = () => resolve(r.result ?? null);
    r.onerror = () => reject(new Error("Photo could not be loaded."));
  });
}
