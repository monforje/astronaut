/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { MouseEvent, ReactNode } from "react";
import { Mention, UserChip } from "./index";
import "./user-chip.force.css";

type Force = "hover" | "active" | "focus";

const keep = (event: MouseEvent) => event.preventDefault();

export function DemoUserChip({
  name = "Ирина Петрова",
  post,
  as = "button",
  force,
  disabled,
  removable,
  loading,
  unknown,
  square,
  xForce,
}: {
  name?: string;
  post?: string;
  as?: "static" | "button" | "link";
  force?: Force;
  disabled?: boolean;
  removable?: boolean;
  loading?: boolean;
  unknown?: boolean;
  square?: boolean;
  xForce?: "hover" | "focus";
}) {
  const forced = [force, xForce && `x-${xForce}`].filter(Boolean).join(" ") || undefined;
  return (
    <UserChip
      name={name}
      post={post}
      square={square}
      disabled={disabled}
      loading={loading}
      unknown={unknown}
      href={as === "link" ? "#chip" : undefined}
      onClick={as === "static" ? undefined : keep}
      onRemove={removable ? () => undefined : undefined}
      data-force={forced}
    />
  );
}

export function DemoMention({
  name = "Алексей Крылов",
  force,
  me,
  unknown,
  as = "link",
}: {
  name?: string;
  force?: "hover" | "focus";
  me?: boolean;
  unknown?: boolean;
  as?: "static" | "link";
}) {
  return (
    <Mention
      me={me}
      unknown={unknown}
      href={as === "link" ? "#mention" : undefined}
      onClick={as === "link" ? keep : undefined}
      data-force={force}
    >
      {name}
    </Mention>
  );
}

export function DemoMentionLine({ children }: { children: ReactNode }) {
  return <span className="ds-uchip-line">{children}</span>;
}
