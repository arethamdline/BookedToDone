import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { answerCompanyQuestion, company } from "@/data/company";
import { readData } from "@/lib/junk-store";
import { recordCustomerAssistantMessage, useSupport } from "@/lib/support-store";

type ChatMessage = { id: string; role: "customer" | "assistant"; text: string };
type CustomerAssistantContextValue = {
  ask: (question: string) => void;
  openChat: () => void;
  closeChat: () => void;
  open: boolean;
  messages: ChatMessage[];
};

const threadKey = "smart-junk-customer-assistant-thread";
const proactiveKey = "smart-junk-customer-assistant-proactive";
const starters = ["Do you take a hot tub?", "How much for a garage?", "Can you come Saturday?"];
const welcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi there. What are you looking to clear out? I can help with prices, items, and pickup areas.",
};
const AssistantContext = createContext<CustomerAssistantContextValue | null>(null);

function useCustomerAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error("CustomerAssistant components must be inside their provider.");
  return context;
}

export function CustomerAssistantProvider({ children }: { children: ReactNode }) {
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [open, setOpen] = useState(false);
  const [proactive, setProactive] = useState(false);
  const { conversations, ready } = useSupport();
  const conversation = conversations.find((item) => item.threadId === threadId);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(threadKey);
      const id = saved || `chat-${crypto.randomUUID()}`;
      if (!saved) localStorage.setItem(threadKey, id);
      setThreadId(id);
    } catch {
      setThreadId(`chat-${crypto.randomUUID()}`);
    }
  }, []);

  useEffect(() => {
    if (!ready || !conversation) return;
    const savedMessages = conversation.messages
      .filter((item) => ["customer", "bot", "staff"].includes(item.source))
      .map((item) => ({
        id: item.id,
        role: item.source === "customer" ? ("customer" as const) : ("assistant" as const),
        text: item.text,
      }));
    setMessages(savedMessages.length ? savedMessages : [welcome]);
  }, [conversation, ready]);

  useEffect(() => {
    try {
      if (localStorage.getItem(proactiveKey)) return;
    } catch {
      // Continue with the first-visit prompt when storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      setProactive(true);
      try {
        localStorage.setItem(proactiveKey, "shown");
      } catch {
        // The prompt remains available for this visit.
      }
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  const markPromptSeen = () => {
    setProactive(false);
    try {
      localStorage.setItem(proactiveKey, "shown");
    } catch {
      // The widget remains usable without persistence.
    }
  };

  const openChat = () => {
    markPromptSeen();
    setOpen(true);
  };

  const ask = (question: string) => {
    const text = question.trim();
    if (!text) return;
    let id = threadId;
    if (!id) {
      id = `chat-${crypto.randomUUID()}`;
      setThreadId(id);
      try {
        localStorage.setItem(threadKey, id);
      } catch {
        // The support lead still works for this visit.
      }
    }
    let pricing = company.pricing;
    try {
      pricing = readData().pricing;
    } catch {
      // Fall back to the company's shared price list.
    }
    const answer =
      answerCompanyQuestion(text, pricing) ??
      "I can help with accepted items, prices, pickup hours, and ZIP coverage. What are you hauling?";
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "customer", text },
      { id: crypto.randomUUID(), role: "assistant", text: answer },
    ]);
    openChat();
    recordCustomerAssistantMessage(id, text, answer);
  };

  return (
    <AssistantContext.Provider
      value={{ ask, openChat, closeChat: () => setOpen(false), open, messages }}
    >
      {children}
      <CustomerAssistantWidget proactive={proactive} onDismissProactive={markPromptSeen} />
    </AssistantContext.Provider>
  );
}

export function CustomerAssistantCard() {
  const { ask } = useCustomerAssistant();
  return (
    <section className="rounded-lg border border-white/15 bg-background p-4 text-foreground shadow-2xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          <Bot className="size-5 text-primary" /> Ask BookedToDone Demo
        </span>
        <span className="rounded bg-accent-strong px-2 py-1 text-[10px] font-bold text-foreground">
          AI
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Questions welcome, even after hours.</p>
      <div className="mt-4 grid gap-2">
        {starters.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => ask(question)}
            className="min-h-11 rounded-md border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {question}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Tap a question to start a chat.</p>
    </section>
  );
}

function CustomerAssistantWidget({
  proactive,
  onDismissProactive,
}: {
  proactive: boolean;
  onDismissProactive: () => void;
}) {
  const { ask, openChat, closeChat, open, messages } = useCustomerAssistant();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(draft);
    setDraft("");
  };

  return (
    <>
      {open && (
        <section
          aria-label="Customer AI chat"
          className="fixed bottom-24 right-3 z-[70] flex max-h-[min(72dvh,36rem)] flex-col overflow-hidden rounded-lg border bg-background shadow-2xl lg:right-6"
          style={{ width: "min(24rem, calc(100vw - 1.5rem))" }}
        >
          <header className="flex items-center justify-between gap-3 bg-foreground px-4 py-3 text-background">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-background/10">
                <Bot className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{company.name}</p>
                <p className="text-xs text-background/70">AI assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </button>
          </header>
          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${message.role === "customer" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.role === "assistant" && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    AI answer · from {company.name}'s price list
                  </p>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <Link
            to="/book"
            search={{ source: "Chat" }}
            onClick={closeChat}
            className="mx-3 mb-3 flex min-h-11 items-center justify-center rounded-md bg-accent px-3 text-center text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/80"
          >
            Want a price? Send me a photo <span className="ml-1">→</span>
          </Link>
          <form onSubmit={submit} className="flex items-center gap-2 border-t p-3">
            <label className="sr-only" htmlFor="customer-assistant-message">
              Ask a question
            </label>
            <input
              id="customer-assistant-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about items, price, or ZIP"
              className="h-11 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      )}
      {proactive && !open && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-36 right-3 z-[70] flex max-w-[calc(100vw-1.5rem)] items-start gap-2 rounded-lg border bg-background p-3 text-sm shadow-xl lg:bottom-24 lg:right-6"
        >
          <p>It's 9:14 pm. We still answer. Ask anything.</p>
          <button
            type="button"
            onClick={onDismissProactive}
            aria-label="Dismiss message"
            className="grid size-6 shrink-0 place-items-center rounded hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={open ? closeChat : openChat}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        className="fixed bottom-20 right-3 z-[70] grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:bottom-6 lg:right-6"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}
