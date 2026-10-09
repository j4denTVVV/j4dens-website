import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/streams/")({
  beforeLoad: () => {
    throw redirect({ to: "/live", search: { tab: "stream" } });
  },
});
