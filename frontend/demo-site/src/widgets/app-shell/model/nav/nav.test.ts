import { describe, expect, it } from "vitest";
import { activeNavId } from "./nav";

describe("activeNavId", () => {
  it("корень — пункт «Главная»", () => {
    expect(activeNavId("/")).toBe("home");
  });

  it("неизвестный адрес не подсвечивает ни одного пункта", () => {
    expect(activeNavId("/missing")).toBe("");
  });
});
