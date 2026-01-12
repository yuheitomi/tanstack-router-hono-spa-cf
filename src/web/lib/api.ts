import { hc } from "hono/client";

import type { AppType } from "@/api/types";

export const honoClient = hc<AppType>("/");
