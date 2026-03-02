import { createLazyFileRoute } from "@tanstack/react-router";

import { Booking } from "@/features/booking";

export const Route = createLazyFileRoute("/demo/schedule")({
  component: SchedulePage,
});

function SchedulePage() {
  return <Booking />;
}
