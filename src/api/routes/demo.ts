import { Hono } from "hono";

type Todo = { id: number; name: string };

// Mock store. Module-level state lives per Worker isolate, so it resets on
// redeploy and is not shared across isolates - fine for a template demo.
const todos: Todo[] = [
  { id: 1, name: "Buy groceries" },
  { id: 2, name: "Buy books" },
  { id: 3, name: "Buy movies" },
];
let nextId = todos.length + 1;

const route = new Hono<{ Bindings: Env }>()
  .get("/health", (c) => {
    const message = c.env.TEST_VAR;
    return c.json({ status: "ok", timestamp: new Date().toISOString(), message });
  })
  .get("/test", (c) => {
    const message = c.env.TEST_VAR;
    return c.json({ name: "Cloudflare", message });
  })
  .get("/todos", (c) => {
    return c.json({ todos });
  })
  .post("/todos", async (c) => {
    const { name } = await c.req.json<{ name?: string }>();

    if (typeof name !== "string" || name.trim() === "") {
      return c.json({ error: "name is required" }, 400);
    }

    const todo: Todo = { id: nextId++, name: name.trim() };
    todos.push(todo);
    return c.json({ todo }, 201);
  });

export default route;
