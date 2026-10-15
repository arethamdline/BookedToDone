import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { CustomerShell } from "@/components/customer-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { JunkBookingForm } from "@/components/junk-booking-form";
import { readChatDraft } from "@/lib/junk-store";
export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { source?: string } =>
    s["source"] === "Chat" ? { source: "Chat" } : {},
  head: () => ({ meta: [{ title: "Book a pickup — Sample Junk Co." }] }),
  component: Book,
});
function Book() {
  const { source } = Route.useSearch();
  const [initial, setInitial] = useState<import("@/data/mock-data").Job | undefined>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (source === "Chat") setInitial(readChatDraft());
    setReady(true);
  }, [source]);
  return (
    <CustomerShell>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Let's get your junk removed.</h1>
        <p className="mb-7 text-muted-foreground">
          Tell us what needs to go, and we'll help arrange a pickup.
        </p>
        {ready && <JunkBookingForm key={source ?? "Website"} {...(initial ? { initial } : {})} />}
      </div>
    </CustomerShell>
  );
}
