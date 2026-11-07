/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Icon } from "@/engine/Icon";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoDropzone,
  DropzoneScene,
  DropzoneView,
  FileRow,
  zoneText,
  type DropState,
  type UploadFile,
  type ZoneKind,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const INVOICE = "Инвойс_MSKU4821907.pdf";
const PACKING = "Упаковочный лист.xlsx";
const IDLE: DropState = { kind: "idle", files: [] };

const done = (name: string): UploadFile => ({ name, p: 100 });
const four = ["Накладная.pdf", "Декларация.pdf", "Инвойс.pdf", "Спецификация.xlsx"].map(done);

function Zone({
  kind,
  compact,
  force,
  reason,
  count,
  cell,
}: {
  kind: ZoneKind;
  compact?: boolean;
  force?: "hover" | "focus";
  reason?: string;
  count?: number;
  cell?: boolean;
}) {
  const text = zoneText(kind, { compact, reason, count, dragCount: 2 });
  return (
    <DropzoneView
      kind={kind}
      compact={compact}
      cell={cell}
      force={force}
      still
      text={cell ? { ...text, title: CELL_TITLES[kind] } : text}
    />
  );
}

const CELL_TITLES: Record<ZoneKind, string> = {
  idle: "Перетащите файлы",
  drag: "Отпустите",
  reject: "Не подходит",
  full: "Лимит",
  disabled: "Недоступно",
};

