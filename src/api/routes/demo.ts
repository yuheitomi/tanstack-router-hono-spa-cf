import { Hono } from "hono";

const route = new Hono()
  .get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  })
  .get("/test", (c) => {
    return c.json({ name: "Cloudflare", message: "Hello from Hono!" });
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
