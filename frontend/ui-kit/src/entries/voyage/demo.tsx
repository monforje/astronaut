/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon } from "@/engine/Icon";
import { Badge } from "../badge";
import { Voyage, type VoyageStatus } from "./Voyage";

export type { VoyageStatus };

export function DemoVoyage({
  p = 0.64,
  status = "transit",
  from = "Нинбо",
  to = "Владивосток",
  dep = "04.11",
  arr = "16.11",
  vessel = "MSC Aurora",
  badges,
  tip,
  state = "ready",
  compact,
}: {
  p?: number;
  status?: VoyageStatus;
  from?: string;
  to?: string;
  dep?: string;
  arr?: string;
  vessel?: string;
  badges?: boolean;
  tip?: boolean;
  state?: "ready" | "loading" | "error" | "empty";
  compact?: boolean;
}) {
  return (
    <Voyage
      progress={p}
      status={status}
      statusText={status === "delay" ? "задержка 1 д." : undefined}
      from={from}
      to={to}
      departure={dep}
      arrival={arr}
      vessel={vessel}
      tipOpen={tip ? true : undefined}
      loading={state === "loading"}
      error={state === "error"}
      empty={state === "empty"}
      errorText="[TODO] источник положения судна не определён"
      compact={compact}
    >
      {badges ? (
        <>
          <Badge tone={status === "delay" ? "warn" : status === "arrived" ? "ok" : "info"}>
            {status === "arrived" ? "Прибыл" : status === "delay" ? "Задержка" : "В пути"}
          </Badge>
          {status === "arrived" ? null : (
            <Badge tone="ok" form="plain" icon={<Icon name="clock" />}>
              до прибытия 2 д 4 ч
            </Badge>
          )}
        </>
      ) : null}
    </Voyage>
  );
}
