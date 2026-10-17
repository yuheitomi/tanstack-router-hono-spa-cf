import { hc } from "hono/client";
import type { ClientRequestOptions } from "hono/client";

import type { AppType } from "@/api/types";

export function createHonoClient(baseUrl: string, options?: ClientRequestOptions) {
  return hc<AppType>(baseUrl, options);
}

export type HonoClient = ReturnType<typeof createHonoClient>;
