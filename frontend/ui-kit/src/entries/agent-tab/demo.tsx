/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/engine/Icon";
import { Button } from "../button";
import { Btn, type Force } from "../dialog/demo";
import { AgentBubble, AgentTab } from "./index";
import "./agent-tab.force.css";

function forced(force?: Force): object | undefined {
  return force ? { "data-force": force } : undefined;
}

export function DemoAgentTab({
  force,
  badge,
  open,
  sub = "Ctrl J",
  rest,
}: {
  force?: Force;
  badge?: boolean;
  open?: boolean;
  sub?: string;
  rest?: boolean;
}) {
  return (
    <div className={`ds-agent-tab-frame${rest ? " ds-agent-tab-frame--rest" : ""}`}>
      <AgentTab
        className="ds-agent-tab--demo"
        open={!!open}
        badge={badge}
        hint={sub}
        {...forced(force)}
      />
    </div>
  );
}

export function DemoBubble({ out, forceBtn }: { out?: boolean; forceBtn?: Force }) {
  return (
    <AgentBubble
      open={!out}
      duration={Infinity}
      className="ds-agent-tab__bubble--static"
      actions={
        <>
          <Btn variant="primary" size="sm" force={forceBtn}>
            Показать
          </Btn>
          <Btn size="sm">Позже</Btn>
        </>
      }
    >
      Нашёл <b>8 грузов</b> с расхождениями. Самое заметное — MSKU4821907: вес в декларации меньше
      на 180 кг. Показать?
    </AgentBubble>
  );
}

type PanelSize = "panel" | "wide" | "full";
const NEXT: Record<PanelSize, PanelSize> = { panel: "wide", wide: "full", full: "panel" };

export function AgentTabLive({ initialBubble }: { initialBubble?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const tab = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(200);
  const [open, setOpen] = useState(false);
  const [out, setOut] = useState(false);
  const [size, setSize] = useState<PanelSize>("panel");
  const [hidden, setHidden] = useState(false);
  const [badge, setBadge] = useState(true);
  const [bubble, setBubble] = useState(!!initialBubble);

  const clamp = useCallback((v: number) => {
    const h = stage.current?.clientHeight ?? 380;
    return Math.max(24, Math.min(h - 70, v));
  }, []);

  const toggle = () => {
    if (open) {
      setOut(true);
      tab.current?.focus();
      window.setTimeout(() => {
        setOpen(false);
        setOut(false);
        setSize("panel");
      }, 200);
    } else {
      setOpen(true);
      setBubble(false);
    }
  };

  const full = open && size === "full";

  return (
    <div style={{ display: "grid", gap: 10, width: "100%" }}>
      <div
        ref={stage}
        className="ds-agent-tab-stage"
        role="presentation"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLowerCase() === "j") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="ds-agent-tab-stage__page">
          <i style={{ width: "30%" }} />
          <i />
          <i style={{ width: "70%" }} />
          <i style={{ width: "55%" }} />
        </div>
        {open ? (
          <div
            ref={panel}
            className="ds-agent-tab-panel"
            data-size={size}
            data-out={out || undefined}
            role="dialog"
            aria-label="Агент"
          >
            <div className="ds-agent-tab-panel__head">
              <b>Панель агента</b>
              <Btn
                variant="ghost"
                size="sm"
                square
                label="Развернуть"
                onClick={() => setSize((s) => NEXT[s])}
              >
                <Icon name={size === "full" ? "shrink" : size === "wide" ? "expand" : "wide"} />
              </Btn>
            </div>
            <div className="ds-agent-tab-panel__body">
              Ширина панели меняется кнопкой выше: язычок идёт за её левой кромкой, в полноэкранном
              виде исчезает.
            </div>
          </div>
        ) : null}
        <AgentTab
          ref={tab}
          y={y}
          onYChange={(next) => setY(clamp(next))}
          open={open}
          onOpenChange={toggle}
          attachTo={panel}
          hidden={full || hidden}
          badge={badge}
          hint={badge ? "есть идея" : "Ctrl J"}
        />
        <AgentBubble
          open={bubble}
          onOpenChange={setBubble}
          anchorY={y}
          actions={
            <>
              <Btn
                variant="primary"
                size="sm"
                onClick={() => {
                  setBubble(false);
                  setBadge(false);
                  setOpen(true);
                }}
              >
                Показать
              </Btn>
              <Btn size="sm" onClick={() => setBubble(false)}>
                Позже
              </Btn>
            </>
          }
        >
          Нашёл <b>8 грузов</b> с расхождениями. Самое заметное — MSKU4821907: вес в декларации
          меньше на 180 кг. Показать?
        </AgentBubble>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Btn size="sm" onClick={() => !open && setBubble(true)}>
          Показать подсказку-предложение
        </Btn>
        <Btn size="sm" onClick={() => setHidden((h) => !h)}>
          {hidden ? "Показать язычок" : "Скрыть язычок"}
        </Btn>
        <Btn
          size="sm"
          variant="ghost"
          onClick={() => setY(clamp((stage.current?.clientHeight ?? 380) * 0.6))}
        >
          Вернуть на место
        </Btn>
      </div>
    </div>
  );
}

