import { HttpResponse, http } from "msw";
import type { SystemInfo } from "@/shared/api";
import { API, latency } from "../http";

export const systemHandlers = [
  http.get(`${API}/system/info`, async () => {
    await latency();
    return HttpResponse.json<SystemInfo>({ service: "astronaut-mock", version: "demo" });
  }),
];
