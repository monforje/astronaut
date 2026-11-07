/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/engine/Icon";
import { Button } from "../button";
import { Input } from "../input";
import { Progress } from "../progress";
import { Radio, RadioGroup } from "../radio";
import { Stepper } from "./index";
import "./stepper.force.css";

export type StepForce = "hover" | "active" | "focus";
export type StepVariant = "inline" | "below" | "vertical";
export interface Step {
  t: string;
  sub?: string;
  detail?: ReactNode;
}

export const STEPS4: Step[] = [{ t: "Новый" }, { t: "В работе" }, { t: "Сверка" }, { t: "Решено" }];
export const CARGO_STEPS: Step[] = [
  { t: "Заявка", sub: "09 ноя" },
  { t: "Отправка", sub: "11 ноя" },
  { t: "Таможня", sub: "14 ноя" },
  { t: "Терминал", sub: "16 ноя" },
  { t: "Выдача", sub: "—" },
];
export const FLOW_STEPS: Step[] = [
  { t: "Загружены документы", sub: "вчера, 17:20" },
  { t: "Найдено расхождение", sub: "вчера, 17:05" },
  {
    t: "Запрос брокеру",
    sub: "10:44",
    detail: (
      <>
        Ждём исправленную декларацию до 14:00 · <b>Алексей Крылов</b>
      </>
    ),
  },
  { t: "Новая версия декларации", sub: "ожидается" },
];

export function DemoStepper({
  variant = "inline",
  steps = STEPS4,
  current = 1,
  err,
  clickable,
  lockAhead,
  onStep,
  force,
  label = "Шаги процесса",
}: {
  variant?: StepVariant;
  steps?: Step[];
  current?: number;
  err?: number;
  clickable?: boolean;
  lockAhead?: boolean;
  onStep?: (i: number) => void;
  force?: Record<number, StepForce | undefined>;
  label?: string;
}) {
  return (
    <Stepper
      variant={variant}
      current={current}
      error={err}
      clickable={clickable}
      lockAhead={lockAhead}
      onStepClick={onStep}
      aria-label={label}
      steps={steps.map((s, i) => ({
        title: s.t,
        hint: s.sub,
        detail: s.detail,
        "data-force": force?.[i],
      }))}
    />
  );
}

const WZ = ["Программа", "Доступ", "Проверка", "Готово"];
const WZ_TITLES = ["Что подключаем", "Доступ к программе", "Проверка", "Всё готово"];

export function DemoWizard({ start = 0, failAt }: { start?: number; failAt?: number }) {
  const [i, setI] = useState(start);
  const [pct, setPct] = useState(start === 2 ? 40 : 0);
  const [err, setErr] = useState(false);
  const timer = useRef<number | null>(null);
  const next = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (i !== 2) return;
    let v = start === 2 ? 40 : 0;
    timer.current = window.setInterval(() => {
      v = Math.min(100, v + 8 + Math.random() * 10);
      if (failAt === 2 && v > 60) {
        if (timer.current) window.clearInterval(timer.current);
        setErr(true);
        return;
      }
      setPct(v);
      if (v >= 100 && timer.current) window.clearInterval(timer.current);
    }, 140);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [i, start, failAt]);

  const ready = i !== 2 || (pct >= 100 && !err);
  const go = (n: number) => {
    setErr(false);
    setPct(0);
    setI(n);
  };
  const back = () => {
    go(Math.max(0, i - 1));
    if (i === 1) requestAnimationFrame(() => next.current?.focus());
  };

  return (
    <div className="ds-stp-wz">
      <DemoStepper
        variant="below"
        steps={WZ.map((t) => ({ t }))}
        current={i}
        err={err ? 2 : undefined}
        clickable
        lockAhead
        onStep={(n) => n < i && go(n)}
        label="Шаги подключения"
      />
      <div className="ds-stp-wz__body" aria-live="polite">
        <b>{WZ_TITLES[i]}</b>
        {i === 0 ? (
          <RadioGroup label="Программа" defaultValue="1c" className="ds-stp-wz__opts">
            <Radio value="1c" className="ds-stp-wz__opt">
              1С:Предприятие · бухгалтерия, контрагенты
            </Radio>
            <Radio value="b24" className="ds-stp-wz__opt">
              Битрикс24 · CRM, заявки
            </Radio>
          </RadioGroup>
        ) : null}
        {i === 1 ? (
          <div className="ds-stp-wz__form">
            <Input label="Адрес сервера" defaultValue="https://1c.dalsnab.ru" />
            <Input label="Ключ доступа" defaultValue="••••••••••••" />
          </div>
        ) : null}
        {i === 2 ? (
          <Progress
            label={err ? "Сервер не отвечает" : "Проверяем подключение…"}
            value={err ? 60 : pct}
            valueText={err ? "ошибка" : undefined}
            tone={err ? "err" : "primary"}
          />
        ) : null}
        {i === 3 ? (
          <div className="ds-stp-wz__ok">
            <Icon name="check" size="sm" />
            Подключено. 1С:Предприятие отвечает за 128 мс, найдено 12 480 записей.
          </div>
        ) : null}
      </div>
      <div className="ds-stp-wz__foot">
        <Button variant="outline" disabled={i === 0} onClick={back}>
          Назад
        </Button>
        <Button ref={next} disabled={!ready} onClick={() => (i === 3 ? go(0) : go(i + 1))}>
          {i === 3 ? "Закрыть" : i === 2 ? "Завершить" : "Далее"}
        </Button>
      </div>
    </div>
  );
}
