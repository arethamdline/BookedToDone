import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/staff-shell";
import { SupportInbox } from "@/components/support-inbox";
export const Route = createFileRoute("/staff_/inbox")({
  head: () => ({ meta: [{ title: "Support inbox — Smart-Junk" }] }),
  component: () => (
    <StaffShell page="Inbox">
      <SupportInbox />
    </StaffShell>
  ),
});
