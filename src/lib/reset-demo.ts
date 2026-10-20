/**
 * Wipe everything the demo has remembered in this browser.
 *
 * The demo keeps its state in the browser (AGENTS.md: no server, no database),
 * so anything typed while testing — chats, bookings, inbox replies, uploaded
 * photos — stays there and turns up again the next time the demo is opened on
 * the same machine. That includes in front of a client. This is the clean
 * slate to take before showing it to someone.
 *
 * Cleared by prefix rather than by a list of keys, so storage versions that
 * have since been renamed (`smart-junk-support-v2-demo` still lingers in some
 * browsers) go too.
 */
const PREFIXES = ["smart-junk-", "bd-"];
const PHOTO_DB = "smart-junk-photos";

export function resetDemo() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      Object.keys(store)
        .filter((key) => PREFIXES.some((prefix) => key.startsWith(prefix)))
        .forEach((key) => store.removeItem(key));
    } catch {
      /* storage blocked — nothing was saved there to clear */
    }
  }
  try {
    indexedDB.deleteDatabase(PHOTO_DB);
  } catch {
    /* no IndexedDB — no saved photos */
  }
}
