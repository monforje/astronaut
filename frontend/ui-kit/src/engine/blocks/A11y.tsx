/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Rich } from "../Rich";
import type { A11yKind, A11ySpec } from "../types";

const KIND: Record<A11yKind, string> = {
  key: "клавиша",
  aria: "aria",
  focus: "фокус",
  contrast: "контраст",
  motion: "движение",
  note: "заметка",
};

export function A11yBlock({ items }: { items: A11ySpec[] }) {
  return (
    <div className="dx-scroll">
      <table className="dx-table">
        <thead>
          <tr>
            <th scope="col">Тип</th>
            <th scope="col">Что</th>
            <th scope="col">Как работает</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={`${a.kind}-${a.title}`}>
              <td>
                <em className="dx-tag">{KIND[a.kind]}</em>
              </td>
              <td>
                <code>{a.title}</code>
              </td>
              <td>
                <Rich>{a.text}</Rich>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
