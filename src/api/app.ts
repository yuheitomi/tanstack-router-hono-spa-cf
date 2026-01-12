import { Hono } from "hono";

import demoRoute from "./routes/demo";

const api = new Hono().basePath("/api").route("/demo", demoRoute);

export default api;
