import { createFileRoute } from "@tanstack/react-router";
import { LandingForm } from "@/components/LandingForm";

export const Route = createFileRoute("/admin/new")({
  component: AdminNew,
});

function AdminNew() {
  return <LandingForm mode="new" />;
}
