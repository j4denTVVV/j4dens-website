import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/challenges")({
  beforeLoad: () => {
    throw redirect({ to: "/live", search: { tab: "challenge" } });
  },
});
