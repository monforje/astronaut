/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoSection, Hr, LabelSep, Toolbar, type SepForce } from "./demo";

const W = { width: "100%", maxWidth: 360 } as const;
const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function CollapseDemo() {
  return (
    <Playback<{ o: boolean; f?: SepForce }>
      initial={{ o: true }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 900, set: { o: false, f: "hover" } },
        { at: 1700, set: { f: undefined } },
        { at: 2200, set: { o: true } },
      ]}
      tail={800}
      render={(s) => (
        <div style={W}>
          <DemoSection open={s.o} force={s.f} />
        </div>
      )}
    />
  );
}

function AnimatedDemo() {
  return (
    <Playback<{ o: boolean }>
      initial={{ o: true }}
      script={[
        { at: 500, set: { o: false } },
        { at: 1700, set: { o: true } },
      ]}
      tail={900}
      hint="Предложение: содержимое сворачивается по высоте, как у Accordion."
      render={(s) => (
        <div style={W}>
          <DemoSection open={s.o} animate />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "separator",
  title: "Separator",
  group: "navigation",
  cssPrefix: "ds-sep",
  order: 40,
  keywords: [
    "разделитель",
    "линия",
    "черта",
    "hr",
    "divider",
    "separator",
    "rule",
    "раздел",
    "section",
    "заголовок раздела",
    "сворачивание",
    "вертикальный разделитель",
    "тулбар",
  ],
  summary:
    "Разделитель: тонкая линия между блоками, с подписью, вертикальная в тулбарах и заголовок раздела со сворачиванием.",
  purpose:
    "Линия — самый тихий способ сказать «здесь начинается другое». Она не заменяет заголовок и не рисует рамку. Горизонтальная делит блоки страницы и списки, вертикальная стоит между кнопками тулбара, а «раздел с заголовком» объединяет линию, подпись и кнопку сворачивания: так оформляют группы документов внутри карточки.",
  related: ["accordion", "scroll-area", "app-shell"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-sep-sec__btn", side: "t" },
          { n: 2, anchor: ".ds-sep-sec__h b", side: "t" },
          { n: 3, anchor: ".ds-sep-sec__h i", side: "t" },
          { n: 4, anchor: ".ds-sep-sec__rows", side: "r" },
          { n: 5, anchor: ".ds-sep-sec__s", side: "b" },
        ]}
      >
        <DemoSection summary />
      </Marks>
    ),
    parts: [
      {
        name: "Кнопка сворачивания",
        description:
          "Шеврон 12 px на подложке 20 px (радиус 4, отрицательный отступ −4 px, чтобы шеврон стоял по сетке). Открыто — шеврон вниз (поворот 90°).",
        optional: true,
      },
      {
        name: "Заголовок раздела",
        description: "Onest 700, в одну строку, без переноса.",
      },
      {
        name: "Линия",
        description:
          "1 px, --border (в разделе) или --divider (отдельный разделитель); тянется до края.",
      },
      {
        name: "Содержимое",
        description: "Ряды и поля раздела. Свёрнутый раздел оставляет только краткое содержание.",
      },
      {
        name: "Краткое содержание",
        description:
          "12 px, --text-3: «3 документа · 1 с расхождением». Показывается только в свёрнутом виде.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "line",
      title: "Линия и сильная линия",
      description: "1 px; обычная --divider, сильная --border.",
      when: "обычная — между строками и блоками; сильная — между крупными частями страницы или панелями.",
      demo: (
        <div style={{ ...W, display: "grid", gap: 16 }}>
          <Hr />
          <Hr strong />
        </div>
      ),
    },
    {
      id: "labelled",
      title: "С подписью",
      description: "Подпись по центру («или»), линии по бокам. 12 px, 600, --text-3.",
      when: "альтернативы: «Войти через 1С» — «или» — «Загрузить файл».",
      demo: (
        <div style={W}>
          <LabelSep>или</LabelSep>
        </div>
      ),
    },
    {
      id: "vertical",
      title: "Вертикальный",
      description: "1×20 px, отступы 6 px по бокам. Между кнопками тулбара.",
      when: "группы действий: «Фильтр | Колонки | Экспорт». Не для строк таблицы.",
      demo: <Toolbar />,
    },
    {
      id: "section",
      title: "Раздел с заголовком",
      description: "Заголовок, линия, кнопка сворачивания и краткое содержание в свёрнутом виде.",
      when: "группы внутри карточки груза: «Документы», «Участники». Если разделов несколько и они объёмные, берите Accordion.",
      demo: (
        <div style={W}>
          <DemoSection />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Линия статична. Состояния есть только у кнопки раздела.",
      demo: (
        <div style={W}>
          <DemoSection />
        </div>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover (кнопка)",
      note: "Подложка шеврона слоем 9 % (--layer-2).",
      forced: true,
      demo: (
        <div style={W}>
          <DemoSection force="hover" />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active (кнопка)",
      note: "Слой 12 % (--layer-3).",
      forced: true,
      demo: (
        <div style={W}>
          <DemoSection force="active" />
        </div>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus (кнопка)",
      note: "Кольцо 2 px --focus вокруг подложки шеврона.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoSection force="focus" />
        </div>
      ),
    },
    {
      id: "collapsed",
      kind: "selected",
      title: "Свёрнут",
      note: "aria-expanded=false, шеврон вправо, вместо рядов — краткое содержание.",
      demo: (
        <div style={W}>
          <DemoSection defaultOpen={false} />
        </div>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled (кнопка)",
      note: "Раздел нельзя свернуть: шеврон --text-ph. [TODO] предложение; в макете такого нет.",
      demo: (
        <div style={W}>
          <DemoSection disabled />
        </div>
      ),
    },
    NA(
      "loading",
      "loading",
      "Loading",
      "Линия не загружается. Загрузку показывает содержимое раздела (Skeleton).",
    ),
    NA(
      "error",
      "error",
      "Error",
      "Красной линии нет: ошибка выражается плашкой или текстом внутри раздела.",
    ),
    NA("empty", "empty", "Empty", "Пустой раздел не показывают; нет данных — нет заголовка."),
  ],
  rules: {
    use: [
      "Линией отделяйте группы, а не каждый элемент: чем меньше линий, тем спокойнее экран.",
      "Сильная линия (--border) — только между крупными частями; обычная — внутри.",
      "Вертикальный разделитель держите в тулбаре между группами по 2–4 кнопки.",
      "У раздела со сворачиванием всегда есть краткое содержание свёрнутого.",
      'Для декоративной линии ставьте role="none"; осмысленная — role="separator".',
    ],
    avoid: [
      "Рамки и линии вокруг каждой карточки и каждой строки: хватает отступов.",
      "Вертикальные разделители в таблице вместо колонок.",
      "Линия вместо заголовка: у группы без подписи читатель не поймёт, что это.",
      "Цветные линии: разделитель всегда нейтральный.",
      "Толщина больше 1 px: акцент — это не разделитель.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=separator",
      text: '<hr> по умолчанию имеет эту роль. Декоративную линию помечают role="none" или aria-hidden, чтобы её не объявляли. Вертикальный — aria-orientation="vertical".',
    },
    {
      kind: "aria",
      title: "Раздел: aria-expanded",
      text: "Кнопка сворачивания держит aria-expanded и aria-label «Свернуть: …» / «Развернуть: …»; название раздела в самом ярлыке.",
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "Сворачивают и разворачивают раздел. Линии в Tab не входят.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус",
      text: "Остаётся на кнопке раздела; при сворачивании содержимое выпадает из порядка Tab (display:none / inert).",
    },
    {
      kind: "contrast",
      title: "Контраст линий",
      text: "Линия — не носитель смысла: --divider (#e0e4e9) на белом 1,3:1, --border 1,7:1. Разделение не должно быть единственным признаком группы: рядом всегда отступ или заголовок. Подпись «или» --text-3 на --surface 4,9:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Шеврон поворачивается без перехода; плавное сворачивание высоты отключается.",
    },
  ],
  tokens: [
    {
      name: "--divider",
      value: "#e0e4e9 / #323e4b",
      usage: "Линия обычная, вертикальная, у подписи",
      kind: "color",
    },
    {
      name: "--border",
      value: "#c6cdd6 / #4d5b6b",
      usage: "Сильная линия; линия заголовка раздела",
      kind: "color",
    },
    {
      name: "--text-3",
      value: "#66727f",
      usage: "Подпись «или», краткое содержание",
      kind: "color",
    },
    {
      name: "--layer-2 / --layer-3",
      value: "9 % / 12 % ink",
      usage: "Hover/active кнопки раздела",
      kind: "color",
    },
    { name: "height", value: "1 px · 20 px", usage: "Горизонтальная · вертикальная", kind: "size" },
    { name: "margin", value: "0 6 px", usage: "Вертикальный разделитель", kind: "size" },
    {
      name: "--dur · --ease",
      value: "200 мс",
      usage: "Поворот шеврона раздела (rotate)",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "collapse",
      title: "Сворачивание раздела",
      trigger: "клик по кнопке раздела, Enter или Space",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: подложка шеврона.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 500,
          dur: 0,
          what: "Клик: aria-expanded=false, ряды исчезают, появляется краткое содержание. В макете содержимое перерисовывается сразу.",
          prop: "display",
        },
        {
          at: 500,
          dur: 200,
          what: "Шеврон поворачивается 90° → 0 (вправо).",
          prop: "rotate",
          easing: "--ease",
        },
        {
          at: 1300,
          dur: 0,
          what: "Повторный клик: возврат с поворотом шеврона и показом рядов.",
          prop: "display, rotate",
        },
      ],
      focus: "Остаётся на кнопке раздела.",
      reducedMotion: "Шеврон меняет положение мгновенно.",
      neighbours:
        "Блоки ниже сдвигаются мгновенно вслед за высотой раздела. [TODO] в макете нет плавности высоты; вариант ниже предложен.",
      demo: <CollapseDemo />,
    },
    {
      id: "animated",
      title: "Плавная высота (предложение)",
      trigger: "то же, но с анимацией содержимого",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Содержимое сворачивается: grid-template-rows 1fr→0fr, одновременно шеврон поворачивается.",
          prop: "grid-template-rows, rotate",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Краткое содержание появляется сразу и занимает место свёрнутого.",
          prop: "display",
        },
        {
          at: 1200,
          dur: 200,
          what: "Обратно: 0fr→1fr; краткое содержание скрывается.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
      ],
      focus: "Остаётся на кнопке.",
      reducedMotion: "Высота меняется мгновенно.",
      neighbours:
        "Соседние блоки сдвигаются плавно вместе с высотой, как под Accordion (250 мс там, 200 мс здесь: [TODO] выровнять).",
      demo: <AnimatedDemo />,
    },
  ],
  examples: [
    {
      id: "toolbar",
      title: "Тулбар списка",
      demo: <Toolbar />,
      code: `<div role="toolbar" aria-label="Действия со списком">
  <Button variant="ghost" size="sm">Фильтр</Button>
  <Separator orientation="vertical" decorative />
  <Button variant="ghost" size="sm">Колонки</Button>
</div>`,
    },
    {
      id: "section",
      title: "Раздел карточки",
      demo: (
        <div style={W}>
          <DemoSection />
        </div>
      ),
      code: `<SectionHeader title="Документы груза" summary="3 документа · 1 с расхождением">…</SectionHeader>`,
    },
  ],
});
