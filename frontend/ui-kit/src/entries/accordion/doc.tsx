/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { ACC_ITEMS, DOCS_ITEMS, DemoAccordion, type AccForce } from "./demo";

const W = { width: "100%", maxWidth: 420 } as const;

function OpenDemo() {
  return (
    <Playback<{ o: string[]; f?: Record<string, AccForce> }>
      initial={{ o: ["how"] }}
      script={[
        { at: 400, set: { f: { fix: "hover" } } },
        { at: 1000, set: { f: { fix: "active" } } },
        { at: 1150, set: { o: ["fix"], f: { fix: "hover" } } },
        { at: 2200, set: { f: undefined } },
        { at: 2600, set: { o: [] } },
      ]}
      tail={900}
      hint="Режим «один открытый»: открытие второй секции закрывает первую; затем закрытие."
      render={(s) => (
        <div style={W}>
          <DemoAccordion open={s.o} force={s.f} />
        </div>
      )}
    />
  );
}

function MultiDemo() {
  return (
    <Playback<{ o: string[] }>
      initial={{ o: ["nak"] }}
      script={[
        { at: 500, set: { o: ["nak", "dec"] } },
        { at: 1500, set: { o: ["nak", "dec", "inv"] } },
        { at: 2500, set: { o: ["dec", "inv"] } },
      ]}
      tail={900}
      render={(s) => (
        <div style={W}>
          <DemoAccordion items={DOCS_ITEMS} multiple cards open={s.o} />
        </div>
      )}
    />
  );
}

