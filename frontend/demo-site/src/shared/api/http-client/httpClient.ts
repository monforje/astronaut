/**
 * Мутатор orval: каждый сгенерированный эндпоинт зовёт `customFetch` вместо голого `fetch`.
 * Здесь живут:
 *  - базовый URL и единый разбор ошибок бэкенда (`application/problem+json`, RFC 9457) в `ApiError`;
 *  - CSRF: изменяющие запросы повторяют cookie `csrf_token` в заголовке `X-CSRF-Token`;
 *  - обновление сессии — если его включили (`setSessionRefresh`): 401 на защищённом запросе один раз
 *    обменивает сессию (`POST` на адрес обмена) и повторяет запрос. Параллельные запросы ждут один общий
 *    обмен: одноразовый refresh-токен второй обмен посчитал бы кражей. Без входа в приложении 401
 *    отдаётся вызывающему как есть.
 */
import { env } from "@/shared/config";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    /** Машинный код ошибки бэкенда (`ErrorCode` из контракта); для сетевых сбоев — `network`. */
    readonly code: string,
    message: string,
    readonly fieldErrors: FieldError[] = [],
    /** Через сколько секунд можно повторить (429 и 503). */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Как продлевать сессию по 401: задаёт фича входа при старте приложения. */
export interface SessionRefresh {
  /** Адрес обмена (`POST`), например `/api/v1/auth/refresh`; успех — любой 2xx. */
  url: string;
  /** Запросы, 401 на которые обменом не лечится: сам вход, сам обмен. */
  skip: (url: string) => boolean;
}

let session: SessionRefresh | undefined;

/** Включает (или выключает — `undefined`) обновление сессии по 401. */
export function setSessionRefresh(refresh: SessionRefresh | undefined) {
  session = refresh;
}

function parse(text: string): unknown {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null; // не-JSON тело (например, HTML от прокси): ошибку соберёт statusText
  }
}

/** Значение cookie по имени; `csrf_token` выдаётся без `HttpOnly`, чтобы клиент мог повторить его в заголовке. */
export function readCookie(name: string): string | undefined {
  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return undefined;
}

interface Problem {
  title?: string;
  detail?: string;
  code?: string;
  errors?: FieldError[];
}

function toError(res: Response, body: unknown): ApiError {
  const p = (body ?? {}) as Problem;
  const retry = Number(res.headers.get("Retry-After"));
  return new ApiError(
    res.status,
    p.code ?? "internal_error",
    p.detail ?? p.title ?? res.statusText,
    p.errors ?? [],
    Number.isFinite(retry) && retry > 0 ? retry : undefined,
  );
}

async function send(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!SAFE_METHODS.has(method)) {
    const csrf = readCookie("csrf_token");
    if (csrf) headers.set("X-CSRF-Token", csrf);
  }
  try {
    return await fetch(env.apiBaseUrl + url, { credentials: "same-origin", ...init, headers });
  } catch {
    throw new ApiError(0, "network", "Нет соединения с сервером");
  }
}

let refreshing: Promise<boolean> | undefined;

/** Общий для параллельных запросов обмен сессии; `true` — сессия продлена. */
function refreshSession(url: string): Promise<boolean> {
  refreshing ??= send(url, { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = undefined;
    });
  return refreshing;
}

export async function customFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let res = await send(url, init);
  // Без csrf-cookie сессии нет вовсе (посетитель не входил): обменивать нечего, и анонимные запросы не
  // должны шуметь лишним обменом.
  if (
    res.status === 401 &&
    session &&
    !session.skip(url) &&
    readCookie("csrf_token") &&
    (await refreshSession(session.url))
  ) {
    res = await send(url, init);
  }
  const body = parse(await res.text());
  if (!res.ok) throw toError(res, body);
  return body as T;
}

/** Ошибки, которые видит вызывающий, всегда `ApiError`: сгенерированные типы ошибок контракта не используются. */
export type ErrorType<_E> = ApiError;
