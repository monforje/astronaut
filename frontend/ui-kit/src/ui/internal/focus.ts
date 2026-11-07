/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export const FOCUSABLE_SELECTOR =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.closest("[inert]") && element.getAttribute("aria-hidden") !== "true",
  );
}

export function trapTab(event: KeyboardEvent | ReactKeyboardEvent, root: HTMLElement): void {
  if (event.key !== "Tab") return;
  const items = getFocusable(root);
  if (items.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const outside = !root.contains(active) || active === root;
  if (event.shiftKey && (active === first || outside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault();
    first.focus();
  }
}

export function pickInitialFocus(
  panel: HTMLElement,
  fallback: "button" | "panel" = "button",
): HTMLElement {
  const marked = panel.querySelector<HTMLElement>("[data-autofocus]");
  if (marked) return marked;
  const main = panel.querySelector<HTMLElement>("[data-ds-modal-main]");
  const field = main?.querySelector<HTMLElement>(
    'input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled)',
  );
  if (field) return field;
  if (fallback === "panel") return panel;
  return (
    panel.querySelector<HTMLElement>(".ds-btn--primary, .ds-btn--destructive") ??
    getFocusable(panel)[0] ??
    panel
  );
}
