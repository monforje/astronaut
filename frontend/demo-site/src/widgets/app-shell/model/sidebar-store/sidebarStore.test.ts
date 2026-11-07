import { beforeEach, describe, expect, it } from "vitest";
import { RAIL_KEY, useSidebarStore } from "./sidebarStore";

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ rail: false });
});

describe("sidebarStore", () => {
  it("запоминает свёрнутость сайдбара", () => {
    useSidebarStore.getState().setRail(true);
    expect(useSidebarStore.getState().rail).toBe(true);
    expect(localStorage.getItem(RAIL_KEY)).toBe("1");

    useSidebarStore.getState().setRail(false);
    expect(localStorage.getItem(RAIL_KEY)).toBe("0");
  });
});
