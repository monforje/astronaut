/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoBadge } from "../badge/demo";
import { DemoAvatar } from "../avatar/demo";
import { Sk, SkChart, SkGroup, SkRow, type SkAnim } from "./demo";

const PEOPLE: [string, string][] = [
  ["Ирина Петрова", "Оформление"],
  ["Алексей Крылов", "Брокер"],
  ["Мария Новикова", "Оформление"],
];

function LoadedRows() {
  return (
    <div className="ds-skel-group">
      {PEOPLE.map(([n, r]) => (
        <div className="ds-skel-row ds-skel-reveal" key={n}>
          <DemoAvatar name={n} size="lg" />
          <span className="ds-skel-col" style={{ gap: 0 }}>
            <b>{n}</b>
            <small style={{ color: "var(--text-2)" }}>{r}</small>
          </span>
          <DemoBadge size="sm" form="plain" tone="ok">
            Онлайн
          </DemoBadge>
        </div>
      ))}
    </div>
  );
}

function List({ anim = "wave" as SkAnim | "none", loading = true }) {
  return (
    <div style={{ width: 300, maxWidth: "100%" }}>
      {loading ? (
        <SkGroup anim={anim}>
          {[0, 1, 2].map((i) => (
            <SkRow key={i} i={i} />
          ))}
        </SkGroup>
      ) : (
        <LoadedRows />
      )}
    </div>
  );
}

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function SwapDemo() {
  return (
    <Playback<{ loaded: boolean }>
      initial={{ loaded: false }}
      script={[{ at: 1600, set: { loaded: true } }]}
      tail={1200}
      hint="Предложение: данные проявляются за 200 мс на месте заглушек. В макете переключатель «Данные загружены» заменяет разметку сразу."
      render={(s) => <List loading={!s.loaded} />}
    />
  );
}

function WaveDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[{ at: 100, set: { n: 1 } }]}
      tail={4200}
      hint="Волна идёт бесконечно, пока контейнер aria-busy. Здесь — четыре секунды."
      render={(s) => (s.n ? <List /> : <List anim="none" />)}
    />
  );
}

function PulseDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[{ at: 100, set: { n: 1 } }]}
      tail={3600}
      hint="Альтернатива волне: все блоки мигают вместе, 1,1 с."
      render={(s) => (s.n ? <List anim="pulse" /> : <List anim="none" />)}
    />
  );
}

