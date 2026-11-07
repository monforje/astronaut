/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Spinner, type SpinnerSize, type SpinnerTone } from "./index";
import "./spinner.force.css";

export { SpinnerDots, SpinnerInline } from "./index";
export type { SpinnerSize, SpinnerTone } from "./index";

export function DemoSpinner({
  size,
  tone,
  label,
}: {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
}) {
  return <Spinner size={size} tone={tone} label={label} />;
}

export function SpinnerSlot({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <span className="ds-spinner-slot" aria-busy={busy || undefined}>
      {busy ? <Spinner /> : null}
      {children}
    </span>
  );
}
