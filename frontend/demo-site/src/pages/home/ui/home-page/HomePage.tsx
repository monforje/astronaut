import { SystemInfoCard } from "@/entities/system";
import { APP_NAME } from "@/shared/config";
import { cn, useTitle } from "@/shared/lib";
import styles from "./HomePage.module.css";

/** Стартовый экран: показывает, что фронт видит свой бэкенд через контракт. Замените своим. */
export function HomePage() {
  useTitle();
  return (
    <section className={cn("container", styles.page)}>
      <img className={styles.logo} src="/brand/logo-header.svg" alt="" />
      <h1>{APP_NAME}</h1>
      <p>Фронтенд работает и видит свой бэкенд через контракт:</p>
      <SystemInfoCard />
    </section>
  );
}