function TableDemo() {
  return (
    <Playback<{ loaded: boolean }>
      initial={{ loaded: false }}
      script={[{ at: 1800, set: { loaded: true } }]}
      tail={1200}
      hint="Предложение: данные не сдвигают высоту строк: у заглушки и у данных одна высота."
      render={(s) => (
        <div style={{ width: 420, maxWidth: "100%", display: "grid", gap: 0 }}>
          {[0, 1, 2, 3].map((r) => (
            <div
              key={r}
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 0.7fr",
                gap: 16,
                alignItems: "center",
                height: 38,
                borderBottom: "1px solid var(--divider)",
              }}
            >
              {s.loaded ? (
                <>
                  <span className="ds-skel-reveal">MSKU48219{r}7</span>
                  <span className="ds-skel-reveal">ООО «Дальснаб»</span>
                  <span
                    className="ds-skel-reveal"
                    style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                  >
                    18 420
                  </span>
                </>
              ) : (
                <SkGroup>
                  <Sk w="70%" />
                </SkGroup>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "skeleton",
  title: "Skeleton",
  group: "feedback",
  cssPrefix: "ds-skel",
  order: 40,
  keywords: [
    "загрузка",
    "loading",
    "заглушка",
    "placeholder",
    "скелетон",
    "skeleton",
    "shimmer",
    "шиммер",
    "волна",
    "пульс",
    "pulse",
    "скелет",
    "ожидание данных",
    "load state",
  ],
  summary:
    "Заглушка в форме будущего содержимого: серые блоки с волной или пульсом, пока данные грузятся.",
  purpose:
    "Skeleton показывает, что здесь будет: строки, плитку, график, таблицу. Страница не прыгает, когда приходят данные, потому что заглушки занимают ровно те же размеры. Для индикации «идёт процесс неопределённой длины» берите Spinner, для известной доли — Progress.",
  related: ["card", "data-table", "chart", "spinner", "loader", "progress"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-skel-group", side: "t" },
          { n: 2, anchor: ".ds-skel--round", side: "l" },
          { n: 3, anchor: ".ds-skel-col .ds-skel", side: "b" },
          { n: 4, anchor: ".ds-skel--item", side: "r" },
        ]}
      >
        <div style={{ width: 300, maxWidth: "100%" }}>
          <SkGroup>
            <SkRow />
          </SkGroup>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Группа",
        description:
          "Контейнер с aria-busy=true и data-anim (wave или pulse). Внутри — скрытая подпись «Загрузка…» для скринридера.",
      },
      {
        name: "Круг",
        description:
          "Аватар, значок: border-radius 50 %, размер как у настоящего (32 px для аватара md).",
      },
      {
        name: "Строка текста",
        description:
          "Высота 12 (заголовок) и 10–11 (подпись), радиус 4; ширина 38–100 %, чтобы строки отличались.",
      },
      {
        name: "Плашка",
        description: "Радиус 8: кнопка, бейдж, плитка, столбик графика.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "list",
      title: "Список",
      description:
        "Круг 32 + две строки + плашка бейджа. Ширина первой строки меняется (70 % / 55 %).",
      when: "список людей, документов, событий.",
      demo: <List />,
    },
    {
      id: "card",
      title: "Карточка",
      description: "Заголовок 14, три строки 11 и два блока-кнопки 28 в подвале 50/50.",
      when: "карточка расхождения, KPI-плитка.",
      demo: (
        <div style={{ width: 280, maxWidth: "100%" }}>
          <SkGroup>
            <Sk w="45%" h={14} />
            <Sk h={11} />
            <Sk w="92%" h={11} />
            <Sk w="60%" h={11} />
            <div className="ds-skel-btns">
              <Sk h={28} shape="item" />
              <Sk h={28} shape="item" />
            </div>
          </SkGroup>
        </div>
      ),
    },
    {
      id: "chart",
      title: "График",
      description:
        "Двенадцать столбиков разной высоты (радиус 8) вместо осей и линий: оси не рисуются, пока нет данных.",
      when: "LineChart, Donut, HBar до прихода данных.",
      demo: (
        <SkGroup>
          <SkChart />
        </SkGroup>
      ),
    },
    {
      id: "table",
      title: "Таблица",
      description:
        "Строки высотой 38: блок 70 % на ячейку. У DataTable — свой вариант заглушки со сдвигом анимации на 80 мс по строкам.",
      when: "первая загрузка списка.",
      demo: (
        <div style={{ width: 420, maxWidth: "100%" }}>
          <SkGroup>
            {[0, 1, 2, 3].map((r) => (
              <div
                key={r}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 0.7fr",
                  gap: 16,
                  alignItems: "center",
                  height: 38,
                  borderBottom: "1px solid var(--divider)",
                }}
              >
                <Sk w="70%" />
                <Sk w="60%" />
                <Sk w="50%" />
              </div>
            ))}
          </SkGroup>
        </div>
      ),
    },
    {
      id: "pulse",
      title: "Пульс вместо волны",
      description: "Те же блоки, но мигают целиком (прозрачность 100 → 45 %, 1,1 с).",
      when: "мелкие блоки, где волна читается плохо; один вид анимации на экран.",
      demo: <List anim="pulse" />,
    },
  ],
  sizes: [
    {
      id: "heights",
      title: "Высоты блоков",
      value: "10 · 11 · 12 · 14 · 28 · 32",
      note: "как у настоящего элемента",
      demo: (
        <SkGroup>
          <Sk w={160} h={10} />
          <Sk w={160} h={12} />
          <Sk w={160} h={14} />
          <Sk w={160} h={28} shape="item" />
        </SkGroup>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Волна",
      note: "Фон --tone, поверх полоса ink 9 % слева направо за 1,4 с, бесконечно.",
      demo: <List />,
    },
    {
      id: "pulse",
      kind: "loading",
      title: "Пульс",
      note: "Прозрачность 100 → 45 → 100 % за 1,1 с.",
      demo: <List anim="pulse" />,
    },
    {
      id: "static",
      kind: "other",
      title: "Без анимации",
      note: "prefers-reduced-motion или anim=none: статичные блоки --tone.",
      demo: <List anim="none" />,
    },
    {
      id: "loaded",
      kind: "other",
      title: "Данные пришли",
      note: "Контейнер снимает aria-busy, заглушки заменены содержимым тех же размеров.",
      demo: <List loading={false} />,
    },
    NA("hover", "hover", "Hover", "Заглушка не интерактивна: курсор обычный, слоя нет."),
    NA("active", "active", "Active", "Нет: ничего нельзя нажать."),
    NA("focus", "focus", "Focus", "Не в Tab, aria-hidden у блоков."),
    NA("disabled", "disabled", "Disabled", "Нет: недоступное показывают как есть, не заглушкой."),
    NA(
      "error",
      "error",
      "Error",
      "Ошибка загрузки заменяет заглушку: Alert или состояние error компонента. Skeleton вечно не крутят.",
    ),
    NA(
      "empty",
      "empty",
      "Empty",
      "Пустой результат — состояние empty самого компонента, не заглушка.",
    ),
  ],
  choreography: [
    {
      id: "wave",
      title: "Волна",
      trigger: "блок вошёл в состояние loading (aria-busy)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 1400,
          what: "Полоса градиента ink 9 % едет слева направо через каждый блок по отдельности (translate -100 % → 100 %).",
          prop: "translate (::after)",
          easing: "ease-in-out",
        },
        { at: 1400, dur: 0, what: "Цикл повторяется, пока идёт загрузка.", prop: "—" },
      ],
      focus: "Заглушка не получает фокус; фокус на соседних элементах не теряется.",
      reducedMotion:
        "Волна выключается: остаются статичные блоки --tone. (В макете: animation: none.)",
      neighbours:
        "Блоки не меняют размеры, анимация внутри каждого блока (overflow: clip), соседи не реагируют.",
      demo: <WaveDemo />,
    },
    {
      id: "pulse",
      title: "Пульс",
      trigger: "data-anim=pulse на контейнере",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 550,
          what: "Прозрачность блоков падает с 100 % до 45 %.",
          prop: "opacity",
          easing: "ease-in-out",
        },
        {
          at: 550,
          dur: 550,
          what: "Возвращается к 100 %; повтор.",
          prop: "opacity",
          easing: "ease-in-out",
        },
      ],
      focus: "Не применимо.",
      reducedMotion: "Пульс выключен: статичные блоки.",
      neighbours: "Мигают все блоки группы одновременно; соседние компоненты не затрагиваются.",
      demo: <PulseDemo />,
    },
    {
      id: "swap",
      title: "Заглушка → данные",
      trigger: "данные получены",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "aria-busy снимается; заглушки заменяются содержимым тех же размеров, строки не сдвигаются.",
          prop: "разметка",
        },
        {
          at: 0,
          dur: 200,
          what: "Новое содержимое проявляется.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Минимальное время показа заглушки — 300 мс, чтобы быстрый ответ не мигал. [TODO] подтвердить значение.",
          prop: "—",
        },
      ],
      focus:
        "Если фокус был в соседнем элементе — остаётся. Фокус внутрь новых данных не переносится.",
      reducedMotion: "Проявление отключается: данные появляются сразу.",
      neighbours: "Размеры заглушки совпадают с данными, соседи не прыгают.",
      demo: <SwapDemo />,
    },
    {
      id: "table-swap",
      title: "Строки таблицы",
      trigger: "первая загрузка списка",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 1800,
          what: "Четыре строки по 38 px с блоками 70 %, 60 %, 50 % в ячейках.",
          prop: "—",
        },
        {
          at: 1800,
          dur: 200,
          what: "Данные проявляются, высота строк не меняется.",
          prop: "opacity",
          easing: "ease",
        },
      ],
      focus: "Не применимо.",
      reducedMotion: "Волны нет, проявления нет.",
      neighbours: "Шапка и подвал таблицы стоят на месте, как и колонки.",
      demo: <TableDemo />,
    },
  ],
  rules: {
    use: [
      "Повторять форму будущего содержимого: круг под аватар, строки под текст, плашки под бейджи.",
      "Ставить aria-busy на контейнер, а не на каждый блок.",
      "Сохранять размеры: данные приходят без смещения макета.",
      "Один вид анимации на экране: волна или пульс.",
      "Показывать заглушку только пока ответа нет; при ошибке — состояние error.",
    ],
    avoid: [
      "Крутить заглушку без конца: у загрузки должен быть таймаут и состояние error.",
      "Заглушка не по форме: один большой прямоугольник вместо карточки.",
      "Смешивать Skeleton и Spinner в одном блоке.",
      "Заглушка для действия (отправка формы): это loading кнопки.",
      "Свои цвета и градиенты: только --tone и слой ink 9 %.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "aria-busy",
      text: "У группы aria-busy=true, пока данные грузятся; блоки aria-hidden. После загрузки атрибут снимается.",
    },
    {
      kind: "aria",
      title: "Подпись «Загрузка…»",
      text: "Скрытый текст внутри группы для скринридера; при необходимости обновлять через aria-live у родителя.",
    },
    {
      kind: "key",
      title: "Клавиатура",
      text: "Заглушка не фокусируется. Фокус в соседних элементах не отбирается.",
    },
    {
      kind: "contrast",
      title: "Блоки",
      text: "Контраст блока --tone с --surface намеренно низкий: заглушка не несёт информации, ей достаточно быть заметной формой. [TODO] проверить заметность в светлой теме на экранах с низкой яркостью.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Волна и пульс выключены, остаются статичные блоки. (Макет сокращал анимацию до 3 с; в словаре она убрана совсем.)",
    },
  ],
  tokens: [
    { name: "--tone", value: "ink 7 %", usage: "Фон блока", kind: "color" },
    { name: "ink 9 %", value: "color-mix(--ink 9 %)", usage: "Полоса волны", kind: "color" },
    {
      name: "--r-control / --r-item",
      value: "4 / 8 px",
      usage: "Строка · плашка; круг 50 %",
      kind: "radius",
    },
    {
      name: "height",
      value: "10 · 11 · 12 · 14 · 28 · 32 px",
      usage: "Как у настоящего элемента",
      kind: "size",
    },
    { name: "wave", value: "1,4 с ease-in-out, бесконечно", usage: "Волна", kind: "time" },
    { name: "pulse", value: "1,1 с ease-in-out, 100 → 45 %", usage: "Пульс", kind: "time" },
    {
      name: "swap fade",
      value: "200 мс ease",
      usage: "Проявление данных (предложение)",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "list",
      title: "Список людей",
      demo: <List />,
      code: `<SkeletonGroup loading={isLoading}>
  <SkeletonRow />
</SkeletonGroup>`,
    },
    {
      id: "chart",
      title: "График",
      demo: (
        <SkGroup>
          <SkChart />
        </SkGroup>
      ),
      code: `{isLoading ? <SkeletonChart /> : <LineChart … />}`,
    },
  ],
});
