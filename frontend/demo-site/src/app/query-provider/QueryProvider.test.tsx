import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import { createQueryClient } from "./QueryProvider";

describe("createQueryClient", () => {
  const retry = createQueryClient().getDefaultOptions().queries!.retry as (
    n: number,
    e: unknown,
  ) => boolean;

  it("повторяет сбои сети и сервера, но не ответы 4xx", () => {
    expect(retry(0, new ApiError(0, "network", "x"))).toBe(true);
    expect(retry(0, new ApiError(503, "service_unavailable", "x"))).toBe(true);
    expect(retry(0, new TypeError("boom"))).toBe(true);
    expect(retry(0, new ApiError(404, "not_found", "x"))).toBe(false);
  });

  it("не больше двух повторов", () => {
    expect(retry(1, new ApiError(503, "x", "x"))).toBe(true);
    expect(retry(2, new ApiError(503, "x", "x"))).toBe(false);
  });
});
