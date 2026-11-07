/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Link } from "react-router";
import { A11yBlock } from "./blocks/A11y";
import { AnatomyBlock } from "./blocks/Anatomy";
import { ChoreographyBlock } from "./blocks/Choreography";
import { ExamplesBlock } from "./blocks/Examples";
import { RulesBlock } from "./blocks/Rules";
import { StatesBlock } from "./blocks/States";
import { TokensBlock } from "./blocks/Tokens";
import { SizesBlock, VariantsBlock } from "./blocks/Variants";
import { Markdown } from "./Markdown";
import type { ReadmeState } from "./readme";
import { entryById } from "./registry";
import { Rich } from "./Rich";
import { Section } from "./Section";
import type { TocItem } from "./Toc";
import type { DocSpec } from "./types";

export function specSections(d: DocSpec, readme: ReadmeState): TocItem[] {
  const list: TocItem[] = [{ id: "overview", title: "Описание" }];
  if (d.anatomy.parts.length) list.push({ id: "anatomy", title: "Анатомия" });
  if (d.variants.length) list.push({ id: "variants", title: "Варианты" });
  if (d.sizes?.length) list.push({ id: "sizes", title: "Размеры" });
  for (const x of d.extra ?? []) list.push({ id: x.id, title: x.title });
  if (d.states.length || d.stateMatrix) list.push({ id: "states", title: "Состояния" });
  if (d.choreography.length) list.push({ id: "choreography", title: "Хореография" });
  list.push({ id: "rules", title: "Правила" });
  if (d.a11y.length) list.push({ id: "a11y", title: "Доступность" });
  if (d.tokens.length) list.push({ id: "tokens", title: "Токены" });
  if (d.examples.length) list.push({ id: "examples", title: "Примеры" });
  if (readme.status === "ready" && readme.generated) list.push({ id: "readme", title: "README" });
  return list;
}

function ReadmeSection({
  doc,
  readme,
  open: forced,
}: {
  doc: DocSpec;
  readme: Extract<ReadmeState, { status: "ready" }>;
  open: boolean;
}) {
  const [chosen, setChosen] = useState<boolean>();
  const open = chosen ?? forced;
  const body = readme.generated.replace(/^#\s[^\n]*\n+/, "");
  return (
    <Section
      id="readme"
      title="README"
      lead={
        <>
          Текстовое описание компонента, из которого читает агент:{" "}
          <a
            href={`${import.meta.env.BASE_URL}entries/${doc.id}.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            открыть README.md
          </a>
          . Генерируется из этой страницы командой <code>task bun -- run docs</code>.
        </>
      }
    >
      <details className="dx-readme" open={open} onToggle={(e) => setChosen(e.currentTarget.open)}>
        <summary>{open ? "Свернуть описание" : "Показать описание"}</summary>
        <Markdown headingOffset={1}>{body}</Markdown>
      </details>
    </Section>
  );
}

export function SpecTab({
  doc,
  readme,
  section,
}: {
  doc: DocSpec;
  readme: ReadmeState;
  section?: string;
}) {
  return (
    <>
      <Section id="overview" title="Описание">
        <div className="dx-prose">
          {doc.purpose ? (
            <p>
              <Rich>{doc.purpose}</Rich>
            </p>
          ) : null}
          <p className="dx-meta">
            Префикс классов: <code>{doc.cssPrefix}</code> · вариантов: {doc.variants.length} ·
            состояний: {doc.states.length} · сценариев движения: {doc.choreography.length}
          </p>
          {doc.related?.length ? (
            <p className="dx-meta">
              Связанное:{" "}
              {doc.related.map((id, i) => {
                const e = entryById(id);
                return (
                  <span key={id}>
                    {i > 0 ? ", " : ""}
                    {e ? <Link to={`/${id}`}>{e.title}</Link> : id}
                  </span>
                );
              })}
            </p>
          ) : null}
        </div>
      </Section>

      {doc.anatomy.parts.length ? (
        <Section id="anatomy" title="Анатомия">
          <AnatomyBlock anatomy={doc.anatomy} />
        </Section>
      ) : null}

      {doc.variants.length ? (
        <Section id="variants" title="Варианты">
          <VariantsBlock variants={doc.variants} wide={doc.wideDemos?.variants} />
        </Section>
      ) : null}

      {doc.sizes?.length ? (
        <Section id="sizes" title="Размеры">
          <SizesBlock sizes={doc.sizes} />
        </Section>
      ) : null}

      {doc.extra?.map((x) => (
        <Section key={x.id} id={x.id} title={x.title}>
          {x.content}
        </Section>
      ))}

      {doc.states.length || doc.stateMatrix ? (
        <Section
          id="states"
          title="Состояния"
          lead="Hover, active и focus показаны принудительно (атрибут data-force), остальные — настоящие. Наведите курсор или пройдите Tab, чтобы сравнить."
        >
          <StatesBlock states={doc.states} matrix={doc.stateMatrix} wide={doc.wideDemos?.states} />
        </Section>
      ) : null}

      {doc.choreography.length ? (
        <Section
          id="choreography"
          title="Хореография"
          lead="Как компонент двигается: шаги по времени, кривые, фокус, reduced motion и реакция соседей. «Проиграть» запускает живой сценарий, «¼×» замедляет его в четыре раза."
        >
          <ChoreographyBlock items={doc.choreography} />
        </Section>
      ) : null}

      <Section id="rules" title="Правила">
        <RulesBlock rules={doc.rules} />
      </Section>

      {doc.a11y.length ? (
        <Section id="a11y" title="Доступность">
          <A11yBlock items={doc.a11y} />
        </Section>
      ) : null}

      {doc.tokens.length ? (
        <Section id="tokens" title="Токены">
          <TokensBlock tokens={doc.tokens} />
        </Section>
      ) : null}

      {doc.examples.length ? (
        <Section id="examples" title="Примеры">
          <ExamplesBlock examples={doc.examples} />
        </Section>
      ) : null}

      {readme.status === "ready" && readme.generated ? (
        <ReadmeSection doc={doc} readme={readme} open={section === "readme"} />
      ) : null}
    </>
  );
}
