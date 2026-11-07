/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { CSSProperties } from "react";
import { Rich } from "../Rich";
import type { TokenSpec } from "../types";

const MAX_STOPS = 3;

function swatchStyle(t: TokenSpec): CSSProperties | undefined {
  const vars = t.name.match(/--[\w-]+/g) ?? [];
  const shadow = vars.find((v) => v.includes("shadow"));
  const radius = vars.find((v) => v.startsWith("--r-"));
  const colors = vars.filter((v) => v !== shadow && v !== radius);
  const borderRadius = radius ? `var(${radius})` : undefined;
  if (shadow) {
    return {
      background: colors[0] ? `var(${colors[0]})` : "var(--surface)",
      outline: `1px solid ${colors[1] ? `var(${colors[1]})` : "var(--divider)"}`,
      boxShadow: `var(${shadow})`,
      borderRadius,
    };
  }
  if (t.kind === "radius" && radius) return { borderRadius };
  if (t.kind !== "color") return undefined;
  if (colors.length > 1) {
    const stops = colors.slice(0, MAX_STOPS).map((c, i, all) => {
      const from = (i / all.length) * 100;
      const to = ((i + 1) / all.length) * 100;
      return `var(${c}) ${from}% ${to}%`;
    });
    return { background: `linear-gradient(90deg, ${stops.join(", ")})` };
  }
  if (colors.length === 1) return { background: `var(${colors[0]})` };
  const literal = typeof CSS !== "undefined" && CSS.supports("color", t.value) ? t.value : "";
  return literal ? { background: literal } : undefined;
}

function Swatch({ t }: { t: TokenSpec }) {
  const style = swatchStyle(t);
  if (!style) return <span className="dx-sw dx-sw--none" aria-hidden="true" />;
  const shape = style.boxShadow ? " dx-sw--shadow" : t.kind === "radius" ? " dx-sw--radius" : "";
  return <i className={`dx-sw${shape}`} style={style} />;
}

export function TokensBlock({ tokens }: { tokens: TokenSpec[] }) {
  return (
    <div className="dx-scroll">
      <table className="dx-table">
        <thead>
          <tr>
            <th scope="col">
              <span className="dx-sr">Образец</span>
            </th>
            <th scope="col">Токен</th>
            <th scope="col">Значение</th>
            <th scope="col">Где применяется</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, i) => (
            <tr key={`${i}-${t.name}`}>
              <td className="dx-table__sw">
                <Swatch t={t} />
              </td>
              <td className="dx-table__name">
                {t.name
                  .split(/(\s[·/]\s)/)
                  .map((part, k) =>
                    k % 2 === 1 ? <span key={k}>{part}</span> : <code key={k}>{part}</code>,
                  )}
              </td>
              <td className="dx-num">{t.value}</td>
              <td>
                <Rich>{t.usage}</Rich>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