function DropDemo() {
  return (
    <Playback<DropState>
      initial={IDLE}
      script={[
        { at: 400, set: { force: "hover" } },
        { at: 1100, set: { kind: "drag", force: undefined, dragCount: 2 } },
        {
          at: 2300,
          set: {
            kind: "idle",
            files: [
              { name: INVOICE, p: 0 },
              { name: PACKING, p: 0 },
            ],
          },
        },
        {
          at: 2700,
          set: {
            files: [
              { name: INVOICE, p: 38 },
              { name: PACKING, p: 22 },
            ],
          },
        },
        {
          at: 3200,
          set: {
            files: [
              { name: INVOICE, p: 76 },
              { name: PACKING, p: 61 },
            ],
          },
        },
        { at: 3700, set: { files: [done(INVOICE), done(PACKING)] } },
      ]}
      tail={1200}
      hint="Файлы над зоной: рамка и фон teal, подпись «Отпустите…». После отпускания зона возвращается в покой, а ниже растут строки с процентами."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

function RejectDragDemo() {
  return (
    <Playback<DropState>
      initial={IDLE}
      script={[
        { at: 500, set: { kind: "reject" } },
        { at: 2000, set: { kind: "idle" } },
      ]}
      tail={900}
      hint="Над зоной тип файла, который не принимается: красная рамка, значок ⚠, курсор «нельзя». Отпускать некуда."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

function RejectDropDemo() {
  const reason = "«скан.docx» — формат .docx";
  return (
    <Playback<DropState>
      initial={IDLE}
      script={[
        { at: 400, set: { kind: "drag", dragCount: 1 } },
        {
          at: 1300,
          set: {
            kind: "reject",
            reason,
            note: `Файлы не добавлены: ${reason}`,
          },
        },
        { at: 3100, set: { kind: "idle", reason: undefined } },
      ]}
      tail={1200}
      hint="Файл отпущен, но не прошёл проверку: зона 1,8 с показывает причину и сама возвращается в покой; полный текст остаётся в строке под зоной."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

function FullDemo() {
  const fifth = "Прайс.xlsx";
  return (
    <Playback<DropState>
      initial={{ kind: "idle", files: four }}
      script={[
        { at: 500, set: { files: [...four, { name: fifth, p: 20 }] } },
        { at: 1000, set: { files: [...four, { name: fifth, p: 70 }] } },
        { at: 1500, set: { kind: "full", files: [...four, done(fifth)] } },
        { at: 3000, set: { removeForce: "hover" } },
        {
          at: 3600,
          set: {
            kind: "idle",
            files: [...four],
            removeForce: undefined,
            note: "Файл удалён: Прайс.xlsx",
          },
        },
      ]}
      tail={1200}
      hint="Лимит заполнен: зона серая, сплошная рамка, не нажимается. Удаление файла возвращает её в ожидание."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

function KeyDemo() {
  return (
    <Playback<DropState>
      initial={IDLE}
      script={[
        { at: 400, set: { force: "focus" } },
        { at: 1300, set: { note: "Открылось окно выбора файлов" } },
        { at: 2300, set: { note: "", files: [{ name: INVOICE, p: 0 }] } },
        { at: 2700, set: { files: [{ name: INVOICE, p: 55 }] } },
        { at: 3200, set: { files: [done(INVOICE)] } },
      ]}
      tail={1200}
      hint="Tab ставит фокус на зону, Enter или Space открывают окно выбора; после выбора фокус остаётся на зоне."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

function RemoveDemo() {
  const two = [done(INVOICE), done(PACKING)];
  return (
    <Playback<DropState>
      initial={{ kind: "idle", files: two }}
      script={[
        { at: 500, set: { removeForce: "hover" } },
        {
          at: 1300,
          set: {
            files: [done(PACKING)],
            removeForce: undefined,
            note: `Файл удалён: ${INVOICE}  ·  Отменить`,
          },
        },
        { at: 3000, set: { files: two, note: "" } },
      ]}
      tail={1000}
      hint="Предложение для проверки: удаление можно отменить из строки уведомления; в макете для этого есть Toast с кнопкой «Отменить»."
      render={(s) => <DropzoneScene state={s} />}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Ожидание",
    note: "Рамка 1px dashed --text-ph, фон --surface, плитка 40 со значком загрузки, подпись и подсказка ограничений.",
    demo: <Zone kind="idle" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Рамка --text-3, фон --layer-1; переход 200 мс.",
    forced: true,
    demo: <Zone kind="idle" force="hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Отдельного вида нет: клик сразу открывает окно выбора файлов. Состояние «над зоной» — drag.",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus вплотную вокруг зоны, только от клавиатуры. Зона в порядке Tab, пока не full и не disabled.",
    forced: true,
    demo: <Zone kind="idle" force="focus" />,
  },
  {
    id: "drag",
    kind: "other",
    title: "Drag: файлы над зоной",
    note: "Рамка --primary (пунктир остаётся), фон primary 9 %, плитка --selected, подпись «Отпустите, чтобы загрузить» и число файлов.",
    demo: <Zone kind="drag" />,
  },
  {
    id: "reject",
    kind: "error",
    title: "Reject: тип не подходит",
    note: "Рамка --danger, фон danger 6 %, плитка и заголовок --err-text, значок ⚠, курсор no-drop. При отпускании файла с неверным форматом, размером или сверх лимита зона 1,8 с показывает причину.",
    demo: <Zone kind="reject" />,
  },
  {
    id: "reject-drop",
    kind: "error",
    title: "Reject после отпускания",
    note: "«Не удалось добавить» и причина первого отклонённого файла; через 1,8 с зона возвращается в покой, полный список причин остаётся в строке под зоной.",
    demo: <Zone kind="reject" reason="«скан.docx» — формат .docx" />,
  },
  {
    id: "loading",
    kind: "loading",
    title: "Идёт загрузка",
    note: "Строка файла: проценты вместо «Готово», полоса 4px растёт; зона при этом доступна (можно добавить ещё).",
    demo: (
      <div style={{ width: "100%" }}>
        <FileRow file={{ name: INVOICE, p: 45 }} />
      </div>
    ),
  },
  {
    id: "done",
    kind: "selected",
    title: "Файл загружен",
    note: "Статус «✓ Готово» цветом --ok-text, полоса заполнена.",
    demo: (
      <div style={{ width: "100%" }}>
        <FileRow file={done(PACKING)} />
      </div>
    ),
  },
  {
    id: "full",
    kind: "other",
    title: "Full: лимит заполнен",
    note: "Сплошная рамка --border, фон --surface-muted, плитка --ok-text со значком ✓; не нажимается и не в Tab.",
    demo: <Zone kind="full" count={5} />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Рамка --divider, фон прозрачный, текст --text-ph; причина в подсказке («Нет прав на загрузку»).",
    demo: <Zone kind="disabled" />,
  },
  NA(
    "empty",
    "empty",
    "Empty",
    "Отдельного вида нет: «пусто» — это и есть ожидание, список файлов под зоной просто не показывается.",
  ),
];

export default defineDoc({
  id: "dropzone",
  title: "Dropzone",
  group: "fields",
  cssPrefix: "ds-dropzone",
  order: 70,
  wideDemos: { variants: true },
  keywords: [
    "загрузка файлов",
    "загрузка",
    "загрузчик",
    "дропзона",
    "зона загрузки",
    "перетащить",
    "dropzone",
    "file upload",
    "file input",
    "drag and drop",
    "upload",
    "файлы",
    "вложения",
    "pdf",
    "xlsx",
  ],
  summary:
    "Область для перетаскивания файлов или выбора по клику, со списком загрузки: проценты, ошибки, лимит.",
  purpose:
    "Dropzone принимает документы по грузу (накладная, инвойс, декларация): человек бросает файлы на зону или нажимает на неё. Зона заранее говорит, что принимается (PDF, XLSX, JPG, PNG, до 10 МБ, не более 5), на лету показывает, подходит ли тип файла, и после отпускания проверяет формат, размер и лимит. Под зоной растёт список с процентами.",
  related: ["button", "input", "progress", "toast"],
  anatomy: {
    demo: (
      <div className="ds-dropzone__anat">
        <Marks
          block
          items={[
            { n: 1, anchor: ".ds-dropzone", side: "t" },
            { n: 2, anchor: ".ds-dropzone__tile", side: "l" },
            { n: 3, anchor: ".ds-dropzone__title", side: "l" },
            { n: 4, anchor: ".ds-dropzone__hint", side: "r" },
            { n: 5, anchor: ".ds-dropzone__file", side: "r" },
          ]}
        >
          <div className="ds-dropzone__wrap">
            <div className="ds-dropzone ds-dropzone--still">
              <span className="ds-dropzone__tile">
                <Icon name="dl" size="md" />
              </span>
              <span className="ds-dropzone__text">
                <span className="ds-dropzone__title">Перетащите файлы сюда или нажмите</span>
                <span className="ds-dropzone__hint">
                  PDF, XLSX, JPG, PNG · до 10 МБ · не более 5
                </span>
              </span>
            </div>
            <FileRow file={{ name: INVOICE, p: 62 }} />
          </div>
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Зона",
        description:
          "role=button, tabindex 0, aria-label «Загрузка файлов». Рамка 1px dashed, радиус 14, padding 28 16, всё по центру. Принимает клик, Enter, Space и drop.",
      },
      {
        name: "Плитка со значком",
        description:
          "40×40 (32 в compact), радиус 10, кольцо 1px --border, значок 18. Меняет значок и цвет по состоянию: загрузка, предупреждение, галочка.",
      },
      {
        name: "Заголовок",
        description:
          "600: что делать («Перетащите файлы сюда или нажмите») или что происходит («Отпустите, чтобы загрузить»).",
      },
      {
        name: "Подсказка ограничений",
        description:
          "12 px --text-3: форматы, размер, лимит. Показывается заранее, а не после ошибки; при drag — число файлов.",
      },
      {
        name: "Строка файла",
        description:
          "Плитка с расширением 36, имя 600 с обрезкой, справа проценты или «✓ Готово» и ×, ниже полоса прогресса 4px. Под зоной, зазор 8.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "full",
      title: "Основная",
      description:
        "Зона по центру, плитка сверху, текст под ней. Со списком файлов и прогрессом под зоной.",
      when: "экран загрузки документов по грузу; ждёт файлы на всю ширину карточки.",
      demo: <DemoDropzone />,
    },
    {
      id: "compact",
      title: "Компактная",
      description:
        "Плитка 32 слева, текст в две строки справа, padding 10 14. Список файлов обычно ведёт сам экран.",
      when: "вложение к комментарию или полю формы, где зона не должна занимать место.",
      demo: <DemoDropzone compact list={false} max={3} />,
    },
  ],
  sizes: [
    {
      id: "default",
      title: "Основная",
      value: "padding 28 16 · плитка 40",
      note: "по центру",
      demo: <Zone kind="idle" />,
    },
    {
      id: "compact",
      title: "Compact",
      value: "padding 10 14 · плитка 32",
      note: "плитка слева",
      demo: <Zone kind="idle" compact />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Ожидание", "Hover", "Drag", "Reject", "Full", "Disabled"],
    rows: [
      {
        label: "в ячейке",
        cells: (["idle", "idle", "drag", "reject", "full", "disabled"] as ZoneKind[]).map(
          (k, i) => (
            <Zone
              key={`${k}-${i === 1 ? "hover" : "base"}`}
              kind={k}
              cell
              force={i === 1 ? "hover" : undefined}
              count={3}
            />
          ),
        ),
      },
    ],
  },
  choreography: [
    {
      id: "drop",
      title: "Перетаскивание и загрузка",
      trigger: "файлы вносят над зоной, затем отпускают",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Hover (курсор над зоной без файлов): рамка --text-ph → --text-3, фон --layer-1.",
          prop: "border-color, background",
          easing: "ease",
        },
        {
          at: 700,
          dur: 200,
          what: "dragenter с файлами: рамка → --primary, фон → primary 9 %, плитка → --selected и цвет --link-strong. Заголовок и значок меняются сразу на «Отпустите, чтобы загрузить» и число файлов.",
          prop: "border-color, background, color",
          easing: "ease",
        },
        {
          at: 1900,
          dur: 200,
          what: "drop: зона возвращается в ожидание, а под ней появляются строки файлов с 0 %.",
          prop: "border-color, background",
          easing: "ease",
        },
        {
          at: 2300,
          dur: 350,
          what: "Прогресс растёт скачками (в макете +8…22 % каждые 140 мс, имитация); полоса догоняет их плавно.",
          prop: "width",
          easing: "var(--ease) = cubic-bezier(.6,0,.05,.95)",
        },
        {
          at: 3300,
          dur: 0,
          what: "100 %: проценты заменяются на «✓ Готово» цветом --ok-text.",
          prop: "—",
        },
      ],
      focus:
        "Фокус при перетаскивании не меняется (его двигает только клавиатура и клик). После drop фокус остаётся там, где был.",
      reducedMotion:
        "Переходы рамки, фона и плитки отключены, полоса прогресса растёт без плавности; смена текста и значка и так мгновенна.",
      neighbours:
        "Список файлов растёт под зоной, сдвигая всё, что ниже (зазор 8). Сама зона не меняет высоты, кроме compact ↔ основная (это разные варианты). Без реакции на drag остаются соседние зоны: подсвечивается только та, над которой файлы.",
      demo: <DropDemo />,
    },
    {
      id: "reject-drag",
      title: "Над зоной неподходящий файл",
      trigger: "dragenter / dragover с файлами другого типа",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Рамка → --danger, фон → danger 6 %, плитка и заголовок → --err-text; значок ⚠; курсор no-drop.",
          prop: "border-color, background, color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Заголовок «Такой формат не подходит», подсказка «Нужны PDF, XLSX, JPG, PNG» (по MIME типу dataTransfer; если тип неизвестен, файл считается подходящим).",
          prop: "text",
        },
        {
          at: 1500,
          dur: 200,
          what: "dragleave: зона возвращается в ожидание.",
          prop: "border-color, background",
          easing: "ease",
        },
      ],
      focus: "Не меняется.",
      reducedMotion: "Переходы отключены, остальное мгновенно.",
      neighbours:
        "Остальная страница не реагирует. Браузер при этом всё равно предложит открыть файл, если его отпустить мимо зоны: страница не перехватывает drop.",
      demo: <RejectDragDemo />,
    },
    {
      id: "reject-drop",
      title: "Отказ после отпускания",
      trigger: "drop файла с неверным форматом, размером или сверх лимита",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Проверка по порядку: формат (.pdf, .xlsx, .jpg, .png), размер (до 10 МБ), лимит (до 5). Подходящие файлы добавляются, отклонённые собираются со своей причиной.",
          prop: "—",
        },
        {
          at: 900,
          dur: 200,
          what: "Зона → reject: «Не удалось добавить» и причина первого отказа. В макете параллельно появляется Toast с полным списком причин; в словаре — строка под зоной.",
          prop: "border-color, background, color",
          easing: "ease",
        },
        {
          at: 2700,
          dur: 200,
          what: "Через 1,8 с зона сама возвращается в ожидание.",
          prop: "border-color, background",
          easing: "ease",
        },
      ],
      focus: "Не меняется. Сообщение об отказе объявляется через aria-live у строки под зоной.",
      reducedMotion:
        "Переходы отключены; таймер 1,8 с остаётся (текст всё равно виден в строке и Toast).",
      neighbours:
        "Список файлов не сдвигается: отклонённый файл в нём не появляется. [TODO] в макете причина мигает 1,8 с; людям с замедленным чтением нужно, чтобы она оставалась в строке под зоной (так и сделано в демо).",
      demo: <RejectDropDemo />,
    },
    {
      id: "full",
      title: "Лимит заполнен и удаление",
      trigger: "загружен последний допустимый файл; затем удалили любой",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 350,
          what: "Пятый файл дозагружается (полоса растёт).",
          prop: "width",
          easing: "var(--ease)",
        },
        {
          at: 1000,
          dur: 200,
          what: "Зона → full: сплошная рамка --border, фон --surface-muted, плитка с ✓ цветом --ok-text; заголовок «Загружено 5 из 5», подсказка «Удалите файл, чтобы добавить новый». Курсор default, tabindex −1.",
          prop: "border-style, background, color",
          easing: "ease",
        },
        {
          at: 3100,
          dur: 200,
          what: "Удалили файл: строка исчезает, зона возвращается в ожидание.",
          prop: "border-style, background, color",
          easing: "ease",
        },
      ],
      focus:
        "Зона full выходит из порядка Tab. Если фокус был на ней, он остаётся (тут [TODO]: решить, куда уходит фокус; предложение — на строку файла). После удаления фокус переносится на следующий ×.",
      reducedMotion: "Переходы отключены, смена вида мгновенна.",
      neighbours:
        "Список под зоной укорачивается, всё ниже поднимается на высоту строки (≈ 62 px с зазором).",
      demo: <FullDemo />,
    },
    {
      id: "keyboard",
      title: "Клавиатура: выбор файлов без мыши",
      trigger: "Tab до зоны, затем Enter или Space",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: на зоне кольцо 2px --focus вплотную.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 0,
          what: "Enter или Space: открывается системное окно выбора (скрытый input type=file, multiple, accept по списку форматов).",
          prop: "—",
        },
        {
          at: 1900,
          dur: 0,
          what: "После выбора файлы идут той же проверкой и загрузкой, что и при drop.",
          prop: "—",
        },
      ],
      focus:
        "Фокус на зоне до и после диалога (диалог возвращает его на открывший элемент). Кнопки × в строках файлов входят в Tab после зоны.",
      reducedMotion: "Поведение не меняется: кроме полосы прогресса анимаций нет.",
      neighbours:
        "Строка с уведомлением (aria-live) объявляет «Открылось окно выбора» только в демо.",
      demo: <KeyDemo />,
    },
    {
      id: "remove",
      title: "Удаление файла с отменой",
      trigger: "клик по × в строке файла",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover на ×: подложка --layer-2 (20×20, радиус 4).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 800,
          dur: 0,
          what: "Клик: строка исчезает сразу; зона пересчитывает состояние (если был full — снова ожидание).",
          prop: "—",
        },
        {
          at: 800,
          dur: 0,
          what: "Появляется уведомление «Файл удалён» с действием «Отменить» (в макете Toast). Отмена возвращает файл на прежнее место сразу в состоянии «Готово».",
          prop: "—",
        },
      ],
      focus:
        "Кнопка × исчезает вместе со строкой: фокус нужно перенести на следующий × или на зону. [TODO] в макете фокус не переносится.",
      reducedMotion: "Строка исчезает так же мгновенно.",
      neighbours: "Строки ниже поднимаются на высоту удалённой; при отмене раздвигаются обратно.",
      demo: <RemoveDemo />,
    },
  ],
  rules: {
    use: [
      "Пишите ограничения заранее: форматы, размер, лимит.",
      "Давайте и перетаскивание, и клик: многие не знают, что можно бросать файлы.",
      "После отказа называйте файл и причину («формат .docx»), а не «ошибка загрузки».",
      "Показывайте прогресс по каждому файлу и итог «Готово».",
      "Дайте отменить удаление файла.",
      "compact — когда зона встроена в поле или комментарий.",
    ],
    avoid: [
      "Зона только для мыши: без клика и клавиатуры её не открыть.",
      "Принимать файл молча и отклонять потом: проверяйте тип уже на dragover.",
      "Скрывать лимит: человек узнаёт о нём после шестого файла.",
      "Несколько зон на экране без заголовков: непонятно, что куда бросать.",
      "Использовать красный reject для обычной подсказки: цвет только для настоящего отказа.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Зона",
      text: 'role="button", aria-label «Загрузка файлов», tabindex 0; у full и disabled — aria-disabled и tabindex −1. Скрытый input type=file доступен через неё.',
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "Открывают окно выбора файлов. Tab идёт к зоне, затем к кнопкам × в списке.",
    },
    {
      kind: "aria",
      title: "Состояние и отказы",
      text: "Строка под зоной с aria-live=polite объявляет отказы («Файлы не добавлены: …») и удаление; подпись зоны при drag/reject живёт в тексте, а не только в цвете.",
    },
    {
      kind: "aria",
      title: "Прогресс",
      text: 'Полоса — role="progressbar" с aria-valuenow и именем «Загрузка <файл>». «Готово» — текст, а не только цвет.',
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2px --focus вплотную вокруг зоны, 3,65:1 на белом, 9,34:1 в тёмной. После удаления файла фокус нужно переносить ([TODO]).",
    },
    {
      kind: "contrast",
      title: "Рамка и текст",
      text: "Пунктир --text-ph на --surface 3,2:1 (светлая), 5,1:1 (тёмная): не ниже 3:1. Подсказка --text-3 на --surface 4,9:1; на hover (--layer-1) 4,5:1; на full (--surface-muted) 4,2:1 — ниже 4,5:1 [TODO]. Заголовок reject --err-text на подложке 5,0:1 (светлая), 7,2:1 (тёмная).",
    },
    {
      kind: "contrast",
      title: "Статус и значки",
      text: "«Готово» --ok-text на белом 4,8:1; галочка full --ok-text на --surface-muted 4,1:1 [TODO], в тёмной 9,3:1. Расширение --err-text на подложке danger 9 % не ниже 4,5:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы рамки, фона, плитки, кнопки × и рост полосы прогресса отключаются.",
    },
  ],
  tokens: [
    {
      name: "--text-ph / --text-3",
      value: "#8792a0 / #66727f",
      usage: "Рамка зоны: ожидание / hover; подсказка",
      kind: "color",
    },
    {
      name: "--surface / --layer-1",
      value: "#fff / ink 4 %",
      usage: "Фон зоны / hover",
      kind: "color",
    },
    {
      name: "--primary / --selected / --link-strong",
      value: "#00d4d0 / teal 15 % / #006662",
      usage: "Drag: рамка, подложка 9 %, плитка",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a",
      usage: "Reject: рамка, подложка 6 %, плитка и заголовок",
      kind: "color",
    },
    {
      name: "--border / --surface-muted / --ok-text",
      value: "#c6cdd6 / #eceef2 / #00807a",
      usage: "Full: сплошная рамка, фон, значок ✓",
      kind: "color",
    },
    {
      name: "--divider",
      value: "#e0e4e9",
      usage: "Disabled: рамка и кольцо плитки",
      kind: "color",
    },
    {
      name: "--r-panel / --r-card / --r-item",
      value: "14 / 10 / 8 px",
      usage: "Зона / плитка и строка файла / плитка расширения",
      kind: "radius",
    },
    {
      name: "размеры",
      value: "плитка 40 (32), строка: ext 36, полоса 4",
      usage: "Основная · compact · строка файла",
      kind: "size",
    },
    {
      name: "--dur",
      value: "200 мс, ease",
      usage: "Рамка, фон и плитка при смене состояния",
      kind: "time",
    },
    {
      name: "прогресс",
      value: "350 мс, var(--ease)",
      usage: "Рост полосы; шаги процентов в демо — 140 мс",
      kind: "time",
    },
    {
      name: "reject",
      value: "1,8 с",
      usage: "Сколько зона показывает причину после drop",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "docs",
      title: "Документы по грузу",
      demo: <DemoDropzone />,
      code: `<Dropzone accept={["pdf", "xlsx", "jpg", "png"]} maxSizeMb={10} maxFiles={5}
  onFiles={upload} files={files} onRemove={remove} />`,
    },
    {
      id: "compact",
      title: "Вложение к комментарию",
      demo: <DemoDropzone compact list={false} max={3} />,
      code: `<Dropzone compact maxFiles={3} onFiles={attach} />`,
    },
  ],
});
