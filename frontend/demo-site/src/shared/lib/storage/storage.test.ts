import { afterEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage } from "./storage";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("storage", () => {
  it("записывает значение и читает его обратно", () => {
    writeStorage("astronaut:test", "значение");
    expect(readStorage("astronaut:test")).toBe("значение");
  });

  it("для неизвестного ключа возвращает null", () => {
    expect(readStorage("astronaut:missing")).toBeNull();
  });

  it("при недоступном хранилище не падает: чтение даёт null, запись пропускается", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readStorage("astronaut:test")).toBeNull();
    expect(() => writeStorage("astronaut:test", "x")).not.toThrow();
  });
});
