import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { APP_NAME } from "@/shared/config";
import { useTitle } from "./useTitle";

describe("useTitle", () => {
  it("ставит заголовок вкладки с суффиксом", () => {
    const { rerender } = renderHook(({ t }: { t?: string }) => useTitle(t), {
      initialProps: { t: "Раздел" } as { t?: string },
    });
    expect(document.title).toBe(`Раздел · ${APP_NAME}`);
    rerender({ t: undefined });
    expect(document.title).toBe(APP_NAME);
  });
});
