import { useRouter, createLazyFileRoute } from "@tanstack/react-router";

import { Home } from "@/features/home";
import { landingPagePaths } from "@/types/navigation";

export const Route = createLazyFileRoute("/demo/")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const handleBookClick = () =>
    router.navigate({ to: landingPagePaths.booking as never });
  return <Home onBookClick={handleBookClick} />;
}
