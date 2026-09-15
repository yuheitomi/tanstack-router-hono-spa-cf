import { Suspense } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { honoClient } from "@/web/lib/hono";

async function getTodos() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return honoClient.api.demo.todos.$get().then((res) => res.json());
}

export const Route = createFileRoute("/demo/tanstack-query")({
  context: () => ({
    todoQueryOptions: queryOptions({
      queryKey: ["todos"],
      queryFn: getTodos,
    }),
  }),
  loader: ({ context }) => {
    void context.queryClient.query(context.todoQueryOptions).catch(() => undefined);
  },
  component: TanStackQueryDemo,
});

function TanStackQueryDemo() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 95% 5%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)",
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border-8 border-black/10 bg-black/50 p-8 shadow-xl backdrop-blur-md">
        <h1 className="mb-4 text-2xl">TanStack Query Simple Promise Handling</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <TodoList />
        </Suspense>
      </div>
    </div>
  );
}

function TodoList() {
  const { todoQueryOptions } = Route.useRouteContext();
  const { data } = useSuspenseQuery(todoQueryOptions);

  return (
    <ul className="mb-4 space-y-2">
      {data.todos.map((todo) => (
        <li
          key={todo.id}
          className="rounded-lg border border-white/20 bg-white/10 p-3 shadow-md backdrop-blur-sm"
        >
          <span className="text-lg text-white">{todo.name}</span>
        </li>
      ))}
    </ul>
  );
}
