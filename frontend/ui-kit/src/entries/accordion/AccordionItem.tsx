/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import { Skeleton, SkeletonGroup } from "../skeleton";
import { useAccordion } from "./accordion-context";

export type AccordionPanelStatus = "loading" | "error" | "empty";

export interface AccordionItemProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  value: string;
  title: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  status?: AccordionPanelStatus;
}

export function AccordionItem({
  value,
  title,
  icon,
  hint,
  disabled,
  status,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  const { uid, open, toggle, headingLevel } = useAccordion();
  const isOpen = open.includes(value);
  const Heading = `h${headingLevel}` as const;
  return (
    <div {...rest} className={cx("ds-acc__i", className)} data-open={isOpen || undefined}>
      <Heading className="ds-acc__h">
        <button
          type="button"
          className="ds-acc__t"
          id={`${uid}-t-${value}`}
          aria-expanded={isOpen}
          aria-controls={`${uid}-p-${value}`}
          disabled={disabled}
          onClick={() => toggle(value)}
        >
          {icon ? (
            <span className="ds-acc__ico" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className="ds-acc__tt">{title}</span>
          {hint ? <span className="ds-acc__ad">{hint}</span> : null}
          <span className="ds-acc__cv" aria-hidden="true">
            <Icon name="chev" size="sm" />
          </span>
        </button>
      </Heading>
      <div
        className="ds-acc__p"
        id={`${uid}-p-${value}`}
        role="region"
        aria-labelledby={`${uid}-t-${value}`}
        inert={!isOpen}
      >
        <div>
          <div className="ds-acc__b">
            {status === "loading" ? (
              <SkeletonGroup animation="pulse" className="ds-acc__sk-wrap">
                <Skeleton />
                <Skeleton width="60%" />
              </SkeletonGroup>
            ) : status === "error" ? (
              <span className="ds-acc__err">
                <Icon name="alert" size="sm" />
                Не удалось загрузить. Повторите позже.
              </span>
            ) : status === "empty" ? (
              <span className="ds-acc__empty">Здесь пока ничего нет.</span>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
