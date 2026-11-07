/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoAlert } from "../alert/demo";
import { Btn, type Force } from "../dialog/demo";
import {
  CargoSheetExample,
  SheetLive,
  SheetMini,
  SheetStage,
  SheetView,
  type SheetSize,
} from "./demo";

const Short = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ width: "100%", maxWidth: 380 }}>
    <SheetView size="panel" flow footer={false} desc="Нинбо → Владивосток">
      {children ?? (
        <dl className="ds-sheet__dl" style={{ margin: 0 }}>
          <dt>Клиент</dt>
          <dd>ООО «Дальснаб»</dd>
          <dt>Прибытие</dt>
          <dd>14.11.2026</dd>
        </dl>
      )}
    </SheetView>
  </div>
);

function Flow({
  closeForce,
  sizeForce,
  buttons,
  body,
}: {
  closeForce?: Force;
  sizeForce?: Force;
  buttons?: React.ReactNode;
  body?: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 380 }}>
      <SheetView
        size="panel"
        flow
        closeForce={closeForce}
        sizeForce={sizeForce}
        footer={!!buttons}
        footerButtons={buttons}
        desc="Нинбо → Владивосток"
      >
        {body ?? (
          <dl className="ds-sheet__dl" style={{ margin: 0 }}>
            <dt>Клиент</dt>
            <dd>ООО «Дальснаб»</dd>
          </dl>
        )}
      </SheetView>
    </div>
  );
}

function OpenDemo() {
  return (
    <Playback<{ f?: Force; open: boolean }>
      initial={{ open: false }}
      script={[
        { at: 300, set: { f: "hover" } },
        { at: 800, set: { f: "active" } },
        { at: 1000, set: { f: "focus", open: true } },
      ]}
      tail={1400}
      render={(s) => (
        <SheetStage open={s.open} size="panel" small openerForce={s.open ? undefined : s.f} />
      )}
    />
  );
}

function SizeDemo() {
  return (
    <Playback<{ size: SheetSize; f?: Force }>
      initial={{ size: "panel" }}
      script={[
        { at: 700, set: { f: "hover" } },
        { at: 1100, set: { f: "active", size: "wide" } },
        { at: 1300, set: { f: "hover" } },
        { at: 2500, set: { f: "active", size: "full" } },
        { at: 2700, set: { f: "hover" } },
        { at: 4000, set: { f: "active", size: "panel" } },
        { at: 4200, set: { f: undefined } },
      ]}
      tail={900}
      hint="Кнопка в шапке: panel → wide → весь экран → обратно. Иконка и подпись меняются вместе с шагом."
      render={(s) => (
        <SheetStage open size={s.size} sheetProps={{ noAnim: true, sizeForce: s.f }} />
      )}
    />
  );
}

function CloseDemo() {
  return (
    <Playback<{ p: "open" | "out" | "closed"; f?: Force }>
      initial={{ p: "open" }}
      script={[
        { at: 800, set: { f: "hover" } },
        { at: 1300, set: { f: "active" } },
        { at: 1500, set: { p: "out", f: undefined } },
        { at: 1700, set: { p: "closed" } },
      ]}
      tail={1300}
      render={(s) => (
        <SheetStage
          open={s.p !== "closed"}
          out={s.p === "out"}
          size="panel"
          small
          openerForce={s.p === "closed" ? "focus" : undefined}
          sheetProps={{ noAnim: true, closeForce: s.f }}
        />
      )}
    />
  );
}

