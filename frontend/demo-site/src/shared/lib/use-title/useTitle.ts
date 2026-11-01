import { useEffect } from "react";
import { APP_NAME } from "@/shared/config";

/** Заголовок вкладки: «Раздел · <приложение>», без раздела — имя приложения. */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
