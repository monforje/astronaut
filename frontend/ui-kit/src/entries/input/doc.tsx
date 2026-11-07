/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Icon } from "@/engine/Icon";
import { Playback, type PlaybackStep } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoContainerField,
  DemoInlineInput,
  DemoInput,
  DemoSearchInput,
  type InputForce,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function typing(text: string, from: number): PlaybackStep<{ v: string; f?: InputForce }>[] {
  return [...text].map((_, i) => ({ at: from + i * 120, set: { v: text.slice(0, i + 1) } }));
}

function FocusDemo() {
  return (
    <Playback<{ f?: InputForce }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1200, set: { f: "focus" } },
        { at: 2800, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <DemoInput
          label="Поиск контейнера"
          lead="search"
          placeholder="Найти груз"
          kbd="/"
          force={s.f}
        />
      )}
    />
  );
}

function ValidateDemo() {
  const script: PlaybackStep<{ v: string; f?: InputForce }>[] = [
    { at: 300, set: { f: "focus" } },
    ...typing("MSKU4821907", 800),
  ];
  return (
    <Playback<{ v: string; f?: InputForce }>
      initial={{ v: "" }}
      script={script}
      tail={1200}
      hint="Нужно 4 буквы и 7 цифр: пока введено меньше, под полем ошибка с числом символов; на 11-м символе она уходит."
      render={(s) => <DemoContainerField value={s.v} force={s.f} />}
    />
  );
}

