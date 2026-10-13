import { z } from "zod";

export const supportMessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  at: z.number(),
  source: z.enum(["customer", "bot", "staff", "phone", "note", "system"]),
  author: z.string(),
  delivery: z.enum(["simulated", "received"]).optional(),
});
export const supportConversationSchema = z.object({
  id: z.string(),
  customer: z.string(),
  contact: z.string(),
  channel: z.enum(["email", "website"]),
  status: z.enum(["needs_staff", "human", "resolved", "bot"]),
  assignee: z.string(),
  subject: z.string(),
  summary: z.string(),
  bookingId: z.string().optional(),
  threadId: z.string().optional(),
  lastCustomerAt: z.number(),
  unread: z.boolean(),
  messages: z.array(supportMessageSchema),
});
export type SupportMessage = z.infer<typeof supportMessageSchema>;
export type SupportConversation = z.infer<typeof supportConversationSchema>;
export type SupportStatus = SupportConversation["status"];
export const statusLabels: Record<SupportStatus, string> = {
  needs_staff: "Needs staff",
  human: "Staff handling",
  resolved: "Resolved",
  bot: "Bot handling",
};
