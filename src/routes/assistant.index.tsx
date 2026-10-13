import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/assistant/")({
  head: () => ({
    meta: [
      { title: "Ask Bot — Smart-Junk" },
      { name: "description", content: "Junk removal booking help." },
      { property: "og:title", content: "Ask Bot — Smart-Junk" },
      { property: "og:description", content: "Help with junk removal, estimates, and pickup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <Navigate to="/assistant/$threadId" params={{ threadId: "junk-prices" }} replace />
  ),
});
