/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PortalHost } from "@/ui/internal";
import { Icon } from "./Icon";

export interface PlaybackStep<S> {
  at: number;
  set: Partial<S>;
}

const SPEEDS = [
  { label: "1×", slow: 1 },
  { label: "½×", slow: 2 },
  { label: "¼×", slow: 4 },
] as const;

export function Playback<S extends object>({
  initial,
  rest,
  script,
  render,
  tail = 700,
  hint,
}: {
  initial: S;
  rest?: S;
  script: PlaybackStep<S>[];
  render: (state: S) => ReactNode;
  tail?: number;
  hint?: string;
}) {
  const idle = rest ?? initial;
  const [state, setState] = useState<S>(idle);
  const [speed, setSpeed] = useState(0);
  const [run, setRun] = useState(0);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const slow = SPEEDS[speed].slow;
  const total = (script.reduce((m, s) => Math.max(m, s.at), 0) + tail) * slow;

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clear();
    setState(initial);
    setRun((n) => n + 1);
    setRunning(true);
    for (const step of script) {
      timers.current.push(
        window.setTimeout(() => setState((s) => ({ ...s, ...step.set })), step.at * slow),
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        setRunning(false);
        setState(idle);
      }, total),
    );
  }, [clear, idle, initial, script, slow, total]);

  useEffect(() => clear, [clear]);

  return (
    <div className="dx-playback" style={{ "--slow": slow } as CSSProperties}>
      <PortalHost contain className="dx-playback__stage">
        {render(state)}
      </PortalHost>
      <div className="dx-playback__bar">
        <button type="button" className="dx-btn dx-btn--primary" onClick={play}>
          <Icon name="refresh" size="sm" />
          {running ? "Заново" : "Проиграть"}
        </button>
        <div className="dx-seg" role="group" aria-label="Скорость">
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              className="dx-seg__opt"
              aria-pressed={i === speed}
              onClick={() => setSpeed(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="dx-playback__progress" aria-hidden="true">
          <i
            key={run}
            style={running ? { animationDuration: `${total}ms` } : undefined}
            data-run={running || undefined}
          />
        </span>
        {hint ? <span className="dx-playback__hint">{hint}</span> : null}
      </div>
    </div>
  );
}
