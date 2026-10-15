import { createFileRoute } from "@tanstack/react-router";

import { SampleCompanyHome } from "@/components/sample-company-home";
import { validateProspectSearch } from "@/lib/prospect";

export const Route = createFileRoute("/customer")({
  validateSearch: validateProspectSearch,
  head: () => ({
    meta: [
      { title: "Customer system — Booked to Done demo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SampleCompanyHome,
});
