/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { AvatarGroup, type AvatarGroupPerson, type AvatarGroupSize } from "./index";
import "./avatar-group.force.css";

export const PEOPLE: { name: string; role: string }[] = [
  { name: "Ирина Петрова", role: "Оформление" },
  { name: "Алексей Крылов", role: "Брокер" },
  { name: "Мария Новикова", role: "Оформление" },
  { name: "Денис Попов", role: "Руководитель" },
  { name: "Ольга Ким", role: "Бухгалтерия" },
  { name: "Сергей Лозовой", role: "Клиент" },
];

export function DemoAvGroup({
  people = PEOPLE,
  max = 3,
  size,
  interactive,
  expanded,
  moreForce,
  tipAt,
  label = "Участники",
}: {
  people?: AvatarGroupPerson[];
  max?: number;
  size?: AvatarGroupSize;
  interactive?: boolean;
  expanded?: boolean;
  moreForce?: "hover" | "active" | "focus";
  tipAt?: number;
  label?: string;
}) {
  const forced =
    [moreForce, tipAt !== undefined && `tip-${tipAt}`].filter(Boolean).join(" ") || undefined;
  return (
    <AvatarGroup
      people={people}
      max={max}
      size={size}
      label={label}
      interactive={interactive}
      expanded={expanded}
      data-force={forced}
    />
  );
}

export function DemoAvSkeleton({ n = 3 }: { n?: number }) {
  return <AvatarGroup people={[]} loading loadingCount={n} />;
}

export function DemoAvEmpty({
  disabled,
  force,
}: {
  disabled?: boolean;
  force?: "hover" | "focus";
}) {
  return (
    <AvatarGroup people={[]} onAdd={() => undefined} addDisabled={disabled} data-force={force} />
  );
}
