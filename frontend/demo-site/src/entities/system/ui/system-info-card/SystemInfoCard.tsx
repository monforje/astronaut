import { errorMessage } from "@/shared/lib";
import { ErrorState } from "@/shared/ui";
import { useSystemInfo } from "../../api/use-system-info";

/** Карточка «какой сервис отвечает»: состояния загрузки и ошибки живут здесь, страница только вставляет блок. */
export function SystemInfoCard() {
  const { data, error, isPending, refetch } = useSystemInfo();

  if (isPending) {
    return <p aria-busy="true">Загрузка…</p>;
  }

  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <dl>
      <dt>Сервис</dt>
      <dd>{data.service}</dd>
      <dt>Версия</dt>
      <dd>{data.version}</dd>
    </dl>
  );
}