function KeyDemo() {
  return (
    <Playback<{ f?: Record<string, AccForce> }>
      initial={{}}
      script={[
        { at: 400, set: { f: { how: "focus" } } },
        { at: 1000, set: { f: { fix: "focus" } } },
        { at: 1600, set: { f: { int: "focus" } } },
        { at: 2200, set: { f: { how: "focus" } } },
      ]}
      tail={800}
      hint="↓ ↓ ↓: «Права доступа» (disabled) пропущена, после последней — снова первая."
      render={(s) => (
        <div style={W}>
          <DemoAccordion force={s.f} />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "accordion",
  title: "Accordion",
  group: "navigation",
  cssPrefix: "ds-acc",
  order: 30,
  wideDemos: { variants: true, states: true },
  keywords: [
    "раскрывающиеся секции",
    "аккордеон",
    "accordion",
    "collapse",
    "collapsible",
    "expand",
    "disclosure",
    "faq",
    "spoiler",
    "спойлер",
    "сворачиваемый блок",
    "раскрывающийся список",
    "секции",
  ],
  summary:
    "Раскрывающиеся секции: заголовок-кнопка и панель, высота которой плавно растёт. Режимы «один открытый» и «несколько».",
  purpose:
    "Аккордеон прячет второстепенное содержимое под заголовками, чтобы длинная страница читалась по структуре: справка, документы груза, группы настроек. Заголовок всегда виден и объясняет, что внутри; справа можно показать краткое содержание («3 шага», «6»). Это не навигация и не вкладки: секции лежат на одной странице друг под другом.",
  related: ["separator", "tabs", "scroll-area"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-acc__i", side: "l" },
          { n: 2, anchor: ".ds-acc__t", side: "t" },
          { n: 3, anchor: ".ds-acc__ico", side: "l" },
          { n: 4, anchor: ".ds-acc__ad", side: "t" },
          { n: 5, anchor: ".ds-acc__cv", side: "r" },
          { n: 6, anchor: ".ds-acc__p", side: "r" },
        ]}
      >
        <DemoAccordion items={ACC_ITEMS.slice(0, 2)} defaultOpen={["how"]} />
      </Marks>
    ),
    parts: [
      {
        name: "Секция",
        description:
          "Контейнер пары «заголовок + панель». Секции разделены линией --divider (обычный вид) или рамкой с зазором 8 px (карточки).",
      },
      {
        name: "Заголовок-кнопка",
        description:
          "h4 > button на всю ширину, высота от 40 px, подложка с радиусом 8. Onest 600. aria-expanded, aria-controls.",
      },
      {
        name: "Значок",
        description: "16 px, --text-2, слева от заголовка.",
        optional: true,
      },
      {
        name: "Пояснение справа",
        description: "12 px, 400, --text-3: «3 шага», «ЭДО», «недоступно».",
        optional: true,
      },
      {
        name: "Шеврон",
        description: "16 px справа; при открытии поворачивается на 180°.",
      },
      {
        name: "Панель",
        description:
          "role=region, aria-labelledby на заголовок. Отступы 2/8/14 px, текст --text-2, межстрочный 1,5. Высота анимируется.",
      },
    ],
  },
  variants: [
    {
      id: "single",
      title: "Один открытый",
      description: "Открытие секции закрывает остальные. Разделители — линии.",
      when: "справка и пояснения: пользователь читает одну секцию за раз.",
      demo: (
        <div style={W}>
          <DemoAccordion defaultOpen={["how"]} />
        </div>
      ),
    },
    {
      id: "multiple",
      title: "Несколько открытых · карточки",
      description:
        "Секции независимы; каждая — карточка с рамкой, открытая получает рамку --border-selected.",
      when: "документы груза рядом друг с другом, сравнение: нужно держать несколько открытыми.",
      demo: (
        <div style={W}>
          <DemoAccordion items={DOCS_ITEMS} multiple cards defaultOpen={["nak", "dec"]} />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Closed",
      note: "Шеврон вниз, панель высотой 0, внутри inert.",
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(0, 1)} />
        </div>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Подложка заголовка слоем 4 % (--layer-1).",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(0, 1)} force={{ how: "hover" }} />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 7 % (--layer-1p).",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(0, 1)} force={{ how: "active" }} />
        </div>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus внутри заголовка (offset −2): не обрезается соседями.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(0, 1)} force={{ how: "focus" }} />
        </div>
      ),
    },
    {
      id: "open",
      kind: "selected",
      title: "Open",
      note: "aria-expanded=true, шеврон вверх (180°), панель в полную высоту. В карточках рамка selected.",
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(0, 1)} defaultOpen={["how"]} />
        </div>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Текст и значок --text-ph, без hover; из Tab выпадает. В пояснении причина («недоступно»).",
      demo: (
        <div style={W}>
          <DemoAccordion items={ACC_ITEMS.slice(2, 3)} />
        </div>
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Панель открыта, внутри две заглушки-строки; заголовок активен. [TODO] предложение: в макете содержимое статично.",
      demo: (
        <div style={W}>
          <DemoAccordion
            items={ACC_ITEMS.slice(0, 1)}
            defaultOpen={["how"]}
            panelState={{ how: "loading" }}
          />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Панель открыта с сообщением --err-text и значком. Секция не становится красной. [TODO] предложение.",
      demo: (
        <div style={W}>
          <DemoAccordion
            items={ACC_ITEMS.slice(0, 1)}
            defaultOpen={["how"]}
            panelState={{ how: "error" }}
          />
        </div>
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Внутри строка --text-3 «Здесь пока ничего нет». Секцию с постоянно пустым содержимым лучше не показывать. [TODO] предложение.",
      demo: (
        <div style={W}>
          <DemoAccordion
            items={ACC_ITEMS.slice(0, 1)}
            defaultOpen={["how"]}
            panelState={{ how: "empty" }}
          />
        </div>
      ),
    },
  ],
  rules: {
    use: [
      "Заголовок называет содержимое («Что делать при расхождении»), пояснение справа даёт сводку.",
      "Один открытый — для текстов и справки; несколько — для данных, которые сравнивают.",
      "Первую или самую важную секцию открывайте по умолчанию.",
      "Недоступную секцию оставляйте серой с причиной в пояснении.",
      "Содержимое панели без собственной прокрутки: если секция длинная, это страница, а не аккордеон.",
    ],
    avoid: [
      "Аккордеон как навигация между экранами: это сайдбар или вкладки.",
      "Вложенные аккордеоны: двух уровней хватит группе и секции.",
      "Скрывать под ним действия, без которых нельзя завершить задачу.",
      "Заголовок-ссылка: клик раскрывает, а не уходит.",
      "Анимировать height в px: используем grid 0fr→1fr, чтобы высота считалась сама.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "aria-expanded, aria-controls",
      text: "У заголовка-кнопки aria-expanded и aria-controls на id панели; панель role=region с aria-labelledby на заголовок. Заголовок внутри h4 (уровень по месту: на странице с h2 — h3).",
    },
    {
      kind: "aria",
      title: "inert у закрытой панели",
      text: "Закрытая панель получает inert: её ссылки и поля не берут фокус и не читаются. [TODO] в макете панель только скрыта высотой 0, содержимое остаётся в Tab; это ошибка, исправлено в словаре.",
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "Раскрывают и сворачивают секцию.",
    },
    {
      kind: "key",
      title: "↓ / ↑",
      text: "Переход к следующему или предыдущему заголовку по кругу; disabled пропускаются (есть в макете).",
    },
    {
      kind: "key",
      title: "Home / End",
      text: "Первый и последний заголовок. [TODO] предложение.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус",
      text: "При раскрытии остаётся на заголовке: пользователь сам решает, идти ли внутрь по Tab. В режиме «один открытый» закрытая секция не уводит фокус.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "--text на --surface 15:1, пояснение --text-3 на --surface 4,9:1, disabled --text-ph около 3:1 (недоступное).",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Высота меняется мгновенно, шеврон без поворота-перехода.",
    },
  ],
  tokens: [
    { name: "min-height", value: "40 px", usage: "Заголовок", kind: "size" },
    { name: "--divider", value: "#e0e4e9 / #323e4b", usage: "Линии между секциями", kind: "color" },
    {
      name: "--border / --border-selected",
      value: "#c6cdd6 / teal 60 %",
      usage: "Рамка карточки · открытой карточки",
      kind: "color",
    },
    {
      name: "--layer-1 / --layer-1p",
      value: "4 % / 7 % ink",
      usage: "Hover и active заголовка",
      kind: "color",
    },
    {
      name: "--text / --text-2 / --text-3",
      value: "#15202b / #44505d / #66727f",
      usage: "Заголовок · панель · пояснение",
      kind: "color",
    },
    {
      name: "--r-item / --r-card",
      value: "8 / 10 px",
      usage: "Заголовок · карточка",
      kind: "radius",
    },
    { name: "--dur", value: "200 мс · --ease", usage: "Поворот шеврона (rotate)", kind: "time" },
    { name: "панель", value: "250 мс · --ease", usage: "grid-template-rows 0fr→1fr", kind: "ease" },
    { name: "--dur-f", value: "125 мс", usage: "Подложка hover", kind: "time" },
  ],
  choreography: [
    {
      id: "open",
      title: "Раскрытие секции",
      trigger: "клик, Enter или Space по заголовку",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: подложка заголовка (слой 4 %).",
          prop: "background",
          easing: "ease",
        },
        { at: 750, dur: 125, what: "Нажатие: слой 7 %.", prop: "background", easing: "ease" },
        {
          at: 900,
          dur: 0,
          what: "aria-expanded переходит в true; в режиме «один открытый» у прежней секции — в false.",
          prop: "aria-expanded",
        },
        {
          at: 900,
          dur: 250,
          what: "Панель новой секции растёт: grid-template-rows 0fr→1fr; у закрывающейся — 1fr→0fr, одновременно.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        {
          at: 900,
          dur: 200,
          what: "Шеврон поворачивается на 180° (у закрывающейся — обратно).",
          prop: "rotate",
          easing: "--ease",
        },
        {
          at: 900,
          dur: 0,
          what: "Снимается inert у открытой панели, ставится у закрытой.",
          prop: "inert",
        },
      ],
      focus: "Остаётся на заголовке. Внутрь панели фокус сам не уходит.",
      reducedMotion: "Высота и шеврон меняются мгновенно.",
      neighbours:
        "Секции ниже сдвигаются вместе с ростом панели (обычный поток), без перекрытия. В «одном открытом» сумма высот почти не меняется: закрытие и открытие идут синхронно, страница не «прыгает».",
      demo: <OpenDemo />,
    },
    {
      id: "multi",
      title: "Несколько открытых",
      trigger: "клик по заголовкам карточек подряд",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 250,
          what: "Каждая карточка раскрывается независимо: 0fr→1fr.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Рамка открытой карточки уходит к --border-selected.",
          prop: "box-shadow",
          easing: "ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Шеврон поворачивается на 180°.",
          prop: "rotate",
          easing: "--ease",
        },
        {
          at: 2000,
          dur: 250,
          what: "Повторный клик сворачивает только эту карточку.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
      ],
      focus: "На заголовке нажатой секции.",
      reducedMotion: "Мгновенно.",
      neighbours: "Карточки ниже сдвигаются; зазор 8 px сохраняется.",
      demo: <MultiDemo />,
    },
    {
      id: "keys",
      title: "Перемещение по заголовкам",
      trigger: "↓ или ↑ при фокусе на заголовке",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Фокус переходит на следующий доступный заголовок; disabled пропускается.",
          prop: "focus",
        },
        {
          at: 0,
          dur: 125,
          what: "Кольцо фокуса рисуется на новом заголовке, на старом снимается.",
          prop: "outline",
        },
        {
          at: 1200,
          dur: 0,
          what: "За последним заголовком фокус возвращается к первому.",
          prop: "focus",
        },
      ],
      focus:
        "Только по заголовкам; содержимое панелей в этом цикле не участвует. Секции при этом не раскрываются.",
      reducedMotion: "Не затрагивается: анимации нет.",
      neighbours:
        "Страница не прокручивается стрелками (preventDefault), но фокус сам подтягивает заголовок в область видимости.",
      demo: <KeyDemo />,
    },
  ],
  examples: [
    {
      id: "help",
      title: "Справка",
      demo: (
        <div style={W}>
          <DemoAccordion defaultOpen={["how"]} />
        </div>
      ),
      code: `<Accordion type="single" defaultValue={["how"]}>
  <AccordionItem value="how" icon={<LinkIcon />} hint="3 шага" title="Как работает сверка">…</AccordionItem>
  <AccordionItem value="acl" disabled title="Права доступа" hint="недоступно" />
</Accordion>`,
    },
    {
      id: "docs",
      title: "Документы груза",
      demo: (
        <div style={W}>
          <DemoAccordion items={DOCS_ITEMS} multiple cards defaultOpen={["dec"]} />
        </div>
      ),
      code: `<Accordion type="multiple" variant="cards" defaultValue={["dec"]}>…</Accordion>`,
    },
  ],
});
