import { ApiError, type ErrorCode } from "@/shared/api";

/**
 * Тексты для кодов ошибок бэкенда (`ErrorCode` контракта) и сетевого сбоя. Новый код в контракте
 * без текста здесь — ошибка типов: словарь обязан покрывать весь enum.
 */
const MESSAGES = {
  validation_failed: "Проверьте введённые данные",
  unauthenticated: "Войдите, чтобы продолжить",
  not_found: "Не найдено",
  csrf_invalid: "Не удалось подтвердить запрос, обновите страницу",
  rate_limited: "Слишком много запросов",
  service_unavailable: "Сервис временно недоступен, попробуйте чуть позже",
  internal_error: "Что-то пошло не так, попробуйте ещё раз",
  network: "Нет соединения с сервером",
} satisfies Record<ErrorCode | "network", string>;

const FALLBACK = MESSAGES.internal_error;

function known(code: string): code is keyof typeof MESSAGES {
  return Object.hasOwn(MESSAGES, code);
}

/** Человекочитаемое сообщение об ошибке; для 429 и 503 добавляет, через сколько можно повторить. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return FALLBACK;
  const base = known(error.code) ? MESSAGES[error.code] : error.message || FALLBACK;
  if (error.retryAfter && (error.status === 429 || error.status === 503)) {
    return `${base}. Повторите через ${error.retryAfter} с`;
  }
  return base;
}

/** Сообщение к конкретному полю формы из `errors` проблемы `validation_failed`. */
export function fieldError(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  return error.fieldErrors.find((f) => f.field === field)?.message;
}

export function isApiError(error: unknown, ...codes: string[]): error is ApiError {
  return error instanceof ApiError && (codes.length === 0 || codes.includes(error.code));
}
