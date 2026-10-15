import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

import { Button } from "./ui/button";
import { money, today, type DemoData, type Job } from "@/data/mock-data";
import { useJunk } from "@/lib/junk-store";

/**
 * The office-side assistant.
 *
 * Answers from the demo's own job records rather than a model, so every number
 * it gives is one the user can go and verify on screen. When it can't answer it
 * says so instead of guessing — the same rule as the customer-facing assistant.
 */

type Msg = { role: "you" | "ai"; text: string };

const SUGGESTIONS = [
  "What's on today?",
  "Who hasn't paid?",
  "Where are jobs coming from?",
  "What needs quoting?",
];

const active = (j: Job) => j.status !== "Cancelled" && j.status !== "Completed";

function answer(question: string, data: DemoData): string {
  const q = question.toLowerCase();
  const jobs = data.jobs;

  if (/today|schedule|on now|happening/.test(q)) {
    const t = jobs.filter((j) => j.date === today() && active(j));
    if (!t.length) return "Nothing is scheduled for today.";
    return `${t.length} job${t.length === 1 ? "" : "s"} today: ${t
      .map((j) => `${j.name} (${j.window}${j.truck ? "" : ", unassigned"})`)
      .join("; ")}.`;
  }

  if (/unpaid|owe|owing|paid|outstanding|money/.test(q)) {
    const unpaid = jobs.filter((j) => j.payment === "Unpaid" && j.status === "Completed");
    if (!unpaid.length) return "Nothing completed is sitting unpaid.";
    const total = unpaid.reduce((s, j) => s + (j.finalCharge ?? j.estimate ?? 0), 0);
    return `${unpaid.length} completed job${unpaid.length === 1 ? "" : "s"} unpaid, ${money(
      total,
    )} outstanding: ${unpaid.map((j) => j.name).join(", ")}.`;
  }

  if (/where|source|channel|coming from|lead/.test(q)) {
    const counts = new Map<string, number>();
    jobs.forEach((j) => counts.set(j.source, (counts.get(j.source) ?? 0) + 1));
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return `Across ${jobs.length} jobs: ${ranked.map(([s, n]) => `${s} ${n}`).join(", ")}.`;
  }

  if (/quote|quoting|estimate|price/.test(q)) {
    const needs = jobs.filter((j) => j.estimate == null && active(j));
    return needs.length
      ? `${needs.length} job${needs.length === 1 ? "" : "s"} waiting on a quote: ${needs
          .map((j) => j.name)
          .join(", ")}.`
      : "Every active job already has a price on it.";
  }

  if (/unassigned|truck|crew|dispatch/.test(q)) {
    const un = jobs.filter((j) => active(j) && !j.truck);
    return un.length
      ? `${un.length} active job${un.length === 1 ? "" : "s"} have no truck yet: ${un
          .map((j) => j.name)
          .join(", ")}.`
      : "Every active job has a truck assigned.";
  }

  if (/how many|total|count|jobs/.test(q)) {
    return `${jobs.length} jobs on record, ${jobs.filter(active).length} still active.`;
  }

  return "I can't answer that one from the booking records. Try asking about today's jobs, unpaid balances, where jobs came from, what needs quoting, or what's unassigned.";
}

export function StaffAssistant() {
  const { data } = useJunk();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, open]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setDraft("");
    setMsgs((m) => [...m, { role: "you", text: q }, { role: "ai", text: answer(q, data) }]);
  };

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bd-ai-gradient fixed bottom-5 right-5 z-[66] flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-xl transition-transform hover:scale-105"
      >
        <Bot className="size-5" /> Office assistant
      </button>
    );

  return (
    <aside
      aria-label="Office assistant"
      className="fixed bottom-5 right-5 z-[66] flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl"
    >
      <header className="bd-ai-gradient flex items-center gap-2 px-4 py-2.5 text-white">
        <Sparkles className="size-4" />
        <span className="text-sm font-bold">Office assistant</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close the assistant"
          className="ml-auto grid size-7 place-items-center rounded-full hover:bg-white/20"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Ask about your jobs. Answers come from your booking records, not a guess.
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="block w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "you"
                ? "ml-auto w-5/6 rounded-lg rounded-br-sm bg-primary px-3 py-2 text-primary-foreground"
                : "w-11/12 rounded-lg rounded-bl-sm bg-muted px-3 py-2"
            }
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
        className="flex gap-2 border-t p-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your jobs…"
          aria-label="Ask the office assistant"
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </aside>
  );
}
