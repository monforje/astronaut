/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon, type IconName } from "@/engine/Icon";
import { DemoButton } from "../button/demo";
import { ServiceCard, type ServiceStatus } from "./index";
import "./service-card.force.css";

export type SvcStatus = ServiceStatus;
export type SvcForce = "hover" | "focus";

export interface Svc {
  id: string;
  name: string;
  cat: string;
  color: string;
  on?: string;
  shape: string;
  glyph?: string;
  icon?: IconName;
  status: SvcStatus;
  pct?: number;
  error?: string;
  metrics: [string, string][];
  caps: string[];
  sync: string;
}

export const SERVICES: Svc[] = [
  {
    id: "1c",
    name: "1С:Предприятие",
    cat: "Бухгалтерия",
    color: "#F5B400",
    on: "#3a2800",
    shape: "16px",
    glyph: "1С",
    status: "ok",
    metrics: [
      ["Записей", "12 480"],
      ["Задержка", "4 мин"],
      ["Аптайм", "99,9%"],
    ],
    caps: ["Контрагенты", "Накладные", "Проводки"],
    sync: "12 мин назад",
  },
  {
    id: "b24",
    name: "Битрикс24",
    cat: "CRM",
    color: "#1FA7F2",
    shape: "50%",
    icon: "cloud",
    status: "ok",
    metrics: [
      ["Сделок", "342"],
      ["Задержка", "1 мин"],
      ["Аптайм", "99,7%"],
    ],
    caps: ["Заявки", "Клиенты", "Сделки"],
    sync: "3 мин назад",
  },
  {
    id: "alta",
    name: "Альта-ГТД",
    cat: "Таможня",
    color: "#7C5CFF",
    shape: "50% 14px",
    glyph: "А",
    status: "syncing",
    pct: 64,
    metrics: [
      ["Деклараций", "2 118"],
      ["Задержка", "9 мин"],
      ["Аптайм", "99,2%"],
    ],
    caps: ["Декларации", "ТН ВЭД"],
    sync: "идёт сейчас",
  },
  {
    id: "kontur",
    name: "Контур.ЭДО",
    cat: "Документооборот",
    color: "#13A86B",
    shape: "38%",
    glyph: "К",
    status: "ok",
    metrics: [
      ["Документов", "8 902"],
      ["Задержка", "2 мин"],
      ["Аптайм", "99,95%"],
    ],
    caps: ["Накладные", "Счета-фактуры", "Акты"],
    sync: "8 мин назад",
  },
  {
    id: "port",
    name: "Портал порта",
    cat: "Терминал",
    color: "#F0614A",
    shape: "62% 38% 55% 45% / 48% 58% 42% 52%",
    icon: "anchor",
    status: "err",
    error: "Ошибка авторизации (401). Обновите ключ доступа.",
    metrics: [
      ["Контейнеров", "—"],
      ["Задержка", "—"],
      ["Аптайм", "71%"],
    ],
    caps: ["Суда", "Контейнеры"],
    sync: "вчера, 18:40",
  },
  {
    id: "mdm",
    name: "MDM-справочник",
    cat: "Данные",
    color: "#D6409F",
    shape: "12px",
    icon: "db",
    status: "off",
    metrics: [
      ["Записей", "—"],
      ["Задержка", "—"],
      ["Аптайм", "—"],
    ],
    caps: ["Клиенты", "Контрагенты"],
    sync: "не подключено",
  },
];

export const byId = (id: string): Svc => SERVICES.find((s) => s.id === id) ?? SERVICES[0];

function activity(s: Svc): number[] {
  let seed = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 7);
  const next = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  return Array.from({ length: 24 }, () => 30 + next() * 70);
}

export function DemoServiceCard({
  svc,
  status,
  force,
  busy,
  progress,
}: {
  svc: Svc;
  status?: SvcStatus;
  force?: SvcForce;
  busy?: boolean;
  progress?: number;
}) {
  const st = status ?? svc.status;
  const focus = force === "focus" ? "focus" : undefined;
  const actions =
    st === "ok" ? (
      <>
        <DemoButton variant="outline" size="sm" force={focus}>
          Настроить
        </DemoButton>
        <DemoButton variant="outline" size="sm" icon={busy ? undefined : "refresh"} loading={busy}>
          {busy ? "Проверяем" : "Проверить"}
        </DemoButton>
      </>
    ) : st === "syncing" ? (
      <>
        <DemoButton variant="outline" size="sm">
          Настроить
        </DemoButton>
        <DemoButton variant="outline" size="sm">
          Остановить
        </DemoButton>
      </>
    ) : st === "err" ? (
      <>
        <DemoButton variant="primary" size="sm" loading={busy} force={focus}>
          {busy ? "Проверяем" : "Обновить ключ"}
        </DemoButton>
        <DemoButton variant="outline" size="sm">
          Настроить
        </DemoButton>
      </>
    ) : (
      <>
        <DemoButton variant="primary" size="sm">
          {st === "off" ? "Подключить" : "Настроить"}
        </DemoButton>
        <DemoButton variant="outline" size="sm">
          Подробнее
        </DemoButton>
      </>
    );
  return (
    <ServiceCard
      name={svc.name}
      category={svc.cat}
      status={st}
      brand={{
        color: svc.color,
        onColor: svc.on,
        shape: svc.shape,
        glyph: svc.glyph,
        icon: svc.icon ? <Icon name={svc.icon} /> : undefined,
      }}
      lastSync={svc.sync}
      metrics={svc.metrics.map(([label, value]) => ({ label, value }))}
      activity={activity(svc)}
      activityErrorFrom={17}
      capabilities={svc.caps}
      error={svc.error}
      progress={st === "syncing" ? (progress ?? svc.pct ?? 0) : undefined}
      actions={actions}
      data-force={force}
    />
  );
}
