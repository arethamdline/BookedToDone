import { createFileRoute } from "@tanstack/react-router";
import { Home } from "./index";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Customer system — Booked to Done demo" }] }),
  component: Home,
});
