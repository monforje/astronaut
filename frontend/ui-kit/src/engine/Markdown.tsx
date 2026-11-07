/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */
import { Fragment, useMemo, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import { langOf } from "./highlight";
import { parseInline, parseMarkdown, type Inline, type MdBlock } from "./markdown";

function inlineNodes(items: Inline[]): ReactNode {
  return items.map((n, i) => {
    switch (n.type) {
      case "text":
        return <Fragment key={i}>{n.text}</Fragment>;
      case "code":
        return <code key={i}>{n.text}</code>;
      case "bold":
        return <strong key={i}>{inlineNodes(n.children)}</strong>;
      case "italic":
        return <em key={i}>{inlineNodes(n.children)}</em>;
      case "link": {
        const external = /^https?:/i.test(n.href);
        return (
          <a
            key={i}
            href={n.href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {inlineNodes(n.children)}
          </a>
        );
      }
    }
  });
}

export function MarkdownInline({ children }: { children: string }) {
  return <>{inlineNodes(parseInline(children))}</>;
}

const HEADINGS = ["h2", "h3", "h4", "h5", "h6", "h6"] as const;

function blockNode(b: MdBlock, i: number, offset: number): ReactNode {
  switch (b.type) {
    case "heading": {
      const Tag = HEADINGS[Math.min(Math.max(b.level - 1 + offset - 1, 0), HEADINGS.length - 1)];
      return <Tag key={i}>{inlineNodes(parseInline(b.text))}</Tag>;
    }
    case "paragraph":
      return <p key={i}>{inlineNodes(parseInline(b.text))}</p>;
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag key={i}>
          {b.items.map((t, k) => (
            <li key={k}>{inlineNodes(parseInline(t))}</li>
          ))}
        </Tag>
      );
    }
    case "code":
      return (
        <CodeBlock key={i} lang={langOf(b.lang)}>
          {b.code}
        </CodeBlock>
      );
    case "table":
      return (
        <div className="dx-md__scroll" key={i} role="region" aria-label="Таблица" tabIndex={0}>
          <table>
            <thead>
              <tr>
                {b.head.map((c, k) => (
                  <th key={k} scope="col">
                    {inlineNodes(parseInline(c))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, k) => (
                <tr key={k}>
                  {b.head.map((_, c) => (
                    <td key={c} data-label={b.head[c]}>
                      {r[c] ? <span>{inlineNodes(parseInline(r[c]))}</span> : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "quote":
      return <blockquote key={i}>{inlineNodes(parseInline(b.text))}</blockquote>;
    case "rule":
      return <hr key={i} />;
  }
}

export function Markdown({
  children,
  blocks,
  headingOffset = 1,
}: {
  children?: string;
  blocks?: MdBlock[];
  headingOffset?: number;
}) {
  const parsed = useMemo(() => blocks ?? parseMarkdown(children ?? ""), [blocks, children]);
  return <div className="dx-md">{parsed.map((b, i) => blockNode(b, i, headingOffset))}</div>;
}
