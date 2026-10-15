import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CalendarClock, CircleDollarSign } from "lucide-react";
import { CustomerShell } from "@/components/customer-shell";
import { CustomerAssistantCard } from "@/components/customer-assistant";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { prospect?: string } => {
    const prospect =
      typeof search["prospect"] === "string" ? search["prospect"].trim().slice(0, 40) : "";
    return prospect ? { prospect } : {};
  },
  head: () => ({
    meta: [
      { title: "Booked to Done — AI booking and operations demo" },
      { name: "description", content: "AI that answers, books and runs your jobs." },
      { property: "og:title", content: "Booked to Done" },
      {
        property: "og:description",
        content: "AI that answers, books and runs your jobs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entry,
});
function Entry() {
  const { prospect } = Route.useSearch();

  return (
    <main className="grid min-h-[calc(100dvh-3.5rem)] place-items-center bg-accent/25 px-4 py-5 sm:px-8">
      <div className="grid w-full max-w-6xl items-center gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-14 lg:gap-y-6">
        <section className="lg:col-start-1 lg:row-start-1">
          <Brand />
          <p className="mt-4 text-sm font-semibold text-primary sm:text-base">
            AI that answers, books and runs your jobs.
          </p>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            You talk. We listen. We build it around you.
          </p>
        </section>
        <figure className="overflow-hidden rounded-lg border bg-foreground shadow-lg lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <video
            controls
            playsInline
            preload="none"
            poster="/junk-removal-hero-v2.png"
            aria-label="Booked to Done demo video"
            className="aspect-video w-full object-cover"
          >
            <source src="/video/demo-v3.mp4" type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </figure>
        <section className="lg:col-start-1 lg:row-start-2">
          <h1 className="max-w-xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
            {prospect
              ? `${prospect}, here's your booking system, working.`
              : "Try it as your customer. Watch your office update."}
          </h1>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/customer">
                Start the demo <ArrowRight />
              </Link>
            </Button>
            <Link
              to="/staff"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Skip to the Staff system <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function Home() {
  const serviceCards = [
    {
      title: "Household junk",
      description: "Furniture, appliances, boxes, and everyday clutter.",
      image: "/images/household-junk.webp",
      alt: "Assorted household furniture ready to be cleared",
    },
    {
      title: "Garage and yard cleanouts",
      description: "Old gear, branches, and the piles that keep growing.",
      image: "/images/garage-yard-junk.webp",
      alt: "Wheelbarrow beside a pile of branches and yard debris",
    },
    {
      title: "Construction debris",
      description: "Manageable loads of non-hazardous renovation debris.",
      image: "/images/construction-debris.webp",
      alt: "Pile of concrete and construction rubble",
    },
  ];
  const steps = [
    { icon: Camera, title: "Snap a photo", detail: "Show us what needs to go." },
    { icon: CircleDollarSign, title: "See your price", detail: "Get a clear estimate." },
    { icon: CalendarClock, title: "Pick your time", detail: "Choose a pickup window." },
  ];

  return (
    <CustomerShell>
      <main>
        <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
          <img
            src="/junk-removal-hero-v2.png"
            alt="Crew carrying a sofa into a junk removal truck"
            className="absolute inset-0 size-full object-cover object-center"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
          <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] lg:gap-14 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase text-lime-300 sm:text-sm">
                BookedToDone Demo · Austin, TX
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Junk gone.
                <br />
                Booked in 60 seconds.
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">
                Snap a photo, get a price, pick a time.
              </p>
              <Button
                asChild
                size="xl"
                className="mt-6 w-full bg-orange-500 text-white hover:bg-orange-600 sm:w-auto"
              >
                <Link to="/book">
                  Get a photo estimate <ArrowRight />
                </Link>
              </Button>
            </div>
            <CustomerAssistantCard />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-accent-strong-ink">What we haul</p>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                Room to breathe starts here.
              </h2>
            </div>
            <Link
              to="/book"
              className="hidden items-center gap-2 text-sm font-semibold text-primary sm:flex"
            >
              All jobs start here <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <Link
                key={service.title}
                to="/book"
                className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img
                  src={service.image}
                  alt={service.alt}
                  loading="lazy"
                  decoding="async"
                  width="760"
                  height="500"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="flex min-h-36 flex-col p-4 sm:p-5">
                  <h3 className="font-display text-lg font-bold">{service.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{service.description}</p>
                  <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">
                    Get a photo estimate{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12">
            <h2 className="font-display text-2xl font-bold">How it works</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {steps.map(({ icon: Icon, title, detail }, index) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">0{index + 1}</p>
                    <h3 className="mt-1 font-display font-bold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-sm text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between">
          <Brand />
          <p>
            Sample site built by Booked to Done. Your version uses your prices, trucks and service
            area.
          </p>
        </footer>
      </main>
    </CustomerShell>
  );
}