function ClearDemo() {
  return (
    <Playback<{ v: string; f?: InputForce; hv?: "hover" }>
      initial={{ v: "Дальснаб" }}
      script={[
        { at: 400, set: { f: "focus" } },
        { at: 1200, set: { hv: "hover" } },
        { at: 1800, set: { v: "", hv: undefined } },
      ]}
      tail={900}
      hint="Предложение: × стирает текст и возвращает фокус в поле; без текста × не показывается."
      render={(s) => (
        <DemoInput
          label="Клиент"
          lead="search"
          clear
          value={s.v}
          placeholder="Название или ИНН"
          force={s.f}
          clearForce={s.hv}
        />
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Обычное",
    note: "Рамка 1px --border, фон --field, подпись над полем, подсказка под ним.",
    demo: <DemoInput label="Номер контейнера" placeholder="MSKU4821907" hint="4 буквы и 7 цифр" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Рамка темнеет до --text-3.",
    forced: true,
    demo: <DemoInput label="Hover" defaultValue="MSKU48" force="hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Отдельного вида нет: нажатие ставит курсор, и поле переходит в фокус. [TODO] подтвердить.",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Рамка --focus и ореол 3px --selected вокруг. Значок слева переходит в --link. Показывается и на клик, и на Tab.",
    forced: true,
    demo: <DemoInput label="Focus" defaultValue="MSKU48" force="focus" lead="search" />,
  },
  {
    id: "error",
    kind: "error",
    title: "Ошибка",
    note: "Рамка --danger, под полем текст --err-text 500. В фокусе ореол 3px красный (danger 22 %).",
    demo: (
      <DemoInput
        label="Ошибка"
        defaultValue="MSKU48219"
        invalid
        error="Нужно 11 символов, сейчас 9"
      />
    ),
  },
  {
    id: "error-focus",
    kind: "error",
    title: "Ошибка в фокусе",
    note: "Красная рамка сохраняется, ореол переходит с teal на красный.",
    forced: true,
    demo: <DemoInput label="Ошибка в фокусе" defaultValue="MSKU48219" invalid force="focus" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Фон прозрачный, рамка --divider, текст --text-ph, курсор default. Для значений, которые заполняет система.",
    demo: <DemoInput label="Недоступно" defaultValue="Заполняется из 1С" disabled />,
  },
  {
    id: "empty",
    kind: "empty",
    title: "Пустое",
    note: "Placeholder --text-ph подсказывает формат (MSKU4821907), а не повторяет подпись. Кнопка очистки скрыта.",
    demo: <DemoInput label="Пустое" placeholder="MSKU4821907" lead="search" clear />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете. Поле не показывает ожидание. [TODO] для проверки на сервере (уникальность номера) решить: значок-спиннер справа и aria-busy.",
  ),
];

export default defineDoc({
  id: "input",
  title: "Input",
  group: "fields",
  cssPrefix: "ds-input",
  order: 10,
  keywords: [
    "поле",
    "поле ввода",
    "инпут",
    "текстовое поле",
    "ввод",
    "text field",
    "text input",
    "input",
    "textarea",
    "многострочное",
    "search",
    "поиск",
    "inline",
    "ошибка",
  ],
  summary:
    "Текстовое поле: с подписью и подсказкой, с значком, единицей и ×, многострочное, inline и поиск над списком.",
  purpose:
    "Input принимает короткий текст или число: номер контейнера, вес, комментарий. Подпись всегда над полем, подсказка и ошибка под ним. Inline-поле правит значение прямо в тексте карточки; search фильтрует список без рамки. Для выбора из готовых значений берите Select, для даты DatePicker.",
  related: ["select", "checkbox", "button", "date-picker"],
  anatomy: {
    demo: (
      <div style={{ width: "100%", maxWidth: 320 }}>
        <Marks
          block
          items={[
            { n: 1, side: "r" },
            { n: 2, anchor: ".ds-input__label", side: "t" },
            { n: 3, anchor: ".ds-input__lead", side: "l" },
            { n: 4, anchor: ".ds-input__control", side: "t" },
            { n: 5, anchor: ".ds-input__unit", side: "b" },
            { n: 6, anchor: ".ds-input__hint", side: "b" },
          ]}
        >
          <div className="ds-input__field">
            <span className="ds-input__label">Вес</span>
            <label className="ds-input">
              <Icon name="search" size="sm" className="ds-input__lead" />
              <input
                type="text"
                className="ds-input__control ds-input__control--num"
                defaultValue="18 420"
                aria-label="Вес"
              />
              <span className="ds-input__unit">кг</span>
            </label>
            <span className="ds-input__hint">Брутто, по накладной</span>
          </div>
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Поле (field)",
        description:
          "Колонка: подпись, рамка, подсказка или ошибка; зазор 4. Растягивается на ширину контейнера.",
      },
      {
        name: "Подпись",
        description: "12 px 600 над рамкой. Обязательна: нет подписи — нужен aria-label.",
      },
      {
        name: "Значок слева",
        description:
          "14 px --text-3; в фокусе --link. Для поиска и поля с типом данных. Необязателен.",
        optional: true,
      },
      {
        name: "Ввод",
        description:
          "Рамка 1px, радиус 8, высота 32 (28 в compact), padding 0 12. Placeholder --text-ph. Числа выравниваются вправо, цифры табличные.",
      },
      {
        name: "Единица",
        description: "«кг», «м³» справа внутри рамки, --text-3. Необязательна.",
        optional: true,
      },
      {
        name: "Подсказка / ошибка",
        description:
          "Под рамкой 12 px: подсказка --text-3; при ошибке заменяется текстом --err-text. Ещё могут быть × (очистка) и подсказка клавиши (kbd).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "field",
      title: "Поле формы",
      description: "Подпись над рамкой, подсказка под ней. Высота 32.",
      when: "любая форма: номер, имя, ИНН.",
      demo: (
        <DemoInput label="Номер контейнера" placeholder="MSKU4821907" hint="4 буквы и 7 цифр" />
      ),
    },
    {
      id: "content",
      title: "Со значком, единицей и ×",
      description:
        "Значок слева, единица справа, очистка × у поиска. Числа выравниваются вправо (tabular-nums).",
      when: "поиск с фильтром по клиенту; вес и объём с единицей.",
      demo: (
        <div className="ds-input__demo">
          <DemoInput label="С лупой и ×" lead="search" clear defaultValue="Дальснаб" />
          <div className="ds-input__pair">
            <DemoInput label="Вес" num unit="кг" defaultValue="18 420" />
            <DemoInput label="Объём" num unit="м³" defaultValue="26,4" />
          </div>
        </div>
      ),
    },
    {
      id: "compact",
      title: "Compact · 28",
      description: "Высота 28 вместо 32. Та же рамка и ореол.",
      when: "фильтры над таблицей, плотные панели.",
      demo: <DemoInput label="Compact · 28" compact placeholder="Фильтр по клиенту" />,
    },
    {
      id: "area",
      title: "Textarea",
      description:
        "Несколько строк, padding 7 12, значки и единица прижаты вверх; ручки изменения размера нет.",
      when: "комментарий к грузу, примечание.",
      demo: <DemoInput label="Текст" area placeholder="Комментарий к грузу" />,
    },
    {
      id: "kbd",
      title: "С подсказкой клавиши",
      description: "Справа рамка 11 px с клавишей: «/» фокусирует поиск.",
      when: "глобальный поиск, где есть горячая клавиша. [TODO] в макете подсказка нарисована, но сама клавиша «/» не обработана.",
      demo: <DemoInput compact lead="search" placeholder="Найти груз" kbd="/" />,
    },
    {
      id: "inline",
      title: "Inline",
      description:
        "Поле как текст: на hover подложка --layer-1, в фокусе --layer-1p, ошибка — красная линия под текстом.",
      when: "правка значения прямо в карточке: название, получатель.",
      demo: (
        <>
          <DemoInlineInput defaultValue="ООО «Дальснаб»" label="Клиент" />
          <DemoInlineInput defaultValue="Hover" width={50} force="hover" label="Hover" />
          <DemoInlineInput defaultValue="Ошибка" width={60} invalid label="Ошибка" />
        </>
      ),
    },
    {
      id: "search",
      title: "Search",
      description:
        "Без рамки, лупа 16 px; подложка --layer-1 на hover и --layer-1p в фокусе. Лупа лежит на вертикали галочек списка под ним.",
      when: "поиск над списком или меню (Select с поиском использует тот же ряд).",
      demo: <DemoSearchInput />,
    },
  ],
  sizes: [
    {
      id: "md",
      title: "md",
      value: "32 px",
      note: "по умолчанию",
      demo: <DemoInput placeholder="md · 32" />,
    },
    {
      id: "compact",
      title: "compact",
      value: "28 px",
      note: "для фильтров",
      demo: <DemoInput compact placeholder="compact · 28" />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Обычное", "Hover", "Focus", "Ошибка", "Disabled"],
    rows: [
      {
        label: "field",
        cells: [
          <DemoInput key="a" defaultValue="MSKU48" />,
          <DemoInput key="b" defaultValue="MSKU48" force="hover" />,
          <DemoInput key="c" defaultValue="MSKU48" force="focus" />,
          <DemoInput key="d" defaultValue="MSKU48" invalid />,
          <DemoInput key="e" defaultValue="MSKU48" disabled />,
        ],
      },
      {
        label: "inline",
        cells: [
          <DemoInlineInput key="a" defaultValue="ООО «Дальснаб»" width={110} label="inline" />,
          <DemoInlineInput
            key="b"
            defaultValue="ООО «Дальснаб»"
            width={110}
            force="hover"
            label="inline hover"
          />,
          <DemoInlineInput
            key="c"
            defaultValue="ООО «Дальснаб»"
            width={110}
            force="focus"
            label="inline focus"
          />,
          <DemoInlineInput
            key="d"
            defaultValue="ООО «Дальснаб»"
            width={110}
            invalid
            label="inline ошибка"
          />,
          <span key="e" className="dx-sr">
            нет
          </span>,
        ],
      },
    ],
  },
  choreography: [
    {
      id: "focus",
      title: "Наведение и фокус",
      trigger: "курсор входит в поле, затем клик или Tab",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: рамка --border → --text-3.",
          prop: "border-color",
          easing: "ease",
        },
        {
          at: 800,
          dur: 125,
          what: "Фокус: рамка идёт к --focus, вокруг появляется ореол 3px --selected.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
        {
          at: 800,
          dur: 125,
          what: "Значок слева перекрашивается --text-3 → --link.",
          prop: "color",
          easing: "ease",
        },
        {
          at: 2400,
          dur: 125,
          what: "Потеря фокуса: ореол и цвета возвращаются.",
          prop: "border-color, box-shadow, color",
          easing: "ease",
        },
      ],
      focus:
        "Клик в любое место рамки (в том числе в padding и на значок) ставит курсор в input: рамка — это label. Кольца outline нет: роль кольца играет ореол.",
      reducedMotion: "Переходы отключены: рамка, ореол и значок меняются мгновенно.",
      neighbours:
        "Размеры не меняются: ореол рисуется box-shadow'ом и соседей не двигает. Но он выходит за рамку на 3px: между полями оставляйте зазор не меньше 8.",
      demo: <FocusDemo />,
    },
    {
      id: "validate",
      title: "Проверка при вводе",
      trigger: "ввод символа в поле «Номер контейнера»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Каждый символ приводится к верхнему регистру; проверка по шаблону: 4 буквы и 7 цифр.",
          prop: "value",
        },
        {
          at: 1000,
          dur: 125,
          what: "Введён хотя бы один неверный символ: рамка идёт к --danger, подсказка под полем заменяется текстом «Нужно 4 буквы и 7 цифр, сейчас N симв.» (сразу, без анимации); ореол в фокусе красный.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
        {
          at: 2100,
          dur: 125,
          what: "Введено верное (11 символов): рамка возвращается к --focus, возвращается подсказка «4 буквы и 7 цифр», кнопка «Продолжить» в диалоге разблокируется.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
      ],
      focus:
        "Остаётся в поле всё время ввода. Пустое поле ошибкой не считается: она появляется только когда что-то введено неверно.",
      reducedMotion: "Рамка меняет цвет мгновенно, текст сообщения заменяется как обычно.",
      neighbours:
        "Подсказка и ошибка занимают одну строку под полем и заменяют друг друга: высота формы не меняется. Если сообщение длиннее строки, формы ниже сдвигаются.",
      demo: <ValidateDemo />,
    },
    {
      id: "clear",
      title: "Очистка ×",
      trigger: "клик по × в поле поиска",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover на ×: подложка --layer-2 (20×20, радиус 4).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 0,
          what: "Клик: значение очищается, × исчезает вместе с текстом.",
          prop: "value",
        },
        {
          at: 600,
          dur: 0,
          what: "Фокус возвращается в input, курсор в пустом поле; список под полем переходит в «все».",
          prop: "focus",
        },
      ],
      focus:
        "После очистки фокус в поле, не на ×: иначе второй клик по пустому месту приходит в никуда. × в Tab входит (после input), Esc внутри поля тоже очищает. [TODO] в макете × нарисован, но не обработан.",
      reducedMotion: "Подложка кнопки меняется без перехода.",
      neighbours:
        "Единица справа остаётся на месте: × появляется внутри рамки, а ширина поля не меняется (отрицательный отступ −6 убирает сдвиг текста).",
      demo: <ClearDemo />,
    },
  ],
  rules: {
    use: [
      "Подпись над полем всегда: placeholder её не заменяет.",
      "Placeholder показывает формат (MSKU4821907), а не повторяет подпись.",
      "Подсказка о формате под полем; при ошибке на её месте текст ошибки.",
      "Ошибка говорит, что исправить и сколько («Нужно 11 символов, сейчас 9»).",
      "Единицу («кг») выносите внутрь поля, а не в подпись.",
      "Inline-поле — для правки значения в карточке, где рамка шумела бы.",
    ],
    avoid: [
      "Placeholder вместо подписи: пропадает после первого символа.",
      "Показывать ошибку на пустое поле до того, как человек начал вводить.",
      "Цвет без текста: красной рамки без сообщения недостаточно.",
      "Disabled для данных, которые пользователь должен видеть и копировать: берите read-only текст.",
      "Ставить поля вплотную: ореол фокуса 3px заезжает на соседа.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Подпись",
      text: "Видимая подпись связана с input (aria-labelledby или label); без видимой подписи — aria-label.",
    },
    {
      kind: "aria",
      title: "Подсказка и ошибка",
      text: 'aria-describedby на элемент с подсказкой или ошибкой; при ошибке aria-invalid="true". Появление ошибки при вводе можно объявить через role="status" на строке сообщения. [TODO] в макете этого нет.',
    },
    {
      kind: "key",
      title: "Tab / Shift+Tab",
      text: "Ходят по полям; кнопка × входит в порядок после input; kbd-подсказка — не элемент управления.",
    },
    {
      kind: "key",
      title: "Esc",
      text: "[TODO] предложение: в поле поиска очищает текст.",
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Рамка --focus и ореол 3px --selected вместо outline. Рамка --focus на белом 3,65:1, в тёмной 10,0:1. Ореол как единственный сигнал слабый (teal 15 %), поэтому рамка обязательно меняет цвет.",
    },
    {
      kind: "contrast",
      title: "Рамка поля",
      text: "--border на белом 1,6:1 (светлая) и 2,7:1 на --field в тёмной: ниже 3:1 для границ компонентов. На hover --text-3 даёт 4,9:1. [TODO] решить, усиливать ли обычную рамку.",
    },
    {
      kind: "contrast",
      title: "Текст",
      text: "Текст --text 16,5:1; подсказка и единица --text-3 4,9:1 (светлая), 8,1:1 (тёмная); ошибка --err-text 5,5:1 и 7,8:1; placeholder --text-ph на --field 3,2:1 (светлая) и 5,4:1 (тёмная): в светлой ниже 4,5:1, подсказка в нём не должна быть единственной.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы рамки, ореола, значка и подложки отключаются.",
    },
  ],
  tokens: [
    { name: "--field", value: "#fff (тёмная #0f141b)", usage: "Фон поля", kind: "color" },
    {
      name: "--border / --text-3",
      value: "#c6cdd6 / #66727f",
      usage: "Рамка: обычная / hover",
      kind: "color",
    },
    {
      name: "--focus / --selected",
      value: "#00968f / teal 15 %",
      usage: "Рамка и ореол 3px в фокусе",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a",
      usage: "Рамка и текст ошибки; ореол danger 22 %",
      kind: "color",
    },
    {
      name: "--divider / --text-ph",
      value: "#e0e4e9 / #8792a0",
      usage: "Disabled: рамка и текст; placeholder",
      kind: "color",
    },
    { name: "--link", value: "#007f7a (тёмная #00d4d0)", usage: "Значок в фокусе", kind: "color" },
    {
      name: "--layer-1 / --layer-1p / --layer-2",
      value: "ink 4 % / 7 % / 9 %",
      usage: "Подложки inline и search; hover ×",
      kind: "color",
    },
    { name: "--h-md / --h-sm", value: "32 / 28 px", usage: "Высота поля / compact", kind: "size" },
    { name: "--r-item", value: "8 px", usage: "Радиус рамки (inline — 4)", kind: "radius" },
    {
      name: "--fs-control / --fs-body",
      value: "12 / 13 px",
      usage: "Подпись, подсказка / текст в поле",
      kind: "font",
    },
    {
      name: "--dur-f",
      value: "125 мс, ease",
      usage: "Рамка, ореол, значок, подложки",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "container",
      title: "Номер контейнера с проверкой",
      demo: <DemoContainerField />,
      code: `<Input label="Номер контейнера" placeholder="MSKU4821907"
  hint="4 буквы и 7 цифр" error={bad ? \`Нужно 4 буквы и 7 цифр, сейчас \${v.length} симв.\` : undefined} />`,
    },
    {
      id: "search",
      title: "Фильтр над таблицей",
      demo: <DemoInput compact lead="search" clear placeholder="Фильтр по клиенту" kbd="/" />,
      code: `<Input compact leadIcon="search" clearable placeholder="Фильтр по клиенту" kbd="/" />`,
    },
  ],
});
