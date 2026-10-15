import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  History,
  Languages,
  MessageSquarePlus,
  Package,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import type { UIMessage } from "ai";
import { CustomerShell } from "@/components/customer-shell";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { handoffThread, sendWebsiteMessage, useSupport, message } from "@/lib/support-store";
import { statusLabels } from "@/lib/support-types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JunkBookingForm } from "@/components/junk-booking-form";
import { blankJob, money, dateLabel, windows } from "@/data/mock-data";
import { answerCompanyQuestion, company } from "@/data/company";
import { quote, readData, readChatDraft, setChatDraft, useJunk, isCustom } from "@/lib/junk-store";
import { updateSupport } from "@/lib/support-store";

type Thread = { id: string; title: string; updated: string; messages: UIMessage[] };
const defaults: Thread[] = [
  {
    id: "junk-prices",
    title: "Plan a junk pickup",
    updated: "Today",
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Hi, I’m **${company.name} AI**. Tell me what needs to go and I can help with prices, accepted items, pickup areas, or a booking.`,
          },
        ],
      },
    ],
  },
];
const THREAD_STORAGE = "smart-junk-assistant-threads";
export const Route = createFileRoute("/assistant/$threadId")({
  head: () => ({
    meta: [
      { title: "AI assistant — Booked to Done" },
      { name: "description", content: "Junk removal help from the BookedToDone Demo assistant." },
      { property: "og:title", content: "AI assistant — Booked to Done" },
      { property: "og:description", content: "Junk removal estimates and booking help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantPage,
});
function AssistantPage() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data } = useJunk();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    conversations: supportConversations,
    error: supportError,
    ready: supportReady,
  } = useSupport();
  const support = supportConversations.find((c) => c.threadId === threadId);
  const savedActive = threads.find((t) => t.id === threadId) ?? threads[0];
  const active: Thread | undefined = support
    ? {
        id: threadId,
        title: support.subject,
        updated: "Now",
        messages: support.messages
          .filter((m) => !["note", "system"].includes(m.source))
          .map((m) => ({
            id: m.id,
            role: m.source === "customer" ? "user" : "assistant",
            parts: [{ type: "text", text: m.text }],
          })),
      }
    : savedActive;
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THREAD_STORAGE);
      if (saved) setThreads(JSON.parse(saved) as Thread[]);
    } catch {
      setThreads(defaults);
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(THREAD_STORAGE, JSON.stringify(threads));
  }, [threads, hydrated]);
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);
  const reply = (text: string) => {
    const lower = text.toLowerCase();
    const draft = readChatDraft();
    if (/hazard|asbestos|chemical|paint|weapon|medical|prohibit/.test(lower))
      return "We can't take hazardous waste, chemicals, asbestos, weapons, or medical waste. If you're unsure about something, our team can help you check.";
    if (/accepted|services|what.*take/.test(lower))
      return "We can help with furniture, appliances, electronics, everyday junk, office cleanouts, and non-hazardous construction debris. What needs to go?";
    if (/custom|garage|cleanout|clean up|property|large cleanup/.test(lower)) {
      draft.mode = "custom";
      draft.project = text;
      setChatDraft(draft);
      if (/garage|yard/.test(lower)) {
        const companyAnswer = answerCompanyQuestion(text, data.pricing);
        if (companyAnswer)
          return `${companyAnswer} Select **Book through chat** to add the cleanup to your request.`;
      }
      if (/book|request|quote/.test(lower)) setBookingOpen(true);
      return "That sounds like a custom cleanup. Tell us about the space and add a few photos if you can. Our team will prepare a quote for your approval—there's no automatic price. Select **Book through chat** to review your request.";
    }
    const found = data.pricing.items.filter(
      (i) =>
        lower.includes(i.id) ||
        lower.includes(i.name.toLowerCase().split(" / ")[0]!) ||
        (i.id === "fridge" && lower.includes("refrigerator")) ||
        (i.id === "bags" && /bags?|general junk/.test(lower)),
    );
    if (found.length) {
      for (const item of found) {
        const label =
          item.id === "fridge"
            ? "(?:fridge|refrigerator)"
            : item.id === "bags"
              ? "(?:bag|bags)"
              : item.id;
        const count = lower.match(
          new RegExp("(\\d+|one|two|three|four|five)\\s*(?:x\\s*)?" + label),
        );
        const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
        draft.items[item.id] = Math.min(100, words[count?.[1] ?? ""] ?? Number(count?.[1] ?? 1));
      }
      setChatDraft(draft);
      const result = quote(draft, data.pricing);
      return result.estimate == null
        ? "I've added those items. Our team will review your custom request and prepare a quote."
        : `Got it: ${found.map((i) => `${draft.items[i.id]} × ${i.name}`).join(", ")}. Your current item estimate is **${money(result.estimate)}**, including our minimum pickup charge where needed. Where should we collect the items—outside, ground floor, or upstairs? You can review everything in **Book through chat** before submitting.`;
    }
    const companyAnswer = answerCompanyQuestion(text, data.pricing);
    if (companyAnswer) return companyAnswer;
    let captured = false;
    const email = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (email) {
      draft.email = email[0].replace(/[.,]$/, "");
      captured = true;
    }
    const name = text.match(/(?:my name is|name:)\s*([a-z][a-z '-]+)/i);
    if (name) {
      draft.name = name[1]!.trim();
      captured = true;
    }
    const phone = text.match(/(?:\+1[ -]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}/);
    if (phone) {
      draft.phone = phone[0];
      captured = true;
    }
    const address = text.match(/(.+?),\s*([a-z ]+),\s*([a-z]{2})\s+(\d{5})/i);
    if (address) {
      draft.street = address[1]!.trim();
      draft.city = address[2]!.trim();
      draft.state = address[3]!.toUpperCase();
      draft.zip = address[4]!;
      captured = true;
    }
    const date = text.match(/(\d{4})-(\d{2})-(\d{2})/) ?? text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (date) {
      draft.date = date[0]!.includes("/") ? `${date[3]}-${date[1]}-${date[2]}` : date[0]!;
      captured = true;
    }
    const slot = windows.find((w) => lower.includes(w.toLowerCase()));
    if (slot) {
      draft.window = slot;
      captured = true;
    }
    if (/upstairs|ground floor|curbside|outside|elevator/.test(lower)) {
      draft.access = /upstairs|elevator/.test(lower)
        ? /without|no elevator/.test(lower)
          ? "Upstairs without elevator"
          : "Upstairs with elevator"
        : /ground floor/.test(lower)
          ? "Inside on the ground floor"
          : "Outside / curbside";
      const floor = text.match(/(?:floor|level)\s*(\d+)/i);
      if (floor) draft.floor = Number(floor[1]);
      captured = true;
    }
    if (captured) {
      setChatDraft(draft);
      return `Thanks, I've added those details to your draft. ${!draft.name ? "What name should we use?" : !draft.email ? "What email should we send the confirmation to?" : !draft.phone ? "What phone number can our crew reach you on?" : !draft.street ? "What is the pickup address (street, city, state, ZIP)?" : "Let's review your items, pickup date, time window, and contact details before you submit."} Select **Book through chat** anytime to check or finish your request.`;
    }
    if (/book|schedule|appointment/.test(lower)) {
      setBookingOpen(true);
      return "Let's review your items, pickup details, date, time window, and contact information. Nothing is submitted until you select **Request Pickup**.";
    }
    if (/price|cost|estimate|load/.test(lower))
      return `We estimate standard pickups from the items you choose, with a **${money(data.pricing.minimum)} minimum pickup charge**. Large or unusual cleanups get a staff quote. Tell me your items and quantities, and I'll use the same pricing as our booking form.`;
    if (/stairs|parking|labor|heavy/.test(lower))
      return "Tell us whether the items are outside, on the ground floor, or upstairs, and whether our truck can park nearby. These details help us prepare. Fees are added only when staff explicitly configures them; 'Not sure' never adds a charge.";
    if (/pickup|area|austin|time/.test(lower))
      return "This demo serves Austin metro. Choose a two-hour pickup window between 8 AM and 6 PM. Our team will review availability and confirm your pickup.";
    if (/email|sms|confirmation|payment/.test(lower))
      return "Quotes and invoices go by email; reminders and arrival updates go by SMS. This demo records them without sending real messages or taking payment.";
    return "I'd like our team to help with that. Select **Talk to staff** to send this conversation to the support inbox, or **Book through chat** to review a pickup request.";
  };
  const bookingDemo = () => {
    const draft = {
      ...blankJob(),
      source: "Chat" as const,
      name: "James Walker",
      email: "james@example.com",
      phone: "(512) 555-0101",
      street: "2210 E Cesar Chavez St",
      city: "Austin",
      state: "TX",
      zip: "78702",
      items: { desk: 2, bags: 4 },
      access: "Inside on the ground floor" as const,
      window: windows[1]!,
    };
    setChatDraft(draft);
    const estimated = quote(draft, data.pricing);
    const demo = [
      ["user", "I need 2 office desks and 4 bags removed."],
      [
        "assistant",
        `Happy to help. The item estimate is ${money(estimated.estimate)}, using our current item prices and minimum charge. Where will we collect the items?`,
      ],
      ["user", "Inside on the ground floor. The truck can park close by."],
      ["assistant", "Great. What address, contact information, and pickup time should we use?"],
      [
        "user",
        `James Walker, james@example.com, (512) 555-0101. 2210 E Cesar Chavez St, Austin, TX 78702. ${dateLabel(draft.date)}, ${draft.window}.`,
      ],
      [
        "assistant",
        "I've added those details to your draft. Review the pickup information and estimate in Book through chat; then choose Request Pickup when you're ready. Nothing is booked yet.",
      ],
    ];
    setThreads((ts) =>
      ts.map((t) =>
        t.id === active?.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                ...demo.map(([role, text]) => ({
                  id: crypto.randomUUID(),
                  role: role as "user" | "assistant",
                  parts: [{ type: "text" as const, text: text! }],
                })),
              ],
            }
          : t,
      ),
    );
    setBookingOpen(true);
  };
  const send = (text: string) => {
    if (!text.trim() || !active) return;
    if (support) {
      sendWebsiteMessage(support.id, text, support.status === "bot" ? reply(text) : "");
      return;
    }
    const now = Date.now();
    const response = reply(text);
    setThreads((ts) =>
      ts.map((t) =>
        t.id === active.id
          ? {
              ...t,
              updated: "Now",
              messages: [
                ...t.messages,
                { id: `u${now}`, role: "user", parts: [{ type: "text", text }] },
                { id: `r${now}`, role: "assistant", parts: [{ type: "text", text: response }] },
              ],
            }
          : t,
      ),
    );
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const create = () => {
    setChatDraft({ ...blankJob(), source: "Chat" });
    const id = `conversation-${Date.now()}`;
    const t: Thread = {
      id,
      title: "New junk removal question",
      updated: "Now",
      messages: [
        {
          id: `hello-${id}`,
          role: "assistant",
          parts: [
            {
              type: "text",
              text: "Hello! What items would you like removed? I can help estimate costs and book a pickup.",
            },
          ],
        },
      ],
    };
    setThreads((ts) => [t, ...ts]);
    navigate({ to: "/assistant/$threadId", params: { threadId: id } });
  };
  if (!hydrated || !supportReady)
    return (
      <CustomerShell>
        <p className="p-8 text-center text-sm text-muted-foreground">Loading your conversation…</p>
      </CustomerShell>
    );
  if (!active) return null;
  return (
    <CustomerShell>
      <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-7xl overflow-hidden lg:h-[calc(100dvh-4rem)] md:border-x">
        <aside className="hidden w-72 shrink-0 border-r bg-card md:flex md:flex-col">
          <div className="border-b p-4">
            <Button className="w-full" onClick={create}>
              <Plus />
              New conversation
            </Button>
          </div>
          <div className="flex-1 space-y-1 overflow-auto p-2">
            {threads.map((t) => (
              <Link
                key={t.id}
                to="/assistant/$threadId"
                params={{ threadId: t.id }}
                className={cn(
                  "block rounded-md px-3 py-3",
                  t.id === active.id ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.updated}</p>
              </Link>
            ))}
          </div>
          <p className="border-t p-4 text-xs text-muted-foreground">Saved in this browser</p>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setHistoryOpen(true)}
                aria-label="Chat history"
              >
                <History />
              </Button>
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <Package />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-display font-bold">
                  {support && support.status !== "bot"
                    ? `${company.name} support team`
                    : `${company.name} AI`}
                </h1>
                <p className="flex items-center gap-1 text-xs text-success-strong">
                  <span className="size-2 rounded-full bg-success-strong" />
                  English · AI assistant
                </p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={create} aria-label="New conversation">
              <MessageSquarePlus />
            </Button>
          </header>
          {supportError && (
            <p role="alert" className="bg-warning-soft p-3 text-xs text-warning-strong">
              {supportError}
            </p>
          )}
          {support && (
            <div className="border-b bg-info-soft/40 px-4 py-3 text-xs" role="status">
              <strong>{statusLabels[support.status]}</strong>
              <span className="ml-2">
                {support.status === "needs_staff"
                  ? "Your conversation is with our team. You can keep messaging here."
                  : support.status === "human"
                    ? `${support.assignee || "Our team"} is helping you here. The bot is paused.`
                    : support.status === "resolved"
                      ? "This request is resolved. Send a message if you need more help."
                      : "The bot is back. You can ask for our team again anytime."}
              </span>
            </div>
          )}
          <Conversation className="min-h-0">
            <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-8">
              {active.messages.map((m) => (
                <Message from={m.role} key={m.id}>
                  <div className="flex items-start gap-3">
                    {m.role === "assistant" && (
                      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-primary">
                        {support?.messages.find((item) => item.id === m.id)?.source === "staff" ? (
                          <UserRound className="size-4" />
                        ) : (
                          <Bot className="size-4" />
                        )}
                      </span>
                    )}
                    <MessageContent
                      className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {support?.messages.find((item) => item.id === m.id)?.source === "staff" && (
                        <p className="mb-1 text-xs font-semibold text-primary">
                          {support.messages.find((item) => item.id === m.id)?.author} · Support team
                        </p>
                      )}
                      {m.parts.map((p, i) =>
                        p.type === "text" ? (
                          <MessageResponse key={i}>{p.text}</MessageResponse>
                        ) : null,
                      )}
                      {m.role === "assistant" &&
                        support?.messages.find((item) => item.id === m.id)?.source !== "staff" && (
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            AI answer · from {company.name}'s price list
                          </p>
                        )}
                    </MessageContent>
                    {m.role === "user" && (
                      <UserRound className="mt-1 size-5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </Message>
              ))}
              <ConversationScrollButton />
            </ConversationContent>
          </Conversation>
          <div className="border-t bg-background p-3">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {!support && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={bookingDemo}>
                    Try a booking demo
                  </Button>
                )}
                <Button size="sm" className="shrink-0" onClick={() => setBookingOpen(true)}>
                  Book through chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={
                    !supportReady ||
                    (!!support && ["needs_staff", "human"].includes(support.status))
                  }
                  onClick={() => handoffThread(active)}
                >
                  <UserRound />
                  {support && ["needs_staff", "human"].includes(support.status)
                    ? "Team notified"
                    : "Talk to staff"}
                </Button>
                {(!support || support.status === "bot") &&
                  [
                    "I have 1 sofa and 2 bags",
                    "I need a garage cleanout",
                    "How much will it cost?",
                    "Book a pickup",
                  ].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => send(q)}
                    >
                      {q}
                    </Button>
                  ))}
              </div>
              <PromptInput onSubmit={(m) => send(m.text)}>
                <PromptInputTextarea
                  ref={inputRef}
                  placeholder={
                    support && support.status !== "bot"
                      ? "Message our team…"
                      : "Tell us what you need removed…"
                  }
                />
                <PromptInputFooter>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Languages className="size-3" />
                    AI
                  </span>
                  <PromptInputSubmit />
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Prototype · chat saved in this browser · no live support connected
              </p>
            </div>
          </div>
        </section>
      </div>
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Book through chat</DialogTitle>
            <DialogDescription>
              Your pickup joins the same system as website and staff bookings.
            </DialogDescription>
          </DialogHeader>
          {bookingOpen && (
            <JunkBookingForm
              initial={readChatDraft()}
              chatHistory={active.messages.map((m) => ({
                id: m.id,
                at: new Date().toISOString(),
                channel: "Chat" as const,
                status: "Recorded" as const,
                text: `${m.role === "user" ? "Customer" : "Assistant"}: ${m.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("\n")}`,
              }))}
              onSaved={(j) => {
                setChatDraft({ ...blankJob(), source: "Chat" });
                setBookingOpen(false);
                const confirmation = `Booking **${j.id}** requested for ${dateLabel(j.date)} · ${j.window}. ${isCustom(j) ? "Our team will prepare a quote for your approval." : `Estimated pickup cost **${money(j.estimate)}**.`} Email confirmation simulated. View My bookings for updates.`;
                if (support)
                  updateSupport(support.id, (c) => ({
                    ...c,
                    bookingId: j.id,
                    customer: j.name,
                    contact: j.email,
                    messages: [...c.messages, message("bot", "Smart-Junk", confirmation)],
                  }));

                setThreads((ts) =>
                  ts.map((t) =>
                    t.id === active.id
                      ? {
                          ...t,
                          messages: [
                            ...t.messages,
                            {
                              id: crypto.randomUUID(),
                              role: "assistant",
                              parts: [{ type: "text", text: confirmation }],
                            },
                          ],
                        }
                      : t,
                  ),
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="left" className="w-[min(86vw,22rem)] p-0">
          <SheetHeader className="border-b p-4 pr-12 text-left">
            <SheetTitle>Chat history</SheetTitle>
            <Button
              className="mt-3 w-full"
              onClick={() => {
                setHistoryOpen(false);
                create();
              }}
            >
              <Plus /> New conversation
            </Button>
          </SheetHeader>
          <div className="space-y-1 overflow-y-auto p-2">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to="/assistant/$threadId"
                params={{ threadId: thread.id }}
                onClick={() => setHistoryOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-3",
                  thread.id === active.id ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <p className="truncate text-sm font-semibold">{thread.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{thread.updated}</p>
              </Link>
            ))}
          </div>
          <p className="absolute inset-x-0 bottom-0 border-t bg-background p-4 text-xs text-muted-foreground">
            Saved in this browser
          </p>
        </SheetContent>
      </Sheet>
    </CustomerShell>
  );
}
