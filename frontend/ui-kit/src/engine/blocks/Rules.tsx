/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon } from "../Icon";
import { Rich } from "../Rich";
import type { RulesSpec } from "../types";

export function RulesBlock({ rules }: { rules: RulesSpec }) {
  return (
    <div className="dx-rules">
      <div className="dx-rules__col dx-rules__col--use">
        <h3>
          <Icon name="check" /> Используйте, когда
        </h3>
        <ul>
          {rules.use.map((r, i) => (
            <li key={i}>
              <Rich>{r}</Rich>
            </li>
          ))}
        </ul>
      </div>
      <div className="dx-rules__col dx-rules__col--avoid">
        <h3>
          <Icon name="x" /> Не используйте, когда
        </h3>
        <ul>
          {rules.avoid.map((r, i) => (
            <li key={i}>
              <Rich>{r}</Rich>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
