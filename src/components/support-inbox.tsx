import { useJunk, jobPrice, priceLabel } from "@/lib/junk-store";
import { money } from "@/data/mock-data";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Globe,
  Inbox,
  LockKeyhole,
  MessageCircle,
  Search,
  Send,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  supportFollowupTemplate,
  supportPhoneReply,
  supportQuickReplies,
  supportStaff,
} from "@/data/mock-data";
import {
  isWindowOpen,
  message,
  sendStaffMessage,
  setSupportStatus,
  updateSupport,
  useSupport,
} from "@/lib/support-store";
import { statusLabels, type SupportConversation, type SupportStatus } from "@/lib/support-types";
import { cn } from "@/lib/utils";
const tones: Record<SupportStatus, string> = {
  needs_staff: "bg-warning-soft text-warning-strong",
  human: "bg-info-soft text-info-strong",
  bot: "bg-accent text-primary",
  resolved: "bg-success-soft text-success-strong",
};
const time = (at: number) =>
  new Date(at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
function Channel({ channel }: { channel: SupportConversation["channel"] }) {
  return channel === "email" ? (
    <span className="inline-flex items-center gap-1 text-success-strong">
      <MessageCircle className="size-3" />
      Email
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-info-strong">
      <Globe className="size-3" />
      Website
    </span>
  );
}
export function SupportInbox() {
  const { conversations, error, ready } = useSupport();
  const [selectedId, setSelectedId] = useState("email-olivia");
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("all");
  const [filter, setFilter] = useState("open");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const selected = conversations.find((c) => c.id === selectedId);
  const visible = conversations.filter(
    (c) =>
      (channel === "all" || c.channel === channel) &&
      (filter === "all" ||
        (filter === "open"
          ? c.status !== "resolved"
          : filter === "mine"
            ? c.assignee === "Sarah Carter" && c.status !== "resolved"
            : c.status === filter)) &&
      `${c.customer} ${c.subject} ${c.bookingId ?? ""} ${c.contact}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const openCount = conversations.filter((c) => c.status !== "resolved").length;
  function select(c: SupportConversation) {
    setSelectedId(c.id);
    setMobileDetail(true);
    updateSupport(c.id, (item) => ({ ...item, unread: false }));
  }
  const context = selected ? <CustomerContext conversation={selected} /> : null;
  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-[560px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 lg:px-7">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight">Support inbox</h1>
            <span className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold ring-1 ring-border">
              {openCount} open
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">One team. Every conversation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDemoOpen(true)}>
          <Sparkles className="size-4" />
          Try the demo
        </Button>
      </div>
      <div className="mx-5 mb-4 flex items-center gap-2 rounded-md border border-warning-strong/15 bg-warning-soft/60 px-3 py-2 text-xs text-warning-strong lg:mx-7">
        <span className="size-1.5 shrink-0 rounded-full bg-warning-strong" />
        Demo inbox · Email replies are simulated. Website chats sync in this browser.
      </div>
      {error && (
        <p
          role="alert"
          className="mx-5 mb-3 rounded border border-destructive p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex min-h-0 flex-1 border-t bg-card">
        <aside
          className={cn(
            "w-full shrink-0 flex-col border-r md:flex md:w-72 xl:w-80",
            mobileDetail ? "hidden" : "flex",
          )}
        >
          <div className="space-y-3 p-4">
            <label className="relative block">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                aria-label="Search conversations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or booking…"
                className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="flex gap-1 rounded-md bg-muted p-1">
              {[
                ["all", "All channels"],
                ["email", "Email"],
                ["website", "Website"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setChannel(key!)}
                  aria-pressed={channel === key}
                  className={cn(
                    "flex-1 rounded px-2 py-1.5 text-[11px] font-semibold",
                    channel === key ? "bg-card shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <select
                aria-label="Filter conversations"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-44 bg-transparent text-xs font-semibold"
              >
                <option value="open">Open conversations</option>
                <option value="needs_staff">Needs staff</option>
                <option value="mine">Assigned to me</option>
                <option value="human">Staff handling</option>
                <option value="bot">Bot handling</option>
                <option value="resolved">Resolved</option>
                <option value="all">All conversations</option>
              </select>
              <span className="text-xs text-muted-foreground">{visible.length}</span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto border-t">
            {visible.map((c) => {
              const last = [...c.messages]
                .reverse()
                .find((m) => m.source !== "system" && m.source !== "note");
              return (
                <button
                  key={c.id}
                  onClick={() => select(c)}
                  className={cn(
                    "w-full border-b border-l-[3px] px-4 py-4 text-left transition-colors hover:bg-muted/50",
                    c.id === selectedId ? "border-l-primary bg-accent/60" : "border-l-transparent",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{c.customer}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {last ? time(last.at) : ""}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium">{c.subject}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {last?.source === "phone" ? "Phone: " : ""}
                    {last?.text}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
                    <Channel channel={c.channel} />
                    {c.source === "Chat" && (
                      <span className="rounded bg-info-soft px-1.5 py-0.5 font-semibold text-info-strong">
                        Chat
                      </span>
                    )}
                    <span className={cn("rounded px-1.5 py-0.5 font-semibold", tones[c.status])}>
                      {statusLabels[c.status]}
                    </span>
                    {c.unread && (
                      <span className="size-1.5 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </div>
                </button>
              );
            })}
            {!visible.length && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Inbox className="mx-auto mb-3 size-7 opacity-40" />
                {ready ? "No conversations match these filters." : "Loading inbox…"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t px-4 py-3 text-[10px] text-muted-foreground">
            <MessageCircle className="size-3.5 text-success-strong" />
            Email inquiries <span className="ml-auto rounded bg-muted px-1.5 py-0.5">Demo</span>
          </div>
        </aside>
        <section
          className={cn("min-w-0 flex-1 flex-col md:flex", mobileDetail ? "flex" : "hidden")}
        >
          {selected ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 lg:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    className="md:hidden"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileDetail(false)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft />
                  </Button>
                  <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold sm:grid">
                    {selected.customer
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold">{selected.customer}</h2>
                    <div className="mt-0.5 text-[10px]">
                      <Channel channel={selected.channel} />
                      <span className="ml-2 text-muted-foreground">
                        {selected.channel === "email"
                          ? "Shared company number"
                          : "Staff replies appear in website chat"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Assign conversation"
                    value={selected.assignee}
                    onChange={(e) => {
                      const assignee = e.target.value;
                      updateSupport(selected.id, (c) => ({
                        ...c,
                        assignee,
                        status: assignee && c.status === "needs_staff" ? "human" : c.status,
                      }));
                    }}
                    className="h-8 max-w-32 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="">Unassigned</option>
                    {supportStaff.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant={selected.status === "resolved" ? "outline" : "default"}
                    onClick={() =>
                      setSupportStatus(
                        selected.id,
                        selected.status === "resolved" ? "needs_staff" : "resolved",
                      )
                    }
                  >
                    <Check className="size-3.5" />
                    {selected.status === "resolved" ? "Reopen" : "Resolve"}
                  </Button>
                </div>
              </header>
              {selected.channel === "website" && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-info-soft/40 px-5 py-2 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Bot className="size-3.5" />
                    {selected.status === "bot"
                      ? "Bot is handling this conversation"
                      : selected.status === "resolved"
                        ? "Resolved · new customer messages reopen this chat"
                        : "Bot paused · the customer is waiting for your team"}
                  </span>
                  {selected.status !== "bot" && (
                    <button
                      className="font-semibold text-primary underline underline-offset-2"
                      onClick={() => setSupportStatus(selected.id, "bot", "")}
                    >
                      Return to bot
                    </button>
                  )}
                  {selected.status === "bot" && (
                    <button
                      className="font-semibold text-primary underline underline-offset-2"
                      onClick={() => setSupportStatus(selected.id, "human", "Sarah Carter")}
                    >
                      Take over
                    </button>
                  )}
                </div>
              )}
              <div className="border-b xl:hidden">
                <details className="px-5 py-2 text-xs">
                  <summary className="cursor-pointer font-semibold">
                    Customer details & handoff context
                  </summary>
                  {context}
                </details>
              </div>
              <ConversationDetail
                key={selected.id}
                conversation={selected}
                onTemplate={() => setTemplateOpen(true)}
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-sm text-muted-foreground">
              Select a conversation to get started.
            </div>
          )}
        </section>
        {selected && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-l bg-background/60 xl:block 2xl:w-72">
            {context}
          </aside>
        )}
      </div>
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email follow-up template</DialogTitle>
            <DialogDescription>
              This example demonstrates an email follow-up; it has not been submitted to Meta.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
            {supportFollowupTemplate}
          </div>
          <p className="text-xs text-muted-foreground">
            Demo only. No Email message will be sent. Replies are recorded locally.
          </p>
          <Button
            onClick={() => {
              if (selected && sendStaffMessage(selected.id, supportFollowupTemplate, false, true))
                setTemplateOpen(false);
            }}
          >
            Simulate template send
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Try both conversation sources</DialogTitle>
            <DialogDescription>
              All demo data stays in this browser. Use the same browser and local website address
              for both tabs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="rounded-md border p-4">
              <p className="font-semibold">1. Website bot → your team</p>
              <p className="mb-3 mt-1 text-muted-foreground">
                Open a customer chat, ask a question, then choose “Talk to staff.” Reply here and
                see it appear there.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/assistant/$threadId"
                  params={{ threadId: "junk-prices" }}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open customer chat <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <div className="rounded-md border p-4">
              <p className="font-semibold">2. Staff phone → inbox</p>
              <p className="mb-3 mt-1 text-muted-foreground">
                Add a sample reply from the company phone to Olivia’s Email conversation.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (
                    updateSupport("email-olivia", (c) => ({
                      ...c,
                      status: "human",
                      messages: [
                        ...c.messages,
                        {
                          ...message("phone", "Company phone", supportPhoneReply),
                          delivery: "simulated",
                        },
                      ],
                    }))
                  ) {
                    setSelectedId("email-olivia");
                    setMobileDetail(true);
                    setDemoOpen(false);
                  }
                }}
              >
                <Smartphone />
                Simulate phone reply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              All email replies are simulated. Internal notes are visible only in the staff
              interface.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function CustomerContext({ conversation: c }: { conversation: SupportConversation }) {
  const { data } = useJunk();
  const booking = data.jobs.find((b) => b.id === c.bookingId);
  return (
    <div className="space-y-6 p-5">
      <div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
          CUSTOMER
        </p>
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{c.customer}</p>
        </div>
        <p className="mt-1 break-words text-xs text-muted-foreground">{c.contact}</p>
        <span
          className={cn(
            "mt-3 inline-block rounded px-2 py-1 text-[10px] font-semibold",
            tones[c.status],
          )}
        >
          {statusLabels[c.status]}
        </span>
      </div>
      <div className="rounded-lg border bg-card p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles className="size-3.5 text-accent-strong-ink" />
          {c.channel === "website" ? "Handoff context" : "Conversation context"}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.summary}</p>
        <p className="mt-3 text-[10px] text-muted-foreground">
          {c.customer === "Website visitor"
            ? "Captured from the customer chat"
            : "Sample summary · prototype"}
        </p>
      </div>
      <div>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
          LINKED BOOKING
        </p>
        {booking ? (
          <div className="rounded-lg border bg-card p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">{booking.id}</p>
              <span className="rounded bg-accent px-1.5 py-0.5 text-[9px]">{booking.status}</span>
            </div>
            <p className="mt-3 text-sm font-medium">{booking.street}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {booking.date} · {booking.window}
            </p>
            <div className="mt-3 flex justify-between border-t pt-3 text-xs">
              <span>
                {priceLabel(booking)}: {money(jobPrice(booking))}
              </span>
              <span
                className={
                  booking.payment === "Paid" ? "text-success-strong" : "text-warning-strong"
                }
              >
                {booking.payment}
              </span>
            </div>
            <Link
              to="/staff"
              search={{ section: "Bookings" }}
              className="mt-3 flex items-center justify-between text-xs font-semibold text-primary"
            >
              View bookings
              <ChevronRight className="size-3" />
            </Link>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            No verified booking linked. Ask for a booking reference before discussing account
            details.
          </p>
        )}
      </div>
      {c.threadId && (
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link
            to="/assistant/$threadId"
            params={{ threadId: c.threadId }}
            target="_blank"
            rel="noreferrer"
          >
            <Globe />
            Customer view
            <ArrowUpRight />
          </Link>
        </Button>
      )}
      <div className="border-t pt-4 text-[11px] leading-relaxed text-muted-foreground">
        {c.channel === "email"
          ? "Phone replies are labelled “Company phone”. Individual staff identity is available for dashboard replies."
          : "The customer stays in their website chat. Private notes are never shown in that view."}
      </div>
    </div>
  );
}
function ConversationDetail({
  conversation: c,
  onTemplate,
}: {
  conversation: SupportConversation;
  onTemplate: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState(false);
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(Date.now());
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [c.messages.length]);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);
  const windowOpen = isWindowOpen(c, now);
  const paused = c.status === "resolved" || c.status === "bot";
  const blocked = !note && (!windowOpen || paused);
  function send() {
    if (sendStaffMessage(c.id, draft, note)) {
      setDraft("");
      setNotice(
        note
          ? "Private note saved."
          : c.channel === "website"
            ? "Reply added to the customer’s website chat."
            : "Demo reply saved. No real Email message sent.",
      );
    } else setNotice("Reply not saved. Check the conversation status and browser storage.");
  }
  return (
    <>
      <div
        className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-background/50 px-4 py-5 lg:px-6"
        role="log"
        aria-label="Conversation messages"
      >
        <p className="text-center text-[10px] tracking-wide text-muted-foreground">
          CONVERSATION HISTORY · HONG KONG TIME
        </p>
        {c.messages.map((m) =>
          m.source === "system" ? (
            <p key={m.id} className="text-center text-[10px] text-muted-foreground">
              {m.text}
            </p>
          ) : (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.source === "customer" || m.source === "bot" ? "justify-start" : "justify-end",
              )}
            >
              <div className="max-w-[90%] sm:max-w-[85%]">
                <p className="mb-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  {m.source === "phone" && <Smartphone className="size-3" />}
                  {m.source === "note" && <LockKeyhole className="size-3" />}
                  {m.source === "bot" && <Bot className="size-3" />}
                  {m.author}
                  {m.source === "phone"
                    ? " · Email app"
                    : m.source === "note"
                      ? " · Private note"
                      : m.source === "staff"
                        ? " · Dashboard"
                        : ""}
                </p>
                <div
                  className={cn(
                    "whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed",
                    m.source === "note"
                      ? "border border-warning-strong/15 bg-warning-soft"
                      : m.source === "staff" || m.source === "phone"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm border bg-card",
                  )}
                >
                  {m.text}
                </div>
                <p className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
                  {new Date(m.at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    timeZone: "America/Chicago",
                  })}{" "}
                  · {time(m.at)}
                  {m.delivery === "simulated" && (
                    <>
                      <CheckCheck className="size-3" />
                      Demo
                    </>
                  )}
                </p>
              </div>
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>
      <div className="border-t bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex gap-3 text-xs font-semibold">
            <button
              onClick={() => setNote(false)}
              aria-pressed={!note}
              className={cn(
                "border-b-2 pb-1",
                note ? "border-transparent text-muted-foreground" : "border-primary",
              )}
            >
              Reply
            </button>
            <button
              onClick={() => setNote(true)}
              aria-pressed={note}
              className={cn(
                "flex items-center gap-1 border-b-2 pb-1",
                note
                  ? "border-warning-strong text-warning-strong"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <LockKeyhole className="size-3" />
              Private note
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {note
              ? "Visible to staff only"
              : c.channel === "website"
                ? "To website chat"
                : "Via company Email"}
          </span>
        </div>
        {!note && !windowOpen && (
          <div className="mb-3 rounded-md bg-warning-soft p-3 text-xs text-warning-strong">
            <p className="flex items-center gap-1.5 font-semibold">
              <Clock3 className="size-3.5" />
              Email reply window closed
            </p>
            <p className="mt-1">
              Use a template follow-up. Free-text replies resume after the customer responds.
            </p>
            {!paused && (
              <button className="mt-2 font-bold underline" onClick={onTemplate}>
                Choose example template
              </button>
            )}
          </div>
        )}
        {!note && paused && (
          <p className="mb-3 rounded bg-muted p-3 text-xs text-muted-foreground">
            {c.status === "resolved"
              ? "Reopen this conversation to reply."
              : "Take over from the bot to reply."}
          </p>
        )}
        {!blocked && !note && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {supportQuickReplies.map((q) => (
              <button
                key={q.label}
                onClick={() => setDraft(q.text)}
                className="rounded-full border px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-accent"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className={cn(
            "rounded-lg border focus-within:ring-1 focus-within:ring-ring",
            note && "bg-warning-soft/40",
          )}
        >
          <textarea
            aria-label={note ? "Private note" : "Reply message"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={blocked}
            placeholder={note ? "Add context for your teammates…" : "Write a reply…"}
            className="min-h-20 w-full resize-none bg-transparent px-3 py-3 text-sm outline-none disabled:opacity-40"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-[10px] text-muted-foreground">
              {note ? "Not sent to customer" : "Prototype · text messages only"}
            </span>
            <Button type="submit" size="sm" disabled={blocked || !draft.trim()}>
              <Send className="size-3.5" />
              {note ? "Add note" : "Send reply"}
            </Button>
          </div>
        </form>
        <p role="status" className="mt-2 min-h-3 text-[10px] text-muted-foreground">
          {notice}
        </p>
      </div>
    </>
  );
}
