/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Countdown, CountdownBadge, CountdownText } from "./Countdown";
import { compactLeft, splitSeconds, toneOf } from "./countdown-time";

export const ARRIVAL_SECONDS = (2 * 24 + 4) * 3600 + 15 * 60 + 30;
export const split = splitSeconds;
export { toneOf };
export const compact = compactLeft;

const BASE = new Date(2026, 10, 12, 10, 15, 0);
const at = (left: number) => new Date(BASE.getTime() + left * 1000);

export function DemoCountdown({
  left = ARRIVAL_SECONDS,
  hideDays,
  loading,
  paused,
  label = "До прибытия MSC Aurora",
  tone,
}: {
  left?: number;
  hideDays?: boolean;
  loading?: boolean;
  paused?: boolean;
  label?: string;
  tone?: "ok" | "warn" | "err";
}) {
  return (
    <Countdown
      to={at(left)}
      now={BASE}
      hideDays={hideDays}
      loading={loading}
      paused={paused}
      label={label}
      tone={tone}
      showSeconds
    />
  );
}

export function DemoCountdownText({
  tone,
  title,
  text,
}: {
  tone?: "err";
  title: string;
  text: string;
}) {
  return (
    <CountdownText tone={tone} title={title}>
      {text}
    </CountdownText>
  );
}

export function DemoCountdownLive({ from = ARRIVAL_SECONDS }: { from?: number }) {
  const [target] = useState(() => new Date(Date.now() + from * 1000));
  return <Countdown to={target} label="До прибытия MSC Aurora" showSeconds />;
}

export function DemoCountdownBadge({ left = ARRIVAL_SECONDS }: { left?: number }) {
  return <CountdownBadge to={at(left)} now={BASE} prefix="до прибытия" />;
}
