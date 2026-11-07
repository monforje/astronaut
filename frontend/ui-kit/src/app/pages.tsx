/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Link, useParams } from "react-router";
import { DocPage, groupTitle } from "@/engine/DocPage";
import { entries, entryById, groupsWithEntries } from "@/engine/registry";
import { parseEntryRest } from "@/engine/route";

export function EntryRoute() {
  const { id, "*": rest } = useParams();
  const entry = entryById(id);
  if (!entry) return <NotFound />;
  if (entry.doc) {
    const { tab, section } = parseEntryRest(rest);
    return <DocPage key={entry.id} doc={entry.doc} tab={tab} section={section} />;
  }
  return (
    <div className="dx-doc dx-doc--plain">
      <article className="dx-doc__main">
        <nav className="dx-crumbs" aria-label="Путь">
          <Link to="/">Словарь</Link>
          <i>/</i>
          <span>{groupTitle(entry)}</span>
        </nav>
        <h1 className="dx-doc__title">
          {entry.title} <em className="dx-soon dx-soon--lg">скоро</em>
        </h1>
        {entry.summary ? <p className="dx-doc__summary">{entry.summary}</p> : null}
        <div className="dx-prose">
          <p>
            Страницы пока нет. Поведение, состояния и токены этого компонента описаны в макете
            temp/design-system/astronaut-ds.html; в словарь их переносят по схеме из README.md:
            описание, анатомия, варианты, состояния, хореография, правила, доступность, токены.
          </p>
          <p>
            Чтобы добавить страницу, создайте <code>src/entries/{entry.id}/doc.tsx</code> — строка
            «скоро» исчезнет сама.
          </p>
        </div>
      </article>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="dx-doc dx-doc--plain">
      <article className="dx-doc__main">
        <h1 className="dx-doc__title">Такой страницы нет</h1>
        <p className="dx-doc__summary">
          <Link to="/">Вернуться к списку компонентов</Link>
        </p>
      </article>
    </div>
  );
}

export function Home() {
  const ready = entries.filter((e) => e.doc).length;
  const soon = entries.length - ready;
  return (
    <div className="dx-doc dx-doc--plain">
      <article className="dx-doc__main">
        <h1 className="dx-doc__title">Словарь дизайн-системы Astronaut</h1>
        <p className="dx-doc__summary">
          Спецификация компонентов: как выглядят, какие бывают, как ведут себя и двигаются. Это не
          код продукта, а эталон для ui-kit.{" "}
          {soon > 0
            ? `Готово ${ready} из ${entries.length} страниц; остальные помечены «скоро».`
            : `Страниц в словаре: ${ready}.`}
        </p>
        {groupsWithEntries(entries).map((g) => (
          <section key={g.id} className="dx-home-group">
            <h2>{g.title}</h2>
            <div className="dx-home-grid">
              {g.items.map((e) => (
                <Link
                  key={e.id}
                  to={`/${e.id}`}
                  className="dx-home-card"
                  data-soon={e.doc ? undefined : true}
                >
                  <b>
                    {e.title}
                    {e.doc ? null : <em className="dx-soon">скоро</em>}
                  </b>
                  <small>{e.summary}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
