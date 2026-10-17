import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/call-api")({
  loader: async ({ context }) => {
    const response = await context.hono.api.demo.health.$get().then((res) => res.json());
    return response;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <div>Hello "/test"! {JSON.stringify(data)}</div>;
}
