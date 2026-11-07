/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useMemo, useRef, type ComponentPropsWithRef, type KeyboardEvent } from "react";
import { cx, useControlled, useMergedRefs, useStableId } from "../../ui/internal";
import { AccordionContext } from "./accordion-context";
import "./accordion.css";

export type AccordionType = "single" | "multiple";
export type AccordionVariant = "plain" | "cards";

export interface AccordionProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  type?: AccordionType;
  variant?: AccordionVariant;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

const NO_VALUE: string[] = [];

export function Accordion({
  type = "single",
  variant = "plain",
  value,
  defaultValue = NO_VALUE,
  onValueChange,
  headingLevel = 4,
  className,
  onKeyDown,
  ref,
  children,
  ...rest
}: AccordionProps) {
  const uid = useStableId();
  const [open, setOpen] = useControlled(value, defaultValue, onValueChange);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(rootRef, ref);

  const context = useMemo(
    () => ({
      uid,
      open,
      headingLevel,
      toggle: (item: string) => {
        const next = open.includes(item)
          ? open.filter((x) => x !== item)
          : type === "multiple"
            ? [...open, item]
            : [item];
        setOpen(next);
      },
    }),
    [uid, open, headingLevel, type, setOpen],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const triggers = [
      ...(rootRef.current?.querySelectorAll<HTMLButtonElement>(".ds-acc__t:not(:disabled)") ?? []),
    ];
    const index = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? triggers.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + triggers.length) % triggers.length;
    triggers[next].focus();
  };

  return (
    <AccordionContext value={context}>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        {...rest}
        ref={mergedRef}
        className={cx("ds-acc", variant === "cards" && "ds-acc--cards", className)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </AccordionContext>
  );
}
