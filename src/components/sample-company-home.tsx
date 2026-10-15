import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, CalendarClock, CircleDollarSign } from "lucide-react";

import { CustomerShell } from "@/components/customer-shell";
import { CustomerAssistantCard } from "@/components/customer-assistant";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useProspect } from "@/lib/prospect";

/**
 * The sample junk company's own site, as a customer would see it.
 *
 * This is deliberately NOT the page a visitor lands on — it lives behind
 * `/demo` and inside the device frames on the company site.
 */
export function SampleCompanyHome() {
  const prospect = useProspect();
  const companyName = prospect ?? "Sample Junk Co.";

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
              <p className="text-xs font-bold uppercase text-lime-300 sm:text-sm">{companyName}</p>
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
                <Link to="/book" data-tour="photo-cta">
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
