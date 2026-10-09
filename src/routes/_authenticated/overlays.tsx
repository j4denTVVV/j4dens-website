import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/overlays")({
  beforeLoad: () => {
    throw redirect({ to: "/assets", search: { tab: "overlay" } });
  },
});
