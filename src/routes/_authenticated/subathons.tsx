import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/subathons")({
  beforeLoad: () => {
    throw redirect({ to: "/live", search: { tab: "subathon" } });
  },
});
