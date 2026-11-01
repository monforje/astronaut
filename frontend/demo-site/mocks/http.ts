/**
 * Помощники обработчиков: ответы в формате бэкенда (`Problem`, RFC 9457), задержка сети и разбор тела
 * через valibot. Ошибки собираются так же, как их отдаст настоящий бэкенд, — фронт разбирает их
 * штатным `customFetch` в `ApiError`.
 */
import { HttpResponse, delay } from "msw";
import * as v from "valibot";
import type { ErrorCode, FieldError, Problem } from "@/shared/api";

/** Все пути API: `*` в начале — любой origin (`VITE_API_BASE_URL` тоже работает). */
export const API = "*/api/v1";

/** Правдоподобная задержка сети, чтобы в демо были видны скелетоны и состояния загрузки. */
export const latency = () => delay(import.meta.env.MODE === "test" ? 0 : 250 + Math.random() * 350);

export function problem(status: number, code: ErrorCode, title: string, errors?: FieldError[]) {
  const body: Problem = { type: "about:blank", title, status, code, ...(errors && { errors }) };
  return HttpResponse.json(body, {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });
}

export const notFound = (what: string) => problem(404, "not_found", `${what} не найден`);

type Parsed<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Разбирает JSON-тело по схеме; ошибки полей — `validation_failed` с `errors`, как у бэкенда. */
export async function parseBody<S extends v.GenericSchema>(
  request: Request,
  schema: S,
): Promise<Parsed<v.InferOutput<S>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: problem(400, "validation_failed", "Тело запроса — не JSON") };
  }
  const result = v.safeParse(schema, raw);
  if (result.success) return { ok: true, data: result.output };
  const errors = result.issues.map((issue) => ({
    field: v.getDotPath(issue) ?? "",
    message: issue.message,
  }));
  return { ok: false, response: problem(400, "validation_failed", "Проверьте данные", errors) };
}
