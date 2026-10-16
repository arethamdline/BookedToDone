import { communication, readData, updateJob } from "./junk-store";
import { useEffect, useState } from "react";
import { z } from "zod";
import { createSupportConversations } from "@/data/mock-data";
import { company } from "@/data/company";
import {
  supportConversationSchema,
  type SupportConversation,
  type SupportMessage,
  type SupportStatus,
} from "./support-types";

const KEY = "smart-junk-support-v1";
const EVENT = "smart-junk-support-change";
const schema = z.array(supportConversationSchema);
let lastError = "";
function read(): SupportConversation[] {
  const saved = localStorage.getItem(KEY);
  let items = saved ? schema.parse(JSON.parse(saved)) : createSupportConversations();
  if (!localStorage.getItem("smart-junk-support-v3-demo")) {
    const demos = createSupportConversations().filter((c) =>
      ["web-james", "whatsapp-demo", "sms-demo", "social-demo"].includes(c.id),
    );
    items = [...demos.filter((demo) => !items.some((item) => item.id === demo.id)), ...items];
    localStorage.setItem(KEY, JSON.stringify(items));
    localStorage.setItem("smart-junk-support-v3-demo", "1");
  }
  if (!saved) localStorage.setItem(KEY, JSON.stringify(items));
  return items;
}
function mutate(change: (items: SupportConversation[]) => SupportConversation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(change(read())));
    lastError = "";
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    lastError = "Could not save the demo. Check that browser storage is available, then reload.";
    window.dispatchEvent(new Event(EVENT));
    return false;
  }
}
export function useSupport() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        setConversations(read());
        setError(lastError);
      } catch {
        setError(
          "The saved inbox could not be read. Browser storage may be unavailable or damaged.",
        );
      }
      setReady(true);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) sync();
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return { conversations, error, ready };
}
export function message(
  source: SupportMessage["source"],
  author: string,
  text: string,
): SupportMessage {
  return { id: crypto.randomUUID(), source, author, text, at: Date.now() };
}
export function updateSupport(
  id: string,
  change: (item: SupportConversation) => SupportConversation,
) {
  return mutate((items) => items.map((item) => (item.id === id ? change(item) : item)));
}
export function setSupportStatus(id: string, status: SupportStatus, assignee?: string) {
  return updateSupport(id, (c) => ({
    ...c,
    status,
    assignee: assignee ?? c.assignee,
    messages: [
      ...c.messages,
      message(
        "system",
        "System",
        status === "bot"
          ? "Sarah Carter returned this chat to the bot."
          : status === "resolved"
            ? "Sarah Carter resolved this conversation."
            : status === "human"
              ? "Sarah Carter took over this conversation."
              : "Conversation reopened for staff.",
      ),
    ],
  }));
}
export function handoffThread(thread: {
  id: string;
  title: string;
  messages: { id: string; role: string; parts: { type: string; text?: string }[] }[];
}) {
  return mutate((items) => {
    const existing = items.find((c) => c.threadId === thread.id);
    if (existing)
      return items.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              status: "needs_staff",
              assignee: "",
              unread: true,
              messages: [
                ...c.messages,
                message("system", "System", "Customer requested staff. Bot paused."),
              ],
            }
          : c,
      );
    const history: SupportMessage[] = thread.messages.map((m) => ({
      id: m.id,
      source: m.role === "user" ? "customer" : "bot",
      author: m.role === "user" ? "Website visitor" : `${company.name} AI`,
      text: m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("\n"),
      at: Date.now(),
    }));
    const lastQuestion = [...history].reverse().find((m) => m.source === "customer")?.text;
    return [
      {
        id: `web-${thread.id}`,
        threadId: thread.id,
        customer: "Website visitor",
        contact: "Guest · this browser",
        channel: "website",
        status: "needs_staff",
        assignee: "",
        subject: lastQuestion?.slice(0, 70) || thread.title,
        summary: lastQuestion
          ? `Customer requested a person. Latest question: ${lastQuestion}`
          : "Customer requested help from the junk removal team.",
        lastCustomerAt: Date.now(),
        unread: true,
        messages: [
          ...history,
          message("system", "System", "Customer requested staff. Bot paused."),
        ],
      },
      ...items,
    ];
  });
}
export function sendWebsiteMessage(id: string, text: string, botReply: string) {
  return updateSupport(id, (c) => ({
    ...c,
    unread: c.status !== "bot",
    lastCustomerAt: Date.now(),
    status: c.status === "resolved" ? "needs_staff" : c.status,
    messages: [
      ...c.messages,
      message("customer", c.customer, text),
      ...(c.status === "bot" ? [message("bot", `${company.name} AI`, botReply)] : []),
    ],
  }));
}
export function recordCustomerAssistantMessage(threadId: string, text: string, answer: string) {
  const customerMessage = message("customer", "Website visitor", text);
  const assistantMessage = message("bot", "Sample Junk Co. AI", answer);
  return mutate((items) => {
    const existing = items.find((conversation) => conversation.threadId === threadId);
    if (existing)
      return items.map((conversation) =>
        conversation.id === existing.id
          ? {
              ...conversation,
              source: "Chat" as const,
              status: conversation.status === "resolved" ? "needs_staff" : conversation.status,
              unread: true,
              subject: conversation.subject || text.slice(0, 70),
              summary: `Customer asked the AI assistant: ${text}`,
              lastCustomerAt: Date.now(),
              messages: [...conversation.messages, customerMessage, assistantMessage],
            }
          : conversation,
      );

    return [
      {
        id: `web-${threadId}`,
        threadId,
        source: "Chat" as const,
        customer: "Website visitor",
        contact: "Guest · this browser",
        channel: "website" as const,
        status: "needs_staff" as const,
        assignee: "",
        subject: text.slice(0, 70) || "Customer AI assistant question",
        summary: `Customer asked the AI assistant: ${text}`,
        lastCustomerAt: Date.now(),
        unread: true,
        messages: [customerMessage, assistantMessage],
      },
      ...items,
    ];
  });
}
export function isWindowOpen(c: SupportConversation, now = Date.now()) {
  return true;
}
export function sendStaffMessage(id: string, text: string, note = false, template = false) {
  if (!text.trim()) return false;
  let permitted = false;
  const saved = updateSupport(id, (c) => {
    if (!note && (c.status === "resolved" || c.status === "bot" || (!template && !isWindowOpen(c))))
      return c;
    permitted = true;
    return {
      ...c,
      ...(note
        ? {}
        : { status: "human" as const, assignee: c.assignee || "Sarah Carter", unread: false }),
      messages: [
        ...c.messages,
        {
          ...message(note ? "note" : "staff", "Sarah Carter", text.trim()),
          ...(note ? {} : { delivery: "simulated" as const }),
        },
      ],
    };
  });
  if (saved && permitted) {
    const conversation = read().find((c) => c.id === id);
    if (conversation?.bookingId && readData().jobs.some((j) => j.id === conversation.bookingId))
      updateJob(conversation.bookingId, (j) => ({
        ...j,
        communications: [
          ...j.communications,
          communication(
            note ? "Note" : conversation.channel === "email" ? "Email" : "Chat",
            text.trim(),
          ),
        ],
      }));
  }
  return saved && permitted;
}
