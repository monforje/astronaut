import { Skeleton } from "@mantine/core";
import { errorMessage } from "@/shared/lib";
import { ErrorState } from "@/shared/ui";
import { useSystemInfo } from "../../api/use-system-info";
import styles from "./SystemInfoCard.module.css";

/** Карточка «какой сервис отвечает»: состояния загрузки и ошибки живут здесь, страница только вставляет блок. */
export function SystemInfoCard() {
  const { data, error, isPending, refetch } = useSystemInfo();

  if (isPending) {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Загрузка">
        <Skeleton width="60%" height={20} aria-hidden />
        <Skeleton width="30%" height={16} aria-hidden />
      </div>
    );
  }

  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <dl className={styles.card}>
      <dt>Сервис</dt>
      <dd>{data.service}</dd>
      <dt>Версия</dt>
      <dd>{data.version}</dd>
    </dl>
  );
}
