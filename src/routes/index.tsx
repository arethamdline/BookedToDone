import { Sofa, Refrigerator, Monitor, Package, Briefcase, Hammer } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  Box,
  CalendarClock,
  ChevronRight,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CustomerShell } from "@/components/customer-shell";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

import { services } from "@/data/mock-data";
const plans = services.map((name, i) => ({
  id: String(i),
  name,
  note:
    [
      "Sofas, mattresses, tables and more.",
      "Refrigerators, washers and dryers.",
      "TVs, monitors and electronics.",
      "Bags, clutter and everyday unwanted items.",
      "Desks, chairs and workspace cleanouts.",
      "Non-hazardous debris in manageable loads.",
    ][i] ?? "",
}));
import { useT } from "@/lib/i18n";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart-Junk — Junk Removal, Smarter Operations." },
      { name: "description", content: "Book junk removal and manage every pickup in one place." },
      { property: "og:title", content: "Smart-Junk — Junk removal made simple" },
      {
        property: "og:description",
        content: "Book junk removal and manage every pickup in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  const t = useT();
  return (
    <CustomerShell>
      <section className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-8 lg:py-16 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-sm">
              <ShieldCheck className="size-4" />
              {t("Less clutter. More possibilities.")}
            </div>
            <h1 className="font-display text-[2rem] font-extrabold leading-tight sm:text-5xl md:text-6xl">
              {t("Make space for what’s next.")}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">
              {t(
                "Junk Removal, Smarter Operations. From one old sofa to a full office cleanout, make your next pickup simple.",
              )}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="storage" size="xl" className="w-full sm:w-auto">
                <Link to="/book">
                  <Truck />
                  {t("Book a pickup")}
                  <span className="hidden font-medium opacity-80 md:inline">
                    · {t("Get a clear estimate in minutes")}
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="w-full rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              >
                <Link to="/assistant">
                  {t("Ask the assistant")} <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <figure className="relative overflow-hidden rounded-2xl border border-white/20 shadow-xl">
            <img
              src="/junk-removal-hero-v2.png"
              alt="Junk removal crew carrying a sofa toward a pickup truck"
              className="aspect-[3/2] w-full object-cover"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white">
              You point. We lift. You get your space back.
            </figcaption>
          </figure>
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10 lg:px-8">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-accent-strong-ink">
                {t("WE TAKE CARE OF THE HEAVY LIFTING")}
              </p>
              <h2 className="font-display text-2xl font-bold">{t("What can we remove?")}</h2>
            </div>
            <Link to="/book" className="hidden text-sm font-semibold text-primary sm:block">
              {t("Get an estimate →")}
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {plans.map((p, i) => (
              <Link to="/book" key={p.id} className="block">
                <Card className="h-full rounded-lg shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex gap-4 p-4 sm:block sm:p-5">
                    <div className="grid size-11 shrink-0 place-items-center rounded-md bg-accent text-primary sm:mb-5">
                      {i === 0 ? (
                        <Sofa />
                      ) : i === 1 ? (
                        <Refrigerator />
                      ) : i === 2 ? (
                        <Monitor />
                      ) : i === 3 ? (
                        <Package />
                      ) : i === 4 ? (
                        <Briefcase />
                      ) : (
                        <Hammer />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold">{t(p.name)}</h3>
                          <p className="text-sm text-muted-foreground">{t(p.note)}</p>
                        </div>
                        {i === 0 && <StatusBadge>{t("Popular")}</StatusBadge>}
                      </div>
                      <div className="mt-3 flex items-end justify-between sm:mt-5">
                        <p className="text-sm font-semibold text-primary">Get a clear estimate</p>
                        <ChevronRight className="text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold tracking-wide text-accent-strong-ink">
              {t("HOW IT WORKS")}
            </p>
            <h2 className="font-display text-2xl font-bold">{t("3 easy steps")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "1. Tell us what goes",
                "Add your items, quantities, access details, and pickup address.",
              ],
              [
                "2. See your estimate",
                "See your item estimate or request a custom quote, then choose a pickup window.",
              ],
              [
                "3. We handle the pickup",
                "Staff confirms your crew. Agree the final price on site before removal.",
              ],
            ].map(([title, text]) => (
              <Card key={title}>
                <CardContent className="p-5">
                  <h3 className="font-display font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="rounded-lg bg-accent p-6">
          <h2 className="font-display text-2xl font-bold">Clear pricing. Less hassle.</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              [
                "Upfront estimates",
                "Review item prices and any configured extra charges before requesting a pickup.",
              ],
              [
                "We do the lifting",
                "Share stairs, elevator, and parking details so the crew comes prepared.",
              ],
              [
                "Responsible sorting",
                "Ask staff about donation and recycling options for eligible items.",
              ],
            ].map(([title, text]) => (
              <div key={title}>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Frequently asked questions</h2>
          {[
            [
              "How is the estimate calculated?",
              "Standard pickups use item prices with a minimum pickup charge. Large or unusual cleanups receive a staff quote. Final pricing is agreed after an on-site inspection.",
            ],
            [
              "What can’t you take?",
              "We do not accept hazardous materials, chemicals, asbestos, weapons, or medical waste. Ask our team about uncertain items.",
            ],
            [
              "Is my time window guaranteed?",
              "Your selected window is a request. Staff reviews capacity and confirms your pickup.",
            ],
            [
              "Can I book by phone or email?",
              "Yes. Staff enters phone and email bookings into the same system, so scheduling stays consistent.",
            ],
            [
              "Will I receive a confirmation?",
              "Email is the default for confirmations and invoices. SMS is used for reminders and arrival updates. In this prototype all messages are simulated.",
            ],
          ].map(([question, answer]) => (
            <details className="border-b py-4" key={question}>
              <summary className="cursor-pointer font-semibold">{question}</summary>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{answer}</p>
            </details>
          ))}
        </section>
        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="overflow-hidden rounded-lg border-0 bg-foreground text-background shadow-none">
            <CardContent className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-4 grid size-11 place-items-center rounded-md bg-background/10">
                  <CalendarClock />
                </div>
                <h2 className="font-display text-2xl font-bold">{t("Already booked a pickup?")}</h2>
                <p className="mt-2 text-sm text-background/70">
                  {t("See your pickup details, estimate, and latest status in one place.")}
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full bg-background text-foreground hover:bg-background/90 md:w-auto"
              >
                <Link to="/portal">
                  {t("View my bookings")} <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-lg bg-accent shadow-none">
            <CardContent className="p-5 sm:p-6">
              <Truck className="mb-4 text-accent-strong-ink" />
              <h2 className="font-display text-xl font-bold">
                {t("Your local Austin removal team")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Serving Austin metro for this demo. Clear estimates, convenient windows, and careful loading.",
                )}
              </p>
            </CardContent>
          </Card>
        </section>
        <footer className="flex flex-col gap-4 border-t py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p>{t("Prototype experience · No real payments are processed")}</p>
        </footer>
      </div>
    </CustomerShell>
  );
}
