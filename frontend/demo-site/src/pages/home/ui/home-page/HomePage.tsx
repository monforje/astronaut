import { SystemInfoCard } from "@/entities/system";
import { APP_NAME } from "@/shared/config";
import { useTitle } from "@/shared/lib";

/** Стартовый экран: показывает, что фронт видит свой бэкенд через контракт. Замените своим. */
export function HomePage() {
  useTitle();
  return (
    <section>
      <h1>{APP_NAME}</h1>
      <p>Фронтенд работает и видит свой бэкенд через контракт:</p>
      <SystemInfoCard />
    </section>
  );
}
