import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("склеивает непустые имена", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });
});
