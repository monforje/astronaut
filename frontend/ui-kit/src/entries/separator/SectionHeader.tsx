/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx, Icon, useControlled } from "../../ui/internal";
import "./separator.css";

export interface SectionHeaderProps extends Omit<ComponentPropsWithRef<"section">, "title"> {
  title: string;
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  animated?: boolean;
  summary?: ReactNode;
  summaryAlways?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  disabled?: boolean;
}

export function SectionHeader({
  title,
  collapsible = true,
  open,
  defaultOpen = true,
  onOpenChange,
  animated,
  summary,
  summaryAlways,
  headingLevel = 3,
  disabled,
  className,
  children,
  ...rest
}: SectionHeaderProps) {
  const panelId = useId();
  const [isOpen, setOpen] = useControlled(open, defaultOpen, onOpenChange);
  const expanded = !collapsible || isOpen;
  const toggle = () => setOpen(!expanded);
  return (
    <section
      {...rest}
      className={cx("ds-sep-sec", className)}
      data-animate={animated || undefined}
      data-open={expanded || undefined}
      data-summary={summaryAlways || undefined}
    >
      <div className="ds-sep-sec__h">
        {collapsible ? (
          <button
            type="button"
            className="ds-sep-sec__btn"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? `Свернуть: ${title}` : `Развернуть: ${title}`}
            disabled={disabled}
            onClick={toggle}
          >
            <Icon name="chevr" size="xs" />
          </button>
        ) : null}
        <b role="heading" aria-level={headingLevel}>
          {title}
        </b>
        <i aria-hidden="true" />
      </div>
      <div className="ds-sep-sec__p" id={panelId} inert={!expanded}>
        <div>{children}</div>
      </div>
      {summary ? <div className="ds-sep-sec__s">{summary}</div> : null}
    </section>
  );
}
