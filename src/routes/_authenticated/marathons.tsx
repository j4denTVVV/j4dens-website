import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/marathons")({
  beforeLoad: () => {
    throw redirect({ to: "/live", search: { tab: "marathon" } });
  },
});
