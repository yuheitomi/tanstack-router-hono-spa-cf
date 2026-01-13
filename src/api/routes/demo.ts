import { Hono } from "hono";

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
    return c.json({
      todos: [
        { id: 1, name: "Buy groceries" },
        { id: 2, name: "Buy books" },
        { id: 3, name: "Buy movies" },
      ],
    });
  });

export default route;