const PW: Record<PanelSize, number> = { panel: 260, wide: 420, full: 0 };

export function AgentTabScene({
  open,
  size = "panel",
  force,
  badge,
  hidden,
  bubble,
  bubbleOut,
  y = 200,
  panelOut,
}: {
  open?: boolean;
  size?: PanelSize;
  force?: Force;
  badge?: boolean;
  hidden?: boolean;
  bubble?: boolean;
  bubbleOut?: boolean;
  y?: number;
  drag?: boolean;
  panelOut?: boolean;
}) {
  const full = open && size === "full";
  return (
    <div className="ds-agent-tab-stage" style={{ height: 340 }}>
      <div className="ds-agent-tab-stage__page">
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
      </div>
      {open ? (
        <div className="ds-agent-tab-panel" data-size={size} data-out={panelOut || undefined}>
          <div className="ds-agent-tab-panel__head">
            <b>Панель агента</b>
          </div>
          <div className="ds-agent-tab-panel__body">
            {size === "panel" ? "panel · 430" : size === "wide" ? "wide · 760" : "на весь экран"}
          </div>
        </div>
      ) : null}
      <AgentTab
        y={y}
        open={!!open}
        hidden={full || hidden}
        badge={badge}
        hint={badge ? "есть идея" : "Ctrl J"}
        style={{ right: open && !full ? PW[size] : 0 } as CSSProperties}
        {...forced(force)}
      />
      <AgentBubble
        open={!!bubble && !bubbleOut}
        duration={Infinity}
        anchorY={y}
        actions={
          <>
            <Btn variant="primary" size="sm">
              Показать
            </Btn>
            <Btn size="sm">Позже</Btn>
          </>
        }
      >
        Нашёл <b>8 грузов</b> с расхождениями. Показать?
      </AgentBubble>
    </div>
  );
}

const EXAMPLE_Y = 110;
const BUBBLE_Y = 170;

export function TabExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ds-agent-tab-stage ds-agent-tab-stage--sm">
      <div className="ds-agent-tab-stage__page">
        <i style={{ width: "30%" }} />
        <i />
        <i style={{ width: "70%" }} />
      </div>
      <AgentTab
        y={EXAMPLE_Y}
        badge={1}
        hint="есть идея"
        open={open}
        onOpenChange={setOpen}
        draggable={false}
      />
    </div>
  );
}

export function BubbleExample() {
  const [shown, setShown] = useState(true);
  return (
    <div className="ds-agent-tab-example">
      <Button variant="outline" size="sm" disabled={shown} onClick={() => setShown(true)}>
        Показать предложение
      </Button>
      <div className="ds-agent-tab-stage ds-agent-tab-stage--sm">
        <div className="ds-agent-tab-stage__page">
          <i style={{ width: "30%" }} />
          <i />
          <i style={{ width: "70%" }} />
        </div>
        <AgentTab y={BUBBLE_Y} badge={shown} hint="есть идея" draggable={false} />
        <AgentBubble
          open={shown}
          onOpenChange={setShown}
          duration={Infinity}
          anchorY={BUBBLE_Y}
          actions={
            <>
              <Button size="sm" onClick={() => setShown(false)}>
                Показать
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShown(false)}>
                Позже
              </Button>
            </>
          }
        >
          Нашёл <b>8 грузов</b> с расхождениями. Показать?
        </AgentBubble>
      </div>
    </div>
  );
}
