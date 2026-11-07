/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  title: string;
}

export function Toc({
  items,
  onPick,
  basePath,
}: {
  items: TocItem[];
  onPick: (id: string) => void;
  basePath: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(`s-${i.id}`))
      .filter((e): e is HTMLElement => e !== null);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (list) => {
        for (const en of list) {
          const id = en.target.id.slice(2);
          if (en.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        const first = items.find((i) => visible.has(i.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="dx-toc" aria-label="На этой странице">
      <b className="dx-toc__title">На этой странице</b>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${basePath}/${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onPick(i.id);
              }}
            >
              {i.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
