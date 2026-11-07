import { describe, expect, it } from "vitest";
import { buildCrumbs } from "./crumbs";

describe("buildCrumbs", () => {
  it("на главной одна крошка без ссылки", () => {
    expect(buildCrumbs([{ pathname: "/", handle: undefined }])).toEqual([{ label: "Главная" }]);
  });

  it("добавляет название страницы из handle, главная становится ссылкой", () => {
    const crumbs = buildCrumbs([
      { pathname: "/", handle: undefined },
      { pathname: "/missing", handle: { crumb: "Страница не найдена" } },
    ]);
    expect(crumbs).toEqual([{ label: "Главная", href: "/" }, { label: "Страница не найдена" }]);
  });
});
