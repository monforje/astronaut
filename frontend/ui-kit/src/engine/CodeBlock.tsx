/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LANG_LABEL, detectLang, tokenizeLines, type Lang } from "./highlight";

export const COPIED_MS = 1500;

type CopyState = "idle" | "copied" | "failed";

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.className = "dx-codeblock__buffer";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export interface CodeBlockProps {
  children: string;
  lang?: Lang;
  title?: string;
  lineNumbers?: boolean;
  wrap?: boolean;
}

const MESSAGE: Record<CopyState, string> = {
  idle: "",
  copied: "Скопировано",
  failed: "Не удалось скопировать: код выделен, нажмите Ctrl C",
};

export function CodeBlock({
  children,
  lang: declared = "tsx",
  title,
  lineNumbers = false,
  wrap = false,
}: CodeBlockProps) {
  const code = children.replace(/\n+$/, "");
  const lang = useMemo(() => detectLang(code, declared), [code, declared]);
  const lines = useMemo(() => tokenizeLines(code, lang), [code, lang]);
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const body = useRef<HTMLElement>(null);
  const titleId = useId();
  const label = title ?? LANG_LABEL[lang];

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await copyText(code);
    if (!ok && body.current) {
      const range = document.createRange();
      range.selectNodeContents(body.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), COPIED_MS);
  };

  return (
    <figure
      className="dx-codeblock"
      data-wrap={wrap || undefined}
      data-numbers={lineNumbers || undefined}
    >
      <figcaption className="dx-codeblock__head">
        <span className="dx-codeblock__title" id={titleId}>
          {label}
        </span>
        <button
          type="button"
          className="dx-codeblock__copy"
          data-state={state === "idle" ? undefined : state}
          onClick={copy}
        >
          {state === "copied" ? "Скопировано" : state === "failed" ? "Ошибка" : "Копировать"}
        </button>
      </figcaption>
      <pre className="dx-codeblock__pre" tabIndex={0} role="region" aria-labelledby={titleId}>
        <code ref={body} className={`dx-codeblock__code dx-codeblock__code--${lang}`}>
          {lines.map((line, i) => (
            <span className="dx-codeblock__line" key={i}>
              {line.map((t, k) => (
                <span
                  key={k}
                  className={t.type === "plain" ? undefined : `dx-tok dx-tok--${t.type}`}
                >
                  {t.text}
                </span>
              ))}
              {i < lines.length - 1 ? "\n" : null}
            </span>
          ))}
        </code>
      </pre>
      <span className="dx-sr-only" role="status" aria-live="polite">
        {MESSAGE[state]}
      </span>
    </figure>
  );
}
