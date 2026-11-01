import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, customFetch, readCookie, setSessionRefresh } from "./httpClient";

function clearCookies() {
  for (const part of document.cookie.split("; ")) {
    const name = part.split("=")[0];
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

beforeEach(clearCookies);
afterEach(() => vi.unstubAllGlobals());

describe("readCookie", () => {
  it("читает значение по имени и не путает префиксы имён", () => {
    document.cookie = "csrf_token=abc%3D; path=/";
    document.cookie = "x_csrf_token=other; path=/";
    expect(readCookie("csrf_token")).toBe("abc=");
    expect(readCookie("missing")).toBeUndefined();
  });
});

describe("customFetch", () => {
  it("возвращает тело ответа и ставит Content-Type для запроса с телом", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => json(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(customFetch("/api/v1/x", { method: "POST", body: "{}" })).resolves.toEqual({
      ok: true,
    });
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(init.credentials).toBe("same-origin");
  });

  it("повторяет csrf_token в заголовке изменяющих запросов, но не читающих", async () => {
    document.cookie = "csrf_token=tok; path=/";
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => json(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    await customFetch("/api/v1/items/1", { method: "PUT", body: "{}" });
    await customFetch("/api/v1/items");

    const put = new Headers((fetchMock.mock.calls[0]![1] as RequestInit).headers);
    const get = new Headers((fetchMock.mock.calls[1]![1] as RequestInit).headers);
    expect(put.get("X-CSRF-Token")).toBe("tok");
    expect(get.has("X-CSRF-Token")).toBe(false);
  });

  it("превращает problem+json в ApiError с кодом, полями и Retry-After", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        json(
          429,
          {
            title: "Too many",
            detail: "Подождите",
            code: "rate_limited",
            errors: [{ field: "email", message: "bad" }],
          },
          { "Retry-After": "7" },
        ),
      ),
    );

    const err = await customFetch("/api/v1/auth/login", { method: "POST" }).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 429,
      code: "rate_limited",
      message: "Подождите",
      retryAfter: 7,
    });
    expect((err as ApiError).fieldErrors).toEqual([{ field: "email", message: "bad" }]);
  });

  it("не-JSON ответ (HTML прокси) даёт ApiError со statusText", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>", { status: 502, statusText: "Bad Gateway" })),
    );
    await expect(customFetch("/api/v1/x")).rejects.toMatchObject({
      status: 502,
      code: "internal_error",
      message: "Bad Gateway",
    });
  });

  it("обрыв сети — ApiError с кодом network", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("offline"))),
    );
    await expect(customFetch("/api/v1/x")).rejects.toMatchObject({ status: 0, code: "network" });
  });

  it("пустое тело (204) отдаёт null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await expect(customFetch("/api/v1/x", { method: "DELETE" })).resolves.toBeNull();
  });

  describe("обновление сессии", () => {
    beforeEach(() =>
      setSessionRefresh({
        url: "/api/v1/auth/refresh",
        skip: (url) => url.startsWith("/api/v1/auth/"),
      }),
    );
    afterEach(() => setSessionRefresh(undefined));

    it("не включено — 401 отдаётся как есть, обмена нет", async () => {
      setSessionRefresh(undefined);
      document.cookie = "csrf_token=tok; path=/";
      const fetchMock = vi.fn(async () => json(401, { code: "unauthenticated", title: "x" }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(customFetch("/api/v1/me")).rejects.toMatchObject({ status: 401 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("на 401 обменивает refresh и повторяет запрос один раз", async () => {
      document.cookie = "csrf_token=tok; path=/";
      const calls: string[] = [];
      let first = true;
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          calls.push(url);
          if (url === "/api/v1/auth/refresh") return json(200, {});
          if (first) {
            first = false;
            return json(401, { code: "access_token_expired", title: "x" });
          }
          return json(200, { me: true });
        }),
      );

      await expect(customFetch("/api/v1/me")).resolves.toEqual({ me: true });
      expect(calls).toEqual(["/api/v1/me", "/api/v1/auth/refresh", "/api/v1/me"]);
    });

    it("параллельные 401 делят один обмен: refresh-токен одноразовый", async () => {
      document.cookie = "csrf_token=tok; path=/";
      let refreshes = 0;
      const seen = new Set<string>();
      vi.stubGlobal(
        "fetch",
        vi.fn(async (url: string) => {
          if (url === "/api/v1/auth/refresh") {
            refreshes++;
            return json(200, {});
          }
          if (!seen.has(url)) {
            seen.add(url);
            return json(401, { code: "access_token_expired", title: "x" });
          }
          return json(200, { url });
        }),
      );

      await Promise.all([
        customFetch("/api/v1/a"),
        customFetch("/api/v1/b"),
        customFetch("/api/v1/c"),
      ]);
      expect(refreshes).toBe(1);
    });

    it("мёртвый refresh: отдаёт исходную 401, а не зацикливается", async () => {
      document.cookie = "csrf_token=tok; path=/";
      const fetchMock = vi.fn(async (url: string) =>
        url === "/api/v1/auth/refresh"
          ? json(401, { code: "refresh_token_invalid", title: "x" })
          : json(401, { code: "unauthenticated", title: "x" }),
      );
      vi.stubGlobal("fetch", fetchMock);

      await expect(customFetch("/api/v1/me")).rejects.toMatchObject({
        status: 401,
        code: "unauthenticated",
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("без csrf-cookie сессии нет: обмен не пробуем", async () => {
      const fetchMock = vi.fn(async () => json(401, { code: "unauthenticated", title: "x" }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(customFetch("/api/v1/me")).rejects.toMatchObject({ status: 401 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("401 на исключённых адресах (вход с неверным паролем) не лечится обменом", async () => {
      document.cookie = "csrf_token=tok; path=/";
      const fetchMock = vi.fn(async () => json(401, { code: "invalid_credentials", title: "x" }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(customFetch("/api/v1/auth/login", { method: "POST" })).rejects.toMatchObject({
        code: "invalid_credentials",
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
