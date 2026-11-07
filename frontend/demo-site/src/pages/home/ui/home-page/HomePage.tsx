import { SystemInfoCard } from "@/entities/system";
import { useTitle } from "@/shared/lib";
import styles from "./HomePage.module.css";

/**
 * Стартовый экран: показывает, что фронт видит свой бэкенд через контракт. Заголовка нет: название страницы
 * несут крошки в топбаре (DESIGN.md). Бизнес-экраны появятся здесь и в соседних страницах.
 */
export function HomePage() {
  useTitle();
  return (
    <div className={styles.page}>
      <SystemInfoCard />
    </div>
  );
}
