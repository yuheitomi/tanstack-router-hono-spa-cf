import { createFileRoute } from "@tanstack/react-router";

import { honoClient } from "@/web/lib/hono";

export const Route = createFileRoute("/test")({
  loader: async () => {
    const response = await honoClient.api.demo.health.$get().then((res) => res.json());
    return response;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <div>Hello "/test"! {JSON.stringify(data)}</div>;
}
