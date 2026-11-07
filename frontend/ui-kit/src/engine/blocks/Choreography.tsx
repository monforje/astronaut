/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Rich } from "../Rich";
import type { ChoreographySpec } from "../types";

const fmt = (ms: number) => (ms >= 1000 ? `${ms / 1000} с` : `${ms} мс`);

const real = (v: string | undefined) => (v && !/^\s*[–—-]?\s*$/.test(v) ? v : undefined);

function Timeline({ steps }: { steps: ChoreographySpec["steps"] }) {
  const end = Math.max(100, ...steps.map((s) => s.at + s.dur));
  return (
    <ol className="dx-timeline">
      {steps.map((s, i) => {
        const prop = real(s.prop);
        const easing = real(s.easing);
        return (
          <li key={`${i}-${s.at}`} className="dx-timeline__row">
            <span className="dx-timeline__n">{i + 1}</span>
            <span className="dx-timeline__what">
              <span className="dx-timeline__text">
                <Rich>{s.what}</Rich>
              </span>
              {prop || easing ? (
                <small>
                  {prop ? <code>{prop}</code> : null}
                  {easing ? <code>{easing}</code> : null}
                </small>
              ) : null}
            </span>
            <span className="dx-timeline__time dx-num">
              {s.dur > 0 ? `${s.at} → ${s.at + s.dur} мс` : `${s.at} мс`}
            </span>
            <span className="dx-timeline__track" aria-hidden="true">
              <i
                className={s.dur > 0 ? "dx-timeline__bar" : "dx-timeline__dot"}
                style={{
                  left: `${(s.at / end) * 100}%`,
                  width: s.dur > 0 ? `${Math.max((s.dur / end) * 100, 1.5)}%` : undefined,
                }}
              />
            </span>
            <span className="dx-sr">{s.dur > 0 ? `длится ${fmt(s.dur)}` : "мгновенно"}</span>
          </li>
        );
      })}
      <li className="dx-timeline__scale" aria-hidden="true">
        <span />
        <span />
        <span />
        <span className="dx-num">0 — {fmt(end)}</span>
      </li>
    </ol>
  );
}

export function ChoreographyBlock({ items }: { items: ChoreographySpec[] }) {
  return (
    <div className="dx-choreo">
      {items.map((c, i) => (
        <article className="dx-choreo__item" key={c.id} id={`choreo-${c.id}`}>
          <header className="dx-choreo__head">
            <h3>
              <span className="dx-choreo__num">{i + 1}</span>
              {c.title}
            </h3>
            <em className={`dx-tag ${c.origin === "mockup" ? "dx-tag--ok" : "dx-tag--warn"}`}>
              {c.origin === "mockup" ? "из макета" : "предложение, нужно подтвердить"}
            </em>
          </header>
          <p className="dx-choreo__trigger">
            <b>Триггер:</b> <Rich>{c.trigger}</Rich>
          </p>
          <Timeline steps={c.steps} />
          <dl className="dx-choreo__facts">
            <div>
              <dt>Фокус</dt>
              <dd>
                <Rich>{c.focus}</Rich>
              </dd>
            </div>
            <div>
              <dt>Reduced motion</dt>
              <dd>
                <Rich>{c.reducedMotion}</Rich>
              </dd>
            </div>
            <div>
              <dt>Соседние элементы</dt>
              <dd>
                <Rich>{c.neighbours}</Rich>
              </dd>
            </div>
          </dl>
          {c.demo ? <div className="dx-choreo__demo">{c.demo}</div> : null}
        </article>
      ))}
    </div>
  );
}
