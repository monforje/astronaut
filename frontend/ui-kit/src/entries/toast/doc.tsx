/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useMemo, useState } from "react";
import { Icon } from "@/engine/Icon";
import { Playback } from "@/engine/Playback";
import { Marks } from "@/engine/Callout";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoToast,
  DemoToaster,
  POS_LABEL,
  ProgressToastExample,
  ToastStage,
  Toaster,
  UndoToastExample,
  bindToast,
  createToastStore,
  type ToastItem,
  type ToastPos,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const Btn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button type="button" className="ds-btn ds-btn--outline ds-btn--sm" onClick={onClick}>
    {children}
  </button>
);

const REFRESH_ICON = <Icon name="refresh" />;

function ToastLive() {
  const [store] = useState(() => createToastStore());
  const toast = useMemo(() => bindToast(store), [store]);
  const [pos, setPos] = useState<ToastPos>("br");
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const retry = () => {
    const handle = toast({ title: "Повторяем…", loading: true });
    window.setTimeout(
      () => toast.update(handle, { loading: false, title: "Соединение восстановлено" }),
      1300,
    );
  };
  return (
    <div style={{ display: "grid", gap: 10, width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Btn onClick={() => toast({ title: "Документы сверены", description: "Расхождений нет" })}>
          Успех
        </Btn>
        <Btn
          onClick={() =>
            toast({
              title: "Новая версия справочника",
              description: "Обновлён список портов",
              tone: "info",
            })
          }
        >
          Информация
        </Btn>
        <Btn
          onClick={() =>
            toast({
              title: "Нет накладной",
              description: "Сверка по весу недоступна",
              tone: "warn",
            })
          }
        >
          Предупреждение
        </Btn>
        <Btn
          onClick={() =>
            toast({
              title: "ПО таможни не отвечает",
              description: "Повторим через минуту",
              tone: "err",
              action: { label: "Повторить", onClick: retry },
            })
          }
        >
          Ошибка с повтором
        </Btn>
        <Btn
          onClick={() =>
            toast({
              title: "Груз отправлен в архив",
              description: "MSKU4821907",
              action: {
                label: "Отменить",
                onClick: () => toast({ title: "Возвращено", icon: REFRESH_ICON }),
              },
            })
          }
        >
          С отменой
        </Btn>
        <Btn
          onClick={() => {
            const handle = toast({
              title: "Сверяем документы…",
              description: "128 грузов",
              loading: true,
            });
            window.setTimeout(
              () =>
                toast.update(handle, {
                  loading: false,
                  title: "Сверка завершена",
                  description: "Расхождений: 8",
                  tone: "warn",
                  action: { label: "Открыть" },
                }),
              2200,
            );
          }}
        >
          Сверить документы
        </Btn>
        <Btn
          onClick={() =>
            [
              "Накладная загружена",
              "Декларация загружена",
              "Инвойс загружен",
              "Упаковочный лист загружен",
            ].forEach((title, i) => window.setTimeout(() => toast({ title }), i * 300))
          }
        >
          Четыре подряд
        </Btn>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span style={{ color: "var(--text-3)", fontSize: "var(--fs-control)" }}>Положение:</span>
        {(Object.keys(POS_LABEL) as ToastPos[]).map((p) => (
          <button
            key={p}
            type="button"
            className="ds-btn ds-btn--ghost ds-btn--xs"
            aria-pressed={pos === p}
            onClick={() => setPos(p)}
          >
            {POS_LABEL[p]}
          </button>
        ))}
      </div>
      <ToastStage small stageRef={setStage}>
        <Toaster store={store} position={pos} container={stage} />
      </ToastStage>
    </div>
  );
}

const T = (id: number, title: string, extra: Partial<ToastItem> = {}): ToastItem => ({
  id,
  title,
  ...extra,
});
const NAMES = [
  "Накладная загружена",
  "Декларация загружена",
  "Инвойс загружен",
  "Упаковочный лист загружен",
];

function StackDemo() {
  return (
    <Playback<{ n: number; x: boolean; gone: boolean }>
      initial={{ n: 0, x: false, gone: false }}
      script={[
        { at: 300, set: { n: 1 } },
        { at: 800, set: { n: 2 } },
        { at: 1300, set: { n: 3 } },
        { at: 1800, set: { n: 4 } },
        { at: 2800, set: { x: true } },
        { at: 4600, set: { x: false } },
      ]}
      tail={1200}
      hint="Четыре подряд: передний полностью виден, задние выглядывают. Наведение раскрывает стопку, уход курсора сворачивает."
      render={(s) => (
        <ToastStage small>
          <DemoToaster
            items={NAMES.slice(0, s.n)
              .map((t, i) => T(i + 1, t))
              .toReversed()}
            expanded={s.x}
          />
        </ToastStage>
      )}
    />
  );
}

function LoadingDemo() {
  return (
    <Playback<{ ph: 0 | 1 | 2 }>
      initial={{ ph: 0 }}
      script={[
        { at: 300, set: { ph: 1 } },
        { at: 2500, set: { ph: 2 } },
      ]}
      tail={1400}
      hint="Тост обновляется на месте: тот же узел, новый значок, заголовок, действие; таймер 5 с стартует после результата."
      render={(s) => (
        <ToastStage small>
          <DemoToaster
            items={
              s.ph === 0
                ? []
                : s.ph === 1
                  ? [T(1, "Сверяем документы…", { desc: "128 грузов", loading: true })]
                  : [
                      T(1, "Сверка завершена", {
                        desc: "Расхождений: 8",
                        tone: "warn",
                        action: "Открыть",
                      }),
                    ]
            }
          />
        </ToastStage>
      )}
    />
  );
}

function UndoDemo() {
  return (
    <Playback<{ ph: number }>
      initial={{ ph: 0 }}
      script={[
        { at: 300, set: { ph: 1 } },
        { at: 1600, set: { ph: 2 } },
        { at: 1900, set: { ph: 3 } },
        { at: 2300, set: { ph: 4 } },
      ]}
      tail={1400}
      hint="«Отменить» закрывает тост и сразу ставит следующий: «Возвращено»."
      render={(s) => {
        const archive = T(1, "Груз отправлен в архив", {
          desc: "MSKU4821907",
          action: "Отменить",
          actionForce: s.ph === 2 ? "active" : s.ph === 1 ? "hover" : undefined,
          closing: s.ph >= 3,
        });
        const back = T(2, "Возвращено", { icon: "refresh" });
        const items = s.ph === 0 ? [] : s.ph >= 4 ? [back] : [archive];
        return (
          <ToastStage small>
            <DemoToaster items={s.ph === 3 ? [archive] : items} />
          </ToastStage>
        );
      }}
    />
  );
}

function PosDemo() {
  const order: ToastPos[] = ["br", "bc", "bl", "tl", "tc", "tr"];
  return (
    <Playback<{ i: number }>
      initial={{ i: 0 }}
      script={order.slice(1).map((_, k) => ({ at: 1200 * (k + 1), set: { i: k + 1 } }))}
      tail={1400}
      hint="Положение — свойство контейнера: меняется data-pos, а не каждого тоста. Сдвиг появления идёт от края экрана."
      render={(s) => (
        <ToastStage small>
          <DemoToaster
            pos={order[s.i]}
            items={[
              T(2, "Новые встают поверх", { desc: "Наведите — стопка раскроется", tone: "info" }),
              T(1, POS_LABEL[order[s.i]]),
            ]}
          />
        </ToastStage>
      )}
    />
  );
}

function PauseDemo() {
  return (
    <Playback<{ st: "none" | "on" | "paused" | "closing" | "gone" }>
      initial={{ st: "none" }}
      script={[
        { at: 300, set: { st: "on" } },
        { at: 1500, set: { st: "paused" } },
        { at: 3200, set: { st: "on" } },
        { at: 8000, set: { st: "closing" } },
        { at: 8300, set: { st: "gone" } },
      ]}
      tail={800}
      hint="Время настоящее: 5 с до закрытия, пауза на время наведения, отсчёт заново после ухода курсора (всего около 8 с)."
      render={(s) => (
        <ToastStage small>
          <DemoToaster
            expanded={s.st === "paused"}
            items={
              s.st === "none" || s.st === "gone"
                ? []
                : [
                    T(1, "Документы сверены", {
                      desc: "Расхождений нет",
                      closing: s.st === "closing",
                    }),
                  ]
            }
          />
        </ToastStage>
      )}
    />
  );
}

export default defineDoc({
  id: "toast",
  title: "Toast",
  group: "feedback",
  cssPrefix: "ds-toast",
  order: 20,
  keywords: [
    "тост",
    "тосты",
    "уведомление",
    "всплывающее уведомление",
    "всплывающее",
    "оповещение",
    "стопка",
    "отменить",
    "снекбар",
    "toast",
    "snackbar",
    "notification",
    "notify",
    "undo",
    "stack",
  ],
  summary:
    "Всплывающее подтверждение действия в углу экрана. Карточка с тоном, заголовком и действием; автозакрытие через 5 с; стопка раскрывается по наведению.",
  purpose:
    "Toast отвечает «получилось» или «идёт», не отнимая у пользователя внимание и не требуя решения: «Документы сверены», «Груз в архиве · Отменить». Важное и постоянное (ошибка формы, статус подключения) — Alert; требующее решения — Dialog. Тост не должен быть единственным источником важной информации: он исчезает сам.",
  related: ["alert", "dialog", "spinner", "button"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-toast", side: "b" },
          { n: 2, anchor: ".ds-toast__icon", side: "l" },
          { n: 3, anchor: ".ds-toast__text b", side: "t" },
          { n: 4, anchor: ".ds-toast__text span", side: "l" },
          { n: 5, anchor: ".ds-toast__end .ds-btn--outline", side: "b" },
          { n: 6, anchor: ".ds-toast__end .ds-btn--ghost", side: "r" },
          { n: 7, anchor: ".ds-toaster", side: "t" },
        ]}
      >
        <div className="ds-toast-stage ds-toast-stage--anat">
          <DemoToaster
            items={[T(1, "Груз отправлен в архив", { desc: "MSKU4821907", action: "Отменить" })]}
          />
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Карточка",
        description:
          "Фон --surface, кольцо 1px --border, тень --shadow-pop, радиус --r-popover (12), ширина 360 px (но не шире окна − 48).",
      },
      {
        name: "Значок или Spinner",
        description:
          "20 px слева: ✓ (ok), i (info), ! (warn, err); цвет тона. У тоста «идёт» вместо значка Spinner md.",
      },
      {
        name: "Заголовок",
        description: "Жирный (600): одна фраза о результате («Документы сверены»).",
      },
      {
        name: "Пояснение",
        description: "12 px, --text-2: что именно, сколько («128 грузов»).",
        optional: true,
      },
      {
        name: "Действие",
        description: "Кнопка outline sm справа: «Отменить», «Повторить», «Открыть». Одно.",
        optional: true,
      },
      { name: "Крестик", description: "Ghost xs, квадратный; закрывает тост с анимацией ухода." },
      {
        name: "Контейнер стопки",
        description:
          "Невидимый слой в углу: задаёт положение (data-pos), z-index 1200, pointer-events: none (кликабельны только карточки), высоту по передней карточке или по всей раскрытой стопке.",
      },
    ],
  },
  variants: [
    {
      id: "tones",
      title: "Тоны",
      description:
        "ok (по умолчанию) · info · warn · err меняют цвет значка; цвет карточки не меняется.",
      when: "ok — сделано; info — к сведению; warn — внимание; err — не вышло, есть «Повторить».",
      demo: (
        <div style={{ display: "grid", gap: 8, width: "100%" }}>
          <DemoToast item={{ title: "Документы сверены", desc: "Расхождений нет" }} />
          <DemoToast item={{ title: "Новая версия справочника", tone: "info" }} />
          <DemoToast
            item={{ title: "Нет накладной", desc: "Сверка по весу недоступна", tone: "warn" }}
          />
          <DemoToast
            item={{
              title: "ПО таможни не отвечает",
              desc: "Повторим через минуту",
              tone: "err",
              action: "Повторить",
            }}
          />
        </div>
      ),
    },
    {
      id: "undo",
      title: "С отменой",
      description:
        "Действие «Отменить» возвращает операцию. Тост висит все 5 с; нажатие закрывает его и ставит «Возвращено».",
      when: "обратимое действие без Dialog: архив, удаление в корзину.",
      demo: (
        <DemoToast
          item={{ title: "Груз отправлен в архив", desc: "MSKU4821907", action: "Отменить" }}
        />
      ),
    },
    {
      id: "progress",
      title: "Процесс → результат",
      description:
        "Идёт: Spinner, не закрывается сам. Готово: тот же тост обновляется, получает значок и действие.",
      when: "операция дольше секунды, пользователь мог уйти на другой экран.",
      demo: (
        <div style={{ display: "grid", gap: 8, width: "100%" }}>
          <DemoToast item={{ title: "Сверяем документы…", desc: "128 грузов", loading: true }} />
          <DemoToast
            item={{
              title: "Сверка завершена",
              desc: "Расхождений: 8",
              tone: "warn",
              action: "Открыть",
            }}
          />
        </div>
      ),
    },
    {
      id: "stack",
      title: "Стопка",
      description:
        "Новые встают поверх, старые выглядывают на 10 px и уменьшаются на 5 %. Видны три, остальные скрыты; всего не больше пяти.",
      when: "несколько событий подряд: файлы загружены, документы сверены.",
      demo: (
        <ToastStage small>
          <DemoToaster expanded={false} items={NAMES.map((t, i) => T(i + 1, t)).toReversed()} />
        </ToastStage>
      ),
    },
    {
      id: "expanded",
      title: "Раскрытая стопка",
      description:
        "Наведение на контейнер раскрывает все карточки друг под другом через 8 px; таймеры закрытия стоят.",
      when: "пользователь хочет прочитать более ранние уведомления.",
      demo: (
        <ToastStage small>
          <DemoToaster
            expanded
            items={NAMES.slice(0, 3)
              .map((t, i) => T(i + 1, t))
              .toReversed()}
          />
        </ToastStage>
      ),
    },
    {
      id: "live",
      title: "Живая стопка",
      description:
        "Все сценарии макета: тона, отмена, «идёт → результат», четыре подряд, шесть положений. Кнопки работают.",
      when: "посмотреть поведение руками: наведите на стопку.",
      demo: <ToastLive />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Карточка на месте, автозакрытие идёт.",
      demo: <DemoToast item={{ title: "Документы сверены", desc: "Расхождений нет" }} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Наведение на стопку раскрывает её и ставит таймеры на паузу. У кнопки действия — слой 6 %.",
      forced: true,
      demo: (
        <DemoToast item={{ title: "Груз в архиве", action: "Отменить", actionForce: "hover" }} />
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 9 % у нажатого действия; сразу после нажатия тост закрывается.",
      forced: true,
      demo: (
        <DemoToast item={{ title: "Груз в архиве", action: "Отменить", actionForce: "active" }} />
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Карточка в порядке Tab (tabindex=0): кольцо 2 px --focus со смещением 2 px.",
      forced: true,
      demo: <DemoToast item={{ title: "Документы сверены", force: "focus" }} />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Spinner вместо значка; автозакрытия нет, пока не придёт результат.",
      demo: <DemoToast item={{ title: "Сверяем документы…", desc: "128 грузов", loading: true }} />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error · тон err",
      note: "Красный значок и «Повторить». Тост ошибки закрывается как остальные; важное дублируйте в Alert.",
      demo: (
        <DemoToast item={{ title: "ПО таможни не отвечает", tone: "err", action: "Повторить" }} />
      ),
    },
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "Нет. Недоступное действие в тосте не показывают: нет прав — нет кнопки.",
    ),
    NA("empty", "empty", "Empty", "Нет. Нет событий — нет контейнера (высота стопки 0)."),
  ],
  rules: {
    use: [
      "Один тост — одно событие, заголовок до 40 символов, глагол в прошедшем времени: «Документы сверены».",
      "Для обратимого действия — «Отменить» в самом тосте, пока он на экране.",
      "Долгие операции — тост «идёт» и обновление на месте, а не два тоста.",
      "Ошибка в тосте с «Повторить»; причину и последствия пишите в пояснении.",
      "Положение одно на приложение (по умолчанию внизу справа), не меняйте его для отдельных тостов.",
    ],
    avoid: [
      "Единственный источник важной информации: тост исчезает, пользователь мог не заметить.",
      "Тост, требующий решения: «Удалить?» — это Dialog.",
      "Больше одного действия в тосте.",
      "Тосты на каждый клик: подтверждайте только то, чего не видно на экране.",
      "Закрывать тост по Esc, если фокус в форме под ним: Esc принадлежит содержимому [TODO] подтвердить.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=status, aria-live=polite",
      text: 'Каждая карточка — role="status". Контейнер стопки лучше сделать общей live-областью (aria-live="polite", aria-relevant="additions"): тосты объявляются по приходу. Ошибки по предложению [TODO] role="alert" для err-тоста, в макете role status у всех.',
    },
    {
      kind: "key",
      title: "Tab, Enter, Esc",
      text: "Карточка в порядке Tab (tabindex=0), внутри — действие и «Закрыть». Enter и Space активируют кнопки. Предложение [TODO]: Esc на карточке закрывает тост; в макете нет.",
    },
    {
      kind: "focus",
      title: "Фокус при появлении и закрытии",
      text: "Тост фокус не забирает: пользователь продолжает работу. Если тост закрыт, пока фокус был в нём, фокус нужно вернуть на элемент, с которого уходил (предложение [TODO]: в макете теряется на body).",
    },
    {
      kind: "aria",
      title: "Время чтения",
      text: "5 секунд — мало для чтения текста с действием. Пока фокус внутри стопки или курсор на ней, таймер стоит (в макете — только наведение; предложение: ещё и focus-within) [TODO]. Для WCAG 2.2.1 пользователю нужно дать продлить время: раскрыть стопку можно и с клавиатуры.",
    },
    {
      kind: "contrast",
      title: "Текст и значки",
      text: "Заголовок --text на surface 16,5:1, пояснение --text-2 8,2:1. Значки: link 4,9:1, warn-text 5,0:1, danger 4,9:1, info 5,2:1 (порог для графики 3:1). Кольцо карточки --border 1,6:1 (светлая) и 2,5:1 (тёмная) — границу дополняет тень.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление, уход и раскладка стопки без переходов: карточки встают и исчезают мгновенно, раскрытие по hover остаётся.",
    },
  ],
  tokens: [
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6 (тёмная #151b23 / #4d5b6b)",
      usage: "Фон и кольцо карточки",
      kind: "color",
    },
    {
      name: "--shadow-pop",
      value: "0 6px 20px · 0 1px 3px",
      usage: "Тень карточки",
      kind: "shadow",
    },
    { name: "--r-popover", value: "12 px", usage: "Радиус карточки", kind: "radius" },
    {
      name: "width",
      value: "min(360 px, 100vw − 48 px)",
      usage: "Ширина карточки и контейнера",
      kind: "size",
    },
    {
      name: "offset",
      value: "24 px от краёв",
      usage: "bottom/top/left/right контейнера",
      kind: "size",
    },
    {
      name: "z-index",
      value: "1200",
      usage: "Выше Dialog 800, Popover 900, Tooltip 1000, Loader страницы 1100",
      kind: "other",
    },
    {
      name: "stack offset / scale",
      value: "i × 10 px · max(.85, 1 − i × .05)",
      usage: "Свёрнутая стопка; видны три",
      kind: "size",
    },
    { name: "gap раскрытой", value: "8 px", usage: "Между карточками при hover", kind: "size" },
    {
      name: "лимит / автозакрытие",
      value: "5 карточек · 5000 мс",
      usage: "Шестой вытесняет самый старый; loading не закрывается",
      kind: "time",
    },
    {
      name: "translate, scale, opacity",
      value: "300 мс, --ease / ease",
      usage: "Появление, уход, раскладка",
      kind: "time",
    },
    {
      name: "высота контейнера",
      value: "300 мс, --ease",
      usage: "Свёрнутая ↔ раскрытая стопка",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "appear-stack",
      title: "Появление и стопка",
      trigger: "toast() — новое событие",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Карточка вставлена в начало списка, невидима: opacity 0, сдвиг на 24 px от края экрана (снизу вверх для нижних положений, сверху вниз для верхних).",
          prop: "opacity, translate",
        },
        {
          at: 16,
          dur: 300,
          what: "Следующий кадр: data-mounted. Карточка идёт на своё место (--y = 0), прозрачность 0 → 1.",
          prop: "translate, opacity",
          easing: "--ease / ease",
        },
        {
          at: 16,
          dur: 300,
          what: "Остальные карточки сдвигаются на 10 px и уменьшаются на 5 % относительно предыдущего положения: i·10 px, масштаб max(.85, 1 − i·.05).",
          prop: "translate, scale",
          easing: "--ease",
        },
        {
          at: 16,
          dur: 200,
          what: "Содержимое прежнего переднего тоста гаснет: тексты не накладываются друг на друга, видна только кромка карточки.",
          prop: "opacity (.tt-c)",
          easing: "linear",
        },
        {
          at: 16,
          dur: 300,
          what: "Карточки с i > 2 уходят в прозрачность 0 и перестают ловить клики. z-index 100 − i: новая всегда поверх.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 16,
          dur: 300,
          what: "Высота контейнера = высота передней карточки.",
          prop: "height",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус не меняется. Тост читается скринридером как live-область; карточка получает tabindex=0, но фокус на неё не ставится.",
      reducedMotion: "Все transition отключены: карточки появляются сразу в конечных положениях.",
      neighbours:
        "Стопка перекрывает содержимое страницы в углу (z-index 1200) и не сдвигает его. Dialog (800) и поповеры (900) под ней; контейнер pointer-events: none, клики по странице проходят сквозь пустое место.",
      demo: <StackDemo />,
    },
    {
      id: "expand",
      title: "Раскрытие стопки по наведению",
      trigger: "курсор входит в контейнер стопки / уходит",
      origin: "mockup",
      steps: [
        { at: 0, dur: 0, what: "Таймеры закрытия всех карточек сброшены и стоят.", prop: "—" },
        {
          at: 0,
          dur: 300,
          what: "Раскладка: смещения равны сумме высот предыдущих карточек + 8 px, масштаб 1, все карточки видны (data-hidden снят).",
          prop: "translate, scale, opacity",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Содержимое всех карточек проявляется (opacity 1).",
          prop: "opacity",
          easing: "linear",
        },
        {
          at: 0,
          dur: 300,
          what: "Высота контейнера растёт до суммы высот.",
          prop: "height",
          easing: "--ease",
        },
        {
          at: 1800,
          dur: 300,
          what: "Курсор ушёл: стопка собирается обратно по тем же правилам; таймеры стартуют заново на 5 с.",
          prop: "translate, scale, height",
          easing: "--ease",
        },
      ],
      focus:
        "Раскрытие по focus-within в макете не реализовано. [TODO] предложить: Tab на карточку раскрывает стопку и ставит таймеры на паузу.",
      reducedMotion: "Раскрытие и сворачивание без анимации.",
      neighbours:
        "Раскрытая стопка растёт от угла по направлению в экран: вверх у нижних положений, вниз у верхних. Контент страницы не сдвигается.",
      demo: <StackDemo />,
    },
    {
      id: "autoclose",
      title: "Автозакрытие, пауза, уход",
      trigger: "истекло 5 с, либо нажали «Закрыть» или действие",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Таймер на 5000 мс стартует при показе (и после обновления тоста, и после ухода курсора). Тост loading таймера не имеет.",
          prop: "—",
        },
        { at: 1200, dur: 0, what: "Наведение: таймеры стоят.", prop: "—" },
        {
          at: 5000,
          dur: 300,
          what: "Тост уходит: opacity 1 → 0 и scale → 0,95; pointer-events отключены; из списка он удалён сразу, чтобы соседи пересчитались.",
          prop: "opacity, scale",
          easing: "ease / --ease",
        },
        { at: 5300, dur: 0, what: "Узел удаляется из DOM.", prop: "—" },
        {
          at: 5000,
          dur: 300,
          what: "Оставшиеся карточки сдвигаются на место закрытой, высота контейнера пересчитывается.",
          prop: "translate, scale, height",
          easing: "--ease",
        },
      ],
      focus:
        "Если фокус был внутри уходящей карточки — он теряется. [TODO] вернуть на запомненный элемент.",
      reducedMotion: "Тост исчезает мгновенно.",
      neighbours: "Соседние карточки занимают освободившееся место за те же 300 мс.",
      demo: <PauseDemo />,
    },
    {
      id: "load-result",
      title: "«Идёт» → результат",
      trigger: "toast.update(): операция завершилась",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Тост показан с Spinner md и заголовком «Сверяем документы…», таймера нет.",
          prop: "—",
        },
        {
          at: 2200,
          dur: 0,
          what: "Содержимое перерисовывается на месте: значок ! (warn), новый заголовок и пояснение, кнопка «Открыть». Узел остаётся тот же, высота может измениться — стопка пересчитывается.",
          prop: "—",
        },
        {
          at: 2200,
          dur: 300,
          what: "Соседние карточки подстраиваются под новую высоту.",
          prop: "translate, height",
          easing: "--ease",
        },
        {
          at: 7200,
          dur: 300,
          what: "5 с после результата: автозакрытие.",
          prop: "opacity, scale",
          easing: "ease",
        },
      ],
      focus: "Не меняется. Скринридер читает обновлённый текст как новое сообщение live-области.",
      reducedMotion: "Без переходов.",
      neighbours: "При росте высоты тост выдвигается в сторону стопки, соседи сдвигаются.",
      demo: <LoadingDemo />,
    },
    {
      id: "undo",
      title: "Действие «Отменить»",
      trigger: "нажатие на действие в тосте",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка получает hover, затем active.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Выполняется onAction (возврат груза), тост закрывается.",
          prop: "—",
        },
        {
          at: 0,
          dur: 300,
          what: "Закрытие как при автозакрытии: opacity → 0, scale → 0,95.",
          prop: "opacity, scale",
          easing: "ease",
        },
        {
          at: 0,
          dur: 300,
          what: "Сразу встаёт новый тост «Возвращено» (значок «обновить») по правилам появления.",
          prop: "translate, opacity",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус был на кнопке уходящего тоста. [TODO] вернуть на элемент, откуда пришёл, либо на строку, которую вернули.",
      reducedMotion: "Тост закрывается и появляется мгновенно.",
      neighbours: "Остальные тосты стопки сдвигаются на место закрытого.",
      demo: <UndoDemo />,
    },
    {
      id: "position",
      title: "Смена положения",
      trigger: "выбор места: 6 углов и краёв",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Контейнеру ставится data-pos (br, bc, bl, tr, tc, tl): положение привязано к краям на 24 px; по центру — left:50% и translate −50 %.",
          prop: "—",
        },
        {
          at: 0,
          dur: 0,
          what: "У верхних положений карточка привязана к top, начало масштаба снизу, смещение стопки идёт вниз, сдвиг появления −24 px. У нижних — наоборот.",
          prop: "—",
        },
        {
          at: 400,
          dur: 300,
          what: "Новые тосты появляются в новом месте по обычным правилам. Уже висящие тосты остаются, пока не закроются.",
          prop: "translate, opacity",
          easing: "--ease",
        },
      ],
      focus: "Не меняется.",
      reducedMotion: "Без переходов.",
      neighbours:
        "Контейнер вверху по центру может перекрывать шапку; [TODO] решить, нужен ли отступ под шапку 56 px.",
      demo: <PosDemo />,
    },
  ],
  examples: [
    {
      id: "undo",
      title: "Обратимое действие",
      demo: <UndoToastExample />,
      code: `<Toaster />

<Button
  variant="outline"
  onClick={() => {
    archive(id);
    toast({
      title: "Груз отправлен в архив",
      description: id,
      action: { label: "Отменить", onClick: restore },
    });
  }}
>
  В архив
</Button>`,
    },
    {
      id: "progress",
      title: "Процесс → результат",
      demo: <ProgressToastExample />,
      code: `<Toaster />

<Button
  variant="outline"
  onClick={() => {
    const id = toast({ title: "Сверяем документы…", description: "128 грузов", loading: true });
    window.setTimeout(
      () => toast.update(id, { loading: false, title: "Сверка завершена", tone: "warn" }),
      2000,
    );
  }}
>
  Сверить документы
</Button>`,
    },
  ],
});
