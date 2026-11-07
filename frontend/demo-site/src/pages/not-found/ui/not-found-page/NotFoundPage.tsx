import { useNavigate } from "react-router";
import { Button } from "@astronaut/ui-kit";
import { useTitle } from "@/shared/lib";
import { EmptyState } from "@/shared/ui";
import styles from "./NotFoundPage.module.css";

/** Адреса нет: пустое состояние по центру области и одно действие. Название страницы несут крошки. */
export function NotFoundPage() {
  useTitle("Страница не найдена");
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <EmptyState
        icon="search"
        title="Страница не найдена"
        text="Такого адреса нет. Проверьте ссылку или вернитесь на главную."
        action={<Button onClick={() => navigate("/")}>На главную</Button>}
      />
    </div>
  );
}
