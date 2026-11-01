import { Link } from "react-router";
import { useTitle } from "@/shared/lib";
import { EmptyState } from "@/shared/ui";

export function NotFoundPage() {
  useTitle("Страница не найдена");
  return (
    <div className="container">
      <EmptyState
        title="Страница не найдена"
        text="Такого адреса нет. Проверьте ссылку или вернитесь на главную."
        action={<Link to="/">На главную</Link>}
      />
    </div>
  );
}
