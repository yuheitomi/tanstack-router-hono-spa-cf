import { Suspense } from "react";
import { useFormStatus } from "react-dom";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { honoClient } from "@/web/lib/hono";

const todosQueryKey = ["todos"];

async function getTodos() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return honoClient.api.demo.todos.$get().then((res) => res.json());
}

export const Route = createFileRoute("/demo/tanstack-query")({
  context: () => ({
    todoQueryOptions: queryOptions({
      queryKey: todosQueryKey,
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
        <AddTodoForm />
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

function AddTodoForm() {
  const queryClient = useQueryClient();

  const addTodo = useMutation({
    mutationFn: async (name: string) => {
      const res = await honoClient.api.demo.todos.$post({ json: { name } });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosQueryKey }),
  });

  return (
    <form
      action={async (formData) => {
        const name = formData.get("name");
        if (typeof name !== "string" || name.trim() === "") return;
        // mutateAsync rejects on failure; an unhandled rejection inside a form
        // action reaches the nearest error boundary, so keep it here instead.
        await addTodo.mutateAsync(name).catch(() => undefined);
      }}
      className="flex gap-2"
    >
      <input
        name="name"
        placeholder="Add a todo"
        className="flex-1 rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder:text-white/50 backdrop-blur-sm"
      />
      <SubmitButton />
      {addTodo.isError && (
        <p role="alert" className="basis-full text-sm text-red-300">
          {addTodo.error.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-white/20 bg-white/20 px-4 py-3 text-white shadow-md backdrop-blur-sm disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add"}
    </button>
  );
}
