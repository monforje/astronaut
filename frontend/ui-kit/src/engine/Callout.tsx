/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type CalloutSide = "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";

export interface MarkSpec {
  n: number;
  anchor?: string;
  side?: CalloutSide;
}

const GUTTER = 28;
const R = 9;
const MIN_INNER_WIDTH = 48;

interface Placed {
  left: number;
  top: number;
  line?: { x1: number; y1: number; x2: number; y2: number };
}

type Edge = "t" | "b" | "l" | "r";

const isEdge = (s: CalloutSide): s is Edge => s === "t" || s === "b" || s === "l" || s === "r";
const sideOf = (m: MarkSpec): CalloutSide => m.side ?? (m.anchor ? "l" : "tr");

function place(side: CalloutSide, box: DOMRect, wrap: DOMRect): Placed {
  const l = box.left - wrap.left;
  const t = box.top - wrap.top;
  const r = l + box.width;
  const b = t + box.height;
  const cx = l + box.width / 2;
  const cy = t + box.height / 2;
  const mid = GUTTER / 2;
  switch (side) {
    case "tl":
      return { left: l - 1 - R, top: t - 1 - R };
    case "tr":
      return { left: r + 1 - R, top: t - 1 - R };
    case "bl":
      return { left: l - 1 - R, top: b + 1 - R };
    case "br":
      return { left: r + 1 - R, top: b + 1 - R };
    case "l":
      return { left: mid - R, top: cy - R, line: { x1: mid + R, y1: cy, x2: l, y2: cy } };
    case "r": {
      const x = wrap.width - mid;
      return { left: x - R, top: cy - R, line: { x1: r, y1: cy, x2: x - R, y2: cy } };
    }
    case "t":
      return { left: cx - R, top: mid - R, line: { x1: cx, y1: mid + R, x2: cx, y2: t } };
    case "b": {
      const y = wrap.height - mid;
      return { left: cx - R, top: y - R, line: { x1: cx, y1: b, x2: cx, y2: y - R } };
    }
  }
}

const warned = new Set<string>();

function warnMissing(anchor: string) {
  if (!import.meta.env.DEV || warned.has(anchor)) return;
  warned.add(anchor);
  // oxlint-disable-next-line no-console
  console.warn(`Marks: не найдена часть "${anchor}", метка стоит у всего демо`);
}

export function Marks({
  items,
  children,
  block = false,
}: {
  items: MarkSpec[];
  children: ReactNode;
  block?: boolean;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const [placed, setPlaced] = useState<(Placed | undefined)[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const used = useMemo(() => {
    const set = new Set<Edge>();
    for (const m of items) {
      const side = sideOf(m);
      if (isEdge(side)) set.add(side);
    }
    return set;
  }, [items]);

  useLayoutEffect(() => {
    const el = wrap.current;
    const inner = el?.querySelector<HTMLElement>(".dx-marks__inner");
    if (!el || !inner) return;
    let frame = 0;
    let last = "";
    const ro = new ResizeObserver(() => schedule());

    const watchAnchors = () => {
      for (const m of items) {
        if (m.anchor) for (const a of inner.querySelectorAll(m.anchor)) ro.observe(a);
      }
    };

    const measure = () => {
      frame = 0;
      watchAnchors();
      if (!block && !collapsed && inner.offsetWidth < MIN_INNER_WIDTH && inner.childElementCount) {
        setCollapsed(true);
        return;
      }
      const w = el.getBoundingClientRect();
      const next = items.map((m) => {
        const target = m.anchor ? inner.querySelector<HTMLElement>(m.anchor) : inner;
        if (m.anchor && !target) warnMissing(m.anchor);
        return place(sideOf(m), (target ?? inner).getBoundingClientRect(), w);
      });
      const key = JSON.stringify(next);
      if (key === last) return;
      last = key;
      setPlaced(next);
    };
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    measure();
    ro.observe(el);
    ro.observe(inner);
    const mo = new MutationObserver(schedule);
    mo.observe(inner, { subtree: true, childList: true, attributes: true, characterData: true });
    window.addEventListener("resize", schedule);
    void document.fonts?.ready.then(schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [items, block, collapsed]);

  const pad: CSSProperties = {
    paddingTop: used.has("t") ? GUTTER : undefined,
    paddingBottom: used.has("b") ? GUTTER : undefined,
    paddingLeft: used.has("l") ? GUTTER : undefined,
    paddingRight: used.has("r") ? GUTTER : undefined,
  };

  return (
    <span
      className="dx-marks"
      data-block={block || collapsed || undefined}
      style={used.size ? pad : undefined}
      ref={wrap}
    >
      <span className="dx-marks__inner">{children}</span>
      {items.map((m, i) => {
        const p = placed[i];
        const style: CSSProperties | undefined = p ? { left: p.left, top: p.top } : undefined;
        return (
          <span key={`${i}-${m.n}`}>
            {p?.line ? (
              <svg className="dx-marks__line" aria-hidden="true">
                <line x1={p.line.x1} y1={p.line.y1} x2={p.line.x2} y2={p.line.y2} />
                <circle cx={p.line.x2} cy={p.line.y2} r={2} />
              </svg>
            ) : null}
            <span
              className="dx-callout__n dx-marks__n"
              data-ready={p ? "" : undefined}
              style={style}
              aria-label={`Часть ${m.n}`}
            >
              {m.n}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Callout({
  n,
  children,
  side,
  anchor,
  block,
}: MarkSpec & {
  children: ReactNode;
  block?: boolean;
}) {
  const items = useMemo(() => [{ n, side, anchor }], [n, side, anchor]);
  return (
    <Marks items={items} block={block}>
      {children}
    </Marks>
  );
}
