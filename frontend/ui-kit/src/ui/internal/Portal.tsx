/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const PortalHostContext = createContext<HTMLElement | null | undefined>(undefined);

export interface PortalStage {
  element: HTMLElement | null;
  reserve: (height: number) => void;
}

const PortalStageContext = createContext<PortalStage | undefined>(undefined);

export function usePortalStage(): PortalStage | undefined {
  const stage = useContext(PortalStageContext);
  return stage?.element ? stage : undefined;
}

export interface PortalProps {
  children: ReactNode;
  host?: HTMLElement;
}

export function Portal({ children, host }: PortalProps) {
  const contextHost = useContext(PortalHostContext);
  const target = host ?? (contextHost === undefined ? document.body : contextHost);
  return target ? createPortal(children, target) : null;
}

export interface PortalHostProps extends ComponentPropsWithRef<"div"> {
  contain?: boolean;
  minHeight?: number;
}

export function PortalHost({ children, contain, minHeight, style, ...rest }: PortalHostProps) {
  const parent = useContext(PortalStageContext);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [reserved, setReserved] = useState(0);
  const reserve = useCallback(
    (height: number) => setReserved((prev) => (height > prev ? height : prev)),
    [],
  );
  const own = useMemo<PortalStage>(() => ({ element: host, reserve }), [host, reserve]);
  const stage = contain === true ? own : contain === false ? undefined : parent;
  const stageHeight = contain === true ? Math.max(minHeight ?? 0, reserved) : 0;
  return (
    <div
      {...rest}
      ref={setHost}
      data-stage={contain === true || undefined}
      style={
        stageHeight > 0 ? ({ ...style, "--stage-min": `${stageHeight}px` } as CSSProperties) : style
      }
    >
      <PortalStageContext value={stage}>
        <PortalHostContext value={host}>{children}</PortalHostContext>
      </PortalStageContext>
    </div>
  );
}
