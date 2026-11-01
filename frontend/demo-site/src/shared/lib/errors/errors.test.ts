import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import { errorMessage, fieldError, isApiError } from "./errors";

describe("errors", () => {
  it("тексты по кодам бэкенда и дополнение про Retry-After", () => {
    expect(errorMessage(new ApiError(404, "not_found", "x"))).toBe("Не найдено");
    expect(errorMessage(new ApiError(429, "rate_limited", "x", [], 12))).toBe(
      "Слишком много запросов. Повторите через 12 с",
    );
    expect(errorMessage(new ApiError(500, "unknown_code", "Сообщение сервера"))).toBe(
      "Сообщение сервера",
    );
    expect(errorMessage(new Error("boom"))).toBe("Что-то пошло не так, попробуйте ещё раз");
  });

  it("ошибка поля и проверка кода", () => {
    const err = new ApiError(400, "validation_failed", "x", [{ field: "name", message: "пусто" }]);
    expect(fieldError(err, "name")).toBe("пусто");
    expect(fieldError(err, "other")).toBeUndefined();
    expect(fieldError(new Error("x"), "name")).toBeUndefined();
    expect(isApiError(err)).toBe(true);
    expect(isApiError(err, "not_found")).toBe(false);
    expect(isApiError(new Error("x"))).toBe(false);
  });
});
