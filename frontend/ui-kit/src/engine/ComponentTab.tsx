/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useMemo } from "react";
import { ExamplesBlock } from "./blocks/Examples";
import { CodeBlock } from "./CodeBlock";
import { Markdown } from "./Markdown";
import { Rich } from "./Rich";
import {
  hasComponent,
  isStub,
  splitManual,
  useExportNames,
  useReadme,
  type ManualBlocks,
  type ReadmeState,
} from "./readme";
import { Section } from "./Section";
import type { TocItem } from "./Toc";
import type { DocSpec, ExampleSpec } from "./types";

export interface ComponentModel {
  impl: boolean;
  readme: ReadmeState;
  manual?: ManualBlocks;
  manualStub: boolean;
  installLine?: string;
}

export function useComponentModel(doc: DocSpec): ComponentModel {
  const impl = hasComponent(doc.id);
  const readme = useReadme(doc.id);
  const manual = useMemo(
    () => (readme.status === "ready" ? splitManual(readme.manual) : undefined),
    [readme],
  );
  const needNames = impl && readme.status !== "loading" && !manual?.importLine;
  const names = useExportNames(doc.id, needNames);
  const installLine =
    manual?.importLine ??
    (names?.length ? `import { ${names.join(", ")} } from "@/ui";` : undefined);
  return {
    impl,
    readme,
    manual,
    manualStub: readme.status === "ready" && isStub(readme.manual),
    installLine: impl ? installLine : undefined,
  };
}

const demoExamples = (doc: DocSpec): ExampleSpec[] =>
  doc.examples.length
    ? doc.examples
    : doc.variants.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        demo: v.demo,
      }));

const hasA11y = (doc: DocSpec, m: ComponentModel) =>
  Boolean(m.manual?.a11y.length) ||
  (m.impl && m.readme.status !== "loading" && doc.a11y.length > 0);

export function componentSections(doc: DocSpec, m: ComponentModel): TocItem[] {
  const list: TocItem[] = [];
  if (!m.impl) list.push({ id: "status", title: "Статус" });
  if (m.installLine) list.push({ id: "install", title: "Установка" });
  if (demoExamples(doc).length) {
    list.push({ id: "demo", title: m.impl ? "Живые примеры" : "Демо словаря" });
  }
  if (m.impl && (m.manualStub || m.manual?.usage.length)) {
    list.push({ id: "props", title: "Пропсы и использование" });
  }
  if (hasA11y(doc, m)) list.push({ id: "a11y", title: "Доступность" });
  return list;
}

export function ComponentTab({ doc, model }: { doc: DocSpec; model: ComponentModel }) {
  const examples = demoExamples(doc);
  return (
    <>
      {!model.impl ? (
        <Section id="status" title="Статус">
          <div className="dx-stub" role="note">
            <b>Компонент ещё не реализован</b>
            <p>
              В ките пока нет публичного компонента <code>{doc.title}</code>: страница описывает
              спецификацию (вкладка «Хореография»), а демо ниже собраны из разметки словаря.
            </p>
          </div>
        </Section>
      ) : null}

      {model.installLine ? (
        <Section
          id="install"
          title="Установка"
          lead={
            <>
              Публичная точка входа кита — <code>@/ui</code>. Стили подключаются вместе с
              компонентом.
            </>
          }
        >
          <CodeBlock lang="tsx" title="Импорт">
            {model.installLine}
          </CodeBlock>
        </Section>
      ) : null}

      {examples.length ? (
        <Section
          id="demo"
          title={model.impl ? "Живые примеры" : "Демо словаря"}
          lead={
            model.impl
              ? "Компоненты на холсте настоящие: нажимайте, наводите курсор, ходите по Tab. Под каждым примером код."
              : undefined
          }
        >
          <ExamplesBlock examples={examples} />
        </Section>
      ) : null}

      {model.impl && (model.manualStub || model.manual?.usage.length) ? (
        <Section id="props" title="Пропсы и использование">
          {model.manual?.usage.length ? (
            <Markdown blocks={model.manual.usage} headingOffset={1} />
          ) : (
            <div className="dx-stub" role="note">
              <b>Раздел «Как использовать» ещё не заполнен</b>
              <p>
                В <code>README.md</code> записи между маркерами <code>manual</code> стоит заглушка{" "}
                <code>[TODO]</code>: пропсы и примеры появятся после заполнения.
              </p>
            </div>
          )}
        </Section>
      ) : null}

      {hasA11y(doc, model) ? (
        <Section id="a11y" title="Доступность">
          {model.manual?.a11y.length ? (
            <Markdown blocks={model.manual.a11y} headingOffset={1} />
          ) : (
            <div className="dx-md">
              <ul>
                {doc.a11y.map((a) => (
                  <li key={`${a.kind}-${a.title}`}>
                    <strong>{a.title}.</strong> <Rich>{a.text}</Rich>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      ) : null}
    </>
  );
}
