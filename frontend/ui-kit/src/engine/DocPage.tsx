/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { ComponentTab, componentSections, useComponentModel } from "./ComponentTab";
import { hasComponentTab } from "./readme";
import type { Entry } from "./registry";
import { entryPath, writeLastTab, type Tab } from "./route";
import { SpecTab, specSections } from "./SpecTab";
import { panelId, tabId, Tabs } from "./Tabs";
import { Toc } from "./Toc";
import { GROUPS, type DocSpec } from "./types";

export function groupTitle(e: Pick<Entry, "group">) {
  return GROUPS.find((g) => g.id === e.group)?.title ?? "";
}

export function DocPage({
  doc,
  tab: requested = "spec",
  section,
}: {
  doc: DocSpec;
  tab?: Tab;
  section?: string;
}) {
  const navigate = useNavigate();
  const model = useComponentModel(doc);
  const withComponent = hasComponentTab(doc);
  const tab: Tab = requested === "component" && withComponent ? "component" : "spec";
  const settled = model.readme.status !== "loading";

  const toc = useMemo(
    () => (tab === "spec" ? specSections(doc, model.readme) : componentSections(doc, model)),
    [tab, doc, model],
  );

  useEffect(() => {
    const el = section ? document.getElementById(`s-${section}`) : null;
    if (el) el.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [tab, section, settled]);

  const select = (next: Tab) => {
    writeLastTab(next);
    navigate(entryPath(doc.id, next));
  };

  const body =
    tab === "spec" ? (
      <SpecTab doc={doc} readme={model.readme} section={section} />
    ) : (
      <ComponentTab doc={doc} model={model} />
    );

  return (
    <div className="dx-doc">
      <article className="dx-doc__main">
        <nav className="dx-crumbs" aria-label="Путь">
          <Link to="/">Словарь</Link>
          <i>/</i>
          <span>{groupTitle(doc)}</span>
        </nav>
        <h1 className="dx-doc__title">{doc.title}</h1>
        <p className="dx-doc__summary">{doc.summary}</p>

        {withComponent ? (
          <>
            <Tabs page={doc.id} tabs={["spec", "component"]} active={tab} onSelect={select} />
            <div
              className="dx-tabpanel"
              role="tabpanel"
              id={panelId(doc.id, tab)}
              aria-labelledby={tabId(doc.id, tab)}
            >
              {body}
            </div>
          </>
        ) : (
          body
        )}
      </article>
      <Toc
        key={`${doc.id}:${tab}`}
        items={toc}
        basePath={entryPath(doc.id, tab)}
        onPick={(s) => {
          document.getElementById(`s-${s}`)?.scrollIntoView({ block: "start" });
          navigate(entryPath(doc.id, tab, s), { replace: true });
        }}
      />
    </div>
  );
}
