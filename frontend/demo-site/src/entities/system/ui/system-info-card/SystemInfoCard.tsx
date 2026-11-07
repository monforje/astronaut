import {
  Badge,
  Button,
  Card,
  CardHeader,
  Icon,
  Skeleton,
  SkeletonGroup,
  toast,
} from "@astronaut/ui-kit";
import { errorMessage } from "@/shared/lib";
import { EmptyState, ErrorState } from "@/shared/ui";
import { useSystemInfo } from "../../api/use-system-info";
import styles from "./SystemInfoCard.module.css";

/**
 * Карточка «какой сервис отвечает». Состояния живут здесь, страница только вставляет блок:
 * загрузка — Skeleton формы будущего содержимого, ошибка — плашка с «Повторить», пусто — «Обновить», готово — данные.
 */
export function SystemInfoCard() {
  const { data, error, isPending, isFetching, refetch } = useSystemInfo();

  const reload = async () => {
    const result = await refetch();
    if (result.isSuccess) toast({ title: "Статус обновлён", tone: "ok" });
  };

  if (isPending) {
    return (
      <Card as="section" aria-label="Статус системы" aria-busy="true" className={styles.card}>
        <SkeletonGroup>
          <Skeleton width="40%" height={14} />
          <div className={styles.skeletonRows}>
            <Skeleton height={12} />
            <Skeleton height={12} />
          </div>
        </SkeletonGroup>
      </Card>
    );
  }

  if (error) return <ErrorState message={errorMessage(error)} onRetry={() => void reload()} />;

  if (!data.service && !data.version) {
    return (
      <Card as="section" aria-label="Статус системы" className={styles.card}>
        <EmptyState
          icon="cloud"
          title="Бэкенд не назвал себя"
          text="Сервис ответил, но без имени и версии. Обновите статус позже."
          action={
            <Button variant="outline" loading={isFetching} onClick={() => void reload()}>
              Обновить
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card as="section" aria-label="Статус системы" className={styles.card}>
      <CardHeader icon={<Icon name="cloud" />} action={<Badge tone="ok">На связи</Badge>}>
        Статус системы
      </CardHeader>
      <dl className={styles.list}>
        <dt>Сервис</dt>
        <dd>{data.service}</dd>
        <dt>Версия</dt>
        <dd>{data.version}</dd>
      </dl>
    </Card>
  );
}
