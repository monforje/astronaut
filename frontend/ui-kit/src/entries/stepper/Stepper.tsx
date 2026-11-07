/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import "./stepper.css";

export type StepperVariant = "inline" | "below" | "vertical";
export type StepperStatus = "done" | "cur" | "err" | "todo";

export interface StepperStep extends Omit<HTMLAttributes<HTMLLIElement>, "title" | "children"> {
  [attribute: `data-${string}`]: string | undefined;
  title: string;
  hint?: string;
  detail?: ReactNode;
}

export interface StepperProps extends ComponentPropsWithRef<"ol"> {
  steps: StepperStep[];
  current?: number;
  error?: number;
  variant?: StepperVariant;
  clickable?: boolean;
  lockAhead?: boolean;
  onStepClick?: (index: number) => void;
}

const STATUS_LABEL: Record<StepperStatus, string> = {
  done: "пройден",
  err: "ошибка",
  cur: "текущий",
  todo: "впереди",
};

export function Stepper({
  steps,
  current = 0,
  error,
  variant = "inline",
  clickable,
  lockAhead,
  onStepClick,
  className,
  "aria-label": ariaLabel = "Шаги процесса",
  ...rest
}: StepperProps) {
  const statusOf = (i: number): StepperStatus =>
    error === i ? "err" : i < current ? "done" : i === current ? "cur" : "todo";

  return (
    <div className="ds-stp-host">
      <ol
        {...rest}
        aria-label={ariaLabel}
        className={cx("ds-stp", `ds-stp--${variant}`, className)}
      >
        {steps.map(({ title, hint, detail, className: itemClass, ...attrs }, i) => {
          const status = statusOf(i);
          const active = status === "cur" || status === "err";
          const mark =
            status === "done" ? <Icon name="ok" size="xs" /> : status === "err" ? "!" : i + 1;
          const label = (
            <>
              {title}
              <span className="ds-stp__sr">, {STATUS_LABEL[status]}</span>
            </>
          );
          const key = `${i}-${title}`;

          if (variant === "vertical") {
            return (
              <li {...attrs} key={key} className={cx("ds-stp__li", itemClass)} data-status={status}>
                <div className="ds-stp__rail">
                  <span className="ds-stp__n" aria-hidden="true">
                    {mark}
                  </span>
                  <i className="ds-stp__ln" aria-hidden="true" />
                </div>
                <div className="ds-stp__body">
                  <b className="ds-stp__t">{label}</b>
                  {hint ? <small>{hint}</small> : null}
                  {detail && active ? <div className="ds-stp__detail">{detail}</div> : null}
                </div>
              </li>
            );
          }

          const canClick = !!clickable && (status === "done" || (!lockAhead && status !== "cur"));
          const locked = !!clickable && !canClick && status !== "cur";
          const content = (
            <>
              <span className="ds-stp__n" aria-hidden="true">
                {mark}
              </span>
              <span className="ds-stp__tx">
                <span className="ds-stp__t">{label}</span>
                {hint ? <small>{hint}</small> : null}
              </span>
            </>
          );
          return (
            <li
              {...attrs}
              key={key}
              className={cx("ds-stp__li", itemClass)}
              data-status={status}
              data-last={i === steps.length - 1 || undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  className="ds-stp__i"
                  aria-current={active ? "step" : undefined}
                  disabled={locked}
                  onClick={() => canClick && onStepClick?.(i)}
                >
                  {content}
                </button>
              ) : (
                <div className="ds-stp__i" aria-current={active ? "step" : undefined}>
                  {content}
                </div>
              )}
              {variant === "inline" && i < steps.length - 1 ? (
                <span className="ds-stp__ln" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
