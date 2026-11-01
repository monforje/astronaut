import { useQuery } from "@tanstack/react-query";
import { ApiError, getSystemInfoQueryKey, systemInfo, type SystemInfo } from "@/shared/api";

/**
 * Имя и версия сервиса. Сущность оборачивает сгенерированный запрос: ключ кэша — из orval
 * (`getSystemInfoQueryKey`), ошибка — всегда `ApiError`, настройки кэша — здесь, а не в каждом потребителе.
 */
export function useSystemInfo() {
  return useQuery<SystemInfo, ApiError>({
    queryKey: getSystemInfoQueryKey(),
    queryFn: ({ signal }) => systemInfo({ signal }),
    staleTime: 60_000,
  });
}
