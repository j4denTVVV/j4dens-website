import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/irl")({
  beforeLoad: () => {
    throw redirect({ to: "/live", search: { tab: "irl" } });
  },
});