function TrapDemo() {
  return (
    <Playback<{ at: 0 | 1 | 2 | 3 | 4 }>
      initial={{ at: 0 }}
      script={[
        { at: 600, set: { at: 1 } },
        { at: 1300, set: { at: 2 } },
        { at: 2000, set: { at: 3 } },
        { at: 2700, set: { at: 4 } },
      ]}
      tail={900}
      hint="Фокус по кругу: поле → «Отмена» → «Сохранить» → «Развернуть» → «Закрыть» → снова поле."
      render={(s) => {
        const f = (n: number): Force | undefined => (s.at === n ? "focus" : undefined);
        return (
          <SheetStage
            open
            size="panel"
            small
            sheetProps={{
              noAnim: true,
              sizeForce: f(3),
              closeForce: f(4),
              footerButtons: (
                <>
                  <Btn force={f(1)}>Отмена</Btn>
                  <Btn variant="primary" force={f(2)}>
                    Сохранить
                  </Btn>
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}

export default defineDoc({
  id: "sheet",
  title: "Sheet",
  group: "overlays",
  cssPrefix: "ds-sheet",
  order: 40,
  keywords: [
    "панель",
    "боковая панель",
    "шторка",
    "выезжающая панель",
    "выезжающая",
    "карточка",
    "агент",
    "sheet",
    "drawer",
    "side panel",
    "sidebar",
    "slide-over",
    "offcanvas",
  ],
  summary:
    "Боковая панель от правого края с крестом. Три режима: panel 430, wide 760, на весь экран. Для карточек, длинных форм и панели агента.",
  purpose:
    "Sheet показывает объект или процесс рядом со страницей, не уводя с неё: карточку груза, длинную форму, переписку с агентом. В отличие от Dialog он не требует мгновенного решения: его можно развернуть, прочитать, закрыть крестом или Esc. Короткий вопрос — Dialog, пояснение у элемента — Popover.",
  related: ["dialog", "agent-tab", "agent-panel", "button"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-sheet-scrim", side: "t" },
          { n: 2, anchor: ".ds-sheet", side: "l" },
          { n: 3, anchor: ".ds-sheet__header", side: "l" },
          { n: 4, anchor: ".ds-sheet__actions .ds-btn:last-child", side: "t" },
          { n: 5, anchor: ".ds-sheet__main", side: "r" },
          { n: 6, anchor: ".ds-sheet__footer", side: "r" },
        ]}
      >
        <SheetStage open size="panel" opener={<span />} sheetProps={{ noAnim: true }} />
      </Marks>
    ),
    parts: [
      {
        name: "Затемнение",
        description:
          "Слой --overlay на весь экран, z-index 800; клик по нему закрывает панель. В режиме full прозрачность 0, клики не ловит.",
      },
      {
        name: "Панель",
        description:
          "От края до края по высоте, без скруглений, фон --surface, тень --shadow-dialog и линия слева; ширина 430 / 760 / 100 %, не шире экрана − 32 (кроме full).",
      },
      {
        name: "Шапка",
        description:
          "Заголовок 18 px, 700, описание --text-2 под ним, справа «развернуть» и «закрыть» (ghost, квадратные md). Отступы 14 16 14 24, линия снизу.",
      },
      { name: "Крест", description: "Всегда есть; Esc и клик по затемнению дублируют его." },
      {
        name: "Середина",
        description:
          "Прокручивается, отступы 24, интервал 16. В full содержимое центрируется колонкой до 820 px.",
      },
      {
        name: "Подвал",
        description:
          "Две кнопки 50/50: «Отмена» слева, «Сохранить» справа. Нужен, если в панели есть правка.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "panel",
      title: "panel · 430",
      description:
        "Узкая панель справа: карточка объекта, короткая форма. Страница остаётся видна и затемнена.",
      when: "по умолчанию.",
      demo: <SheetMini mode="panel" />,
    },
    {
      id: "wide",
      title: "wide · 760",
      description: "Широкая панель: таблица внутри карточки, длинная переписка.",
      when: "нужна ширина, но контекст страницы всё ещё важен.",
      demo: <SheetMini mode="wide" />,
    },
    {
      id: "full",
      title: "full · весь экран",
      description:
        "Панель занимает окно целиком; затемнения нет; содержимое колонкой до 820 px по центру.",
      when: "работа без отвлечения: агент в режиме чата, объёмная форма.",
      demo: <SheetMini mode="full" />,
    },
    {
      id: "live",
      title: "Живая панель",
      description:
        "Откройте, раскройте до full, закройте крестом, Esc или кликом по затемнению. Tab ходит по кругу внутри панели.",
      when: "проверить режимы и клавиатуру.",
      demo: <SheetLive />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Панель открыта, фокус в первом поле формы.",
      demo: <Short />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover кнопок шапки",
      note: "Слой 9 % на «развернуть» и «закрыть»; сама панель от hover не меняется.",
      forced: true,
      demo: <Flow sizeForce="hover" closeForce="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 12 % при нажатии.",
      forced: true,
      demo: <Flow sizeForce="active" closeForce="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus на кнопке; Tab ходит по кругу внутри панели.",
      forced: true,
      demo: <Flow sizeForce="focus" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled «Сохранить»",
      note: "Нечего сохранять или форма невалидна: кнопка отключена своими цветами. [TODO] в макете «Сохранить» всегда доступна; предложено словарём.",
      demo: (
        <Flow
          buttons={
            <>
              <Btn>Отмена</Btn>
              <Btn variant="primary" disabled>
                Сохранить
              </Btn>
            </>
          }
        />
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Сохранение: «Сохранить» с Spinner (aria-busy), «Отмена» отключена; панель остаётся. [TODO] предложено словарём.",
      demo: (
        <Flow
          buttons={
            <>
              <Btn disabled>Отмена</Btn>
              <Btn variant="primary" loading>
                Сохраняем
              </Btn>
            </>
          }
        />
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Alert err вверху содержимого: «Не удалось сохранить», данные формы остаются. [TODO] предложено словарём.",
      demo: (
        <Flow
          body={
            <DemoAlert
              tone="err"
              layout="stacked"
              title="Не удалось сохранить"
              hint="ПО таможни не отвечает. Изменения не потеряны."
              actions={[{ text: "Повторить" }]}
            />
          }
        />
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Нечего показать (например, переписки нет): в середине пустое состояние с одним действием. [TODO] словарь предлагает, в макете пустой карточки нет.",
      demo: (
        <Flow
          body={
            <div
              style={{
                textAlign: "center",
                color: "var(--text-2)",
                display: "grid",
                gap: 6,
                padding: "12px 0",
              }}
            >
              <b style={{ color: "var(--text)" }}>Документов пока нет</b>
              <span>Загрузите накладную, и она появится здесь.</span>
            </div>
          }
        />
      ),
    },
  ],
  rules: {
    use: [
      "Крест всегда в шапке; он дублируется Esc и кликом по затемнению.",
      "Режим выбирайте по содержимому: panel для карточки, wide для таблицы, full для работы без контекста.",
      "Правка внутри панели — подвал с «Отмена» слева и «Сохранить» справа.",
      "Запоминайте режим для агента (panel/wide/full) между открытиями [TODO].",
      "Один Sheet на экран; открытие нового заменяет прежний.",
    ],
    avoid: [
      "Решение «да/нет» в Sheet: для него Dialog.",
      "Форма короче четырёх полей: хватит Popover или Dialog.",
      "Креста без Esc: оба способа закрытия обязательны.",
      "Вкладывать Sheet в Sheet.",
      "Закрывать панель при ошибке сохранения: данные останутся нетронутыми, пока пользователь не решит.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=dialog, aria-modal, aria-labelledby",
      text: 'Панель — <aside role="dialog" aria-modal="true" aria-labelledby=… tabindex="-1">. Название — заголовок шапки. В макете aria-label фиксированный («Карточка», «Агент»).',
    },
    {
      kind: "focus",
      title: "Фокус-ловушка",
      text: "[TODO] в макете ловушки нет, хотя aria-modal=true. Предложение: Tab и Shift+Tab ходят по кругу внутри панели, страница под ней — inert. Исключение: язычок агента на левой кромке панели (см. AgentTab).",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус при открытии",
      text: "В первое поле формы (в макете — первый textarea) или в заголовок панели с tabindex=-1, если полей нет.",
    },
    {
      kind: "focus",
      title: "Куда возвращается при закрытии",
      text: "На элемент, открывший панель; в момент начала закрытия.",
    },
    {
      kind: "key",
      title: "Esc",
      text: "Закрывает панель, если сверху нет Dialog и поповера (Esc принадлежит верхнему слою). Крест и кнопка «Отмена» делают то же.",
    },
    {
      kind: "aria",
      title: "Кнопка «развернуть»",
      text: "aria-label меняется по шагу: «Расширить» → «На весь экран» → «Свернуть в панель»; иконка aria-hidden. Новый размер объявлять не нужно.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Заголовок --text на surface 16,5:1, описание --text-2 8,2:1 (тёмная 16,4:1 и 11,3:1). Затемнение 45 % на белом: 3,0:1 между панелью и страницей.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Выезд, смена ширины и затемнение — мгновенно.",
    },
  ],
  tokens: [
    {
      name: "--overlay",
      value: "rgba(14,20,28,.45) (тёмная rgba(0,0,0,.62))",
      usage: "Затемнение; в full — прозрачность 0",
      kind: "color",
    },
    {
      name: "--surface / --border / --divider",
      value: "#fff / #c6cdd6 / #e0e4e9",
      usage: "Фон, линия слева, линии между частями",
      kind: "color",
    },
    {
      name: "--shadow-dialog",
      value: "0 24px 64px · 0 2px 6px",
      usage: "Тень панели",
      kind: "shadow",
    },
    {
      name: "width",
      value: "430 · 760 px · 100 %",
      usage: "panel · wide · full; max-width: 100 % − 32 (кроме full)",
      kind: "size",
    },
    { name: "header padding", value: "14 16 14 24", usage: "Шапка", kind: "size" },
    {
      name: "body padding / gap",
      value: "24 / 16 px",
      usage: "Середина; в full колонка ≤ 820 px",
      kind: "size",
    },
    { name: "z-index", value: "800", usage: "Как Dialog; язычок агента 810", kind: "other" },
    { name: "slide in", value: "300 мс, --ease", usage: "translate 100 % → 0", kind: "time" },
    {
      name: "width",
      value: "300 мс, --ease",
      usage: "Смена режима: width и max-width",
      kind: "time",
    },
    { name: "slide out", value: "200 мс, --ease", usage: "translate 0 → 100 %", kind: "time" },
    {
      name: "scrim",
      value: "300 мс ease (in), 200 мс (out, full)",
      usage: "Затемнение",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "open",
      title: "Открытие",
      trigger: "нажатие на кнопку, открывающую панель",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Запоминается элемент в фокусе. Слой (z-index 800) и панель вставляются в body.",
          prop: "—",
        },
        { at: 0, dur: 300, what: "Затемнение: opacity 0 → 1.", prop: "opacity", easing: "ease" },
        {
          at: 0,
          dur: 300,
          what: "Панель выезжает справа: translate 100 % → 0.",
          prop: "translate",
          easing: "--ease",
        },
        {
          at: 300,
          dur: 0,
          what: "Фокус уходит в первое поле формы (в макете — textarea).",
          prop: "focus",
        },
      ],
      focus:
        "С кнопки-источника в первое поле (или заголовок панели). Ловушка включается при открытии.",
      reducedMotion: "Панель и затемнение появляются мгновенно.",
      neighbours:
        "Страница не сдвигается: панель накладывается поверх (z-index 800, как Dialog), под ней inert. Язычок агента (810) при открытой панели агента прилипает к её кромке.",
      demo: <OpenDemo />,
    },
    {
      id: "size",
      title: "Смена режима panel → wide → full",
      trigger: "нажатие «развернуть» в шапке",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка: слой hover → active.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 300,
          what: "Ширина панели идёт 430 → 760 → 100 % (max-width переходит синхронно, у full снимается).",
          prop: "width, max-width",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Иконка и подпись кнопки меняются на следующий шаг: развернуть → расширить → свернуть. Подсказка скрывается.",
          prop: "—",
        },
        {
          at: 0,
          dur: 200,
          what: "На full затемнение гаснет 1 → 0 и перестаёт ловить клики.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "В full содержимое и подвал центрируются колонкой до 820 px; у агента появляется история чатов слева.",
          prop: "—",
        },
        {
          at: 300,
          dur: 0,
          what: "После перехода (320 мс) пересчитывается положение язычка агента.",
          prop: "—",
        },
      ],
      focus:
        "Остаётся на кнопке «развернуть»: она не перерисовывается целиком, меняются иконка и подпись.",
      reducedMotion: "Режим меняется мгновенно.",
      neighbours:
        "Содержимое перекладывается в процессе перехода ширины: у таблиц фиксируйте ширину колонок. Страница под панелью не реагирует.",
      demo: <SizeDemo />,
    },
    {
      id: "close",
      title: "Закрытие",
      trigger: "крест / «Отмена» / Esc / клик по затемнению",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка получает hover и active.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Фокус сразу возвращается на кнопку-источник; слушатели сняты.",
          prop: "focus",
        },
        {
          at: 0,
          dur: 200,
          what: "Панель уходит вправо: translate 0 → 100 %.",
          prop: "translate",
          easing: "--ease",
        },
        { at: 0, dur: 200, what: "Затемнение: opacity → 0.", prop: "opacity", easing: "ease" },
        { at: 200, dur: 0, what: "Узлы удаляются, inert со страницы снят.", prop: "—" },
      ],
      focus: "На кнопку-источник в момент начала закрытия.",
      reducedMotion: "Мгновенно.",
      neighbours: "Затемнение и панель уходят одновременно; страница остаётся как была.",
      demo: <CloseDemo />,
    },
    {
      id: "trap",
      title: "Фокус-ловушка",
      trigger: "Tab / Shift+Tab при открытой панели",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Список фокусируемых: поля, «Отмена», «Сохранить», «Развернуть», «Закрыть»; порядок DOM.",
          prop: "—",
        },
        {
          at: 2700,
          dur: 0,
          what: "С последнего элемента Tab возвращает фокус на первый, Shift+Tab — с первого на последний.",
          prop: "focus",
        },
        {
          at: 0,
          dur: 0,
          what: "Страница под панелью inert: мышь и клавиатура до неё не доходят.",
          prop: "—",
        },
      ],
      focus:
        "Не выходит за панель. Исключение — язычок агента [TODO] если он остаётся вне ловушки, решение по aria-modal нужно принять.",
      reducedMotion: "Не зависит от анимации.",
      neighbours:
        "Dialog и Popover, открытые поверх панели, забирают ловушку на себя; после их закрытия она возвращается панели.",
      demo: <TrapDemo />,
    },
  ],
  examples: [
    {
      id: "cargo",
      title: "Карточка груза",
      demo: <CargoSheetExample />,
      code: `<Button variant="outline" onClick={() => setOpen(true)}>Открыть карточку</Button>

<Sheet
  open={open}
  onOpenChange={setOpen}
  title="Груз MSKU4821907"
  description="ООО «Дальснаб» · Нинбо → Владивосток"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
      <Button onClick={save}>Сохранить</Button>
    </>
  }
>
  <CargoDetails />
</Sheet>`,
    },
  ],
});
