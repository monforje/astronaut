/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import { Playback } from "@/engine/Playback";
import { Marks } from "@/engine/Callout";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  BrandAnimation,
  DemoBusyCard,
  DemoLoader,
  DemoPageLoader,
  LOADER_SRC,
  MARK_SRC,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function BusyLive() {
  const [busy, setBusy] = useState(false);
  return (
    <div style={{ display: "grid", gap: 10, justifyItems: "start", width: "100%" }}>
      <DemoBusyCard busy={busy} />
      <button
        type="button"
        className="ds-btn ds-btn--outline ds-btn--md"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          window.setTimeout(() => setBusy(false), 2000);
        }}
      >
        Обновить · 2 с
      </button>
    </div>
  );
}

function PageDemo() {
  return (
    <Playback<{ s: "off" | "in" | "on" | "out" }>
      initial={{ s: "off" }}
      script={[
        { at: 300, set: { s: "in" } },
        { at: 600, set: { s: "on" } },
        { at: 2300, set: { s: "out" } },
      ]}
      tail={900}
      hint="В продукте экран загрузки занимает всё окно (z-index 1100); здесь — рамка-макет."
      render={(s) => <DemoPageLoader state={s.s} />}
    />
  );
}

function BusyDemo() {
  return (
    <Playback<{ busy: boolean }>
      initial={{ busy: false }}
      script={[
        { at: 400, set: { busy: true } },
        { at: 2400, set: { busy: false } },
      ]}
      tail={900}
      hint="Затемнение без перехода: появляется и пропадает мгновенно, как в макете. [TODO] предложить fade 125 мс."
      render={(s) => <DemoBusyCard busy={s.busy} />}
    />
  );
}

export default defineDoc({
  id: "loader",
  title: "Loader",
  group: "feedback",
  cssPrefix: "ds-loader",
  order: 35,
  keywords: [
    "загрузка",
    "лоадер",
    "загрузчик",
    "анимация",
    "экран загрузки",
    "заставка",
    "подключаемся",
    "ожидание",
    "brand",
    "animated",
    "loader",
    "loading",
    "splash",
    "skeleton",
    "busy",
    "overlay",
  ],
  summary:
    "Анимация бренда с подписью для ожидания области, карточки или всей страницы. Только готовые файлы из brand/animated, без своих анимаций.",
  purpose:
    "Loader занимает место содержимого, пока оно грузится дольше пары секунд: «Загружаем грузы», «Сверяем документы». Он состоит из анимированного знака astronaut (loader.svg) и подписи. Для мелкой операции в кнопке — Spinner, для известного процента — Progress, для заглушки строк таблицы — Skeleton. Новые анимации не рисуем: любая нужна — добавляется в idea/skelet/brand/animated, а в словарь попадает ссылкой.",
  related: ["spinner", "progress", "toast", "agent-panel"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-loader", side: "t" },
          { n: 2, anchor: ".ds-loader__img", side: "l" },
          { n: 3, anchor: ".ds-loader__label", side: "r" },
          { n: 4, anchor: ".ds-loader__sub", side: "r" },
        ]}
      >
        <div style={{ width: 280 }}>
          <DemoLoader label="Загружаем грузы" sub="Это займёт пару секунд" />
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "Колонка по центру, отступы 36 × 16, gap 14, цвет текста --text-2. Роль status, aria-live polite.",
      },
      {
        name: "Знак",
        description:
          'loader.svg как <img alt="">: астронавт с мигающими искрами, цикл 1,4 с. Ширина 150 px (96 у компактного, 220 у страницы).',
      },
      {
        name: "Подпись",
        description:
          "13 px: что происходит («Загружаем грузы»). Мягко дышит: прозрачность до 50 % за 1,6 с.",
      },
      {
        name: "Пояснение",
        description: "12 px, --text-3: сколько ждать или где мы («Astronaut · Владивосток»).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "area",
      title: "Область",
      description: "Знак 150 px и подпись внутри блока, на месте содержимого.",
      when: "загружается таблица, карточка, раздел.",
      demo: (
        <div style={{ width: 280 }}>
          <DemoLoader label="Загружаем грузы" sub="Это займёт пару секунд" />
        </div>
      ),
    },
    {
      id: "compact",
      title: "Компактный",
      description: "Знак 96 px, без пояснения.",
      when: "небольшая панель, поповер, вкладка внутри Sheet.",
      demo: (
        <div style={{ width: 240 }}>
          <DemoLoader size="sm" label="Сверяем документы" />
        </div>
      ),
    },
    {
      id: "page",
      title: "Страница",
      description: "Знак 220 px на фоне страницы поверх всего окна; уходит через 0,25 с.",
      when: "первая загрузка рабочего пространства; не для переходов между разделами.",
      demo: <DemoPageLoader state="on" />,
    },
    {
      id: "busy",
      title: "Карточка с затемнением",
      description:
        "Содержимое остаётся, поверх — слой surface 72 % с blur 2 px и Spinner xl с подписью.",
      when: "блок обновляется, данные уже есть и их не нужно прятать.",
      demo: <BusyLive />,
    },
  ],
  extra: [
    {
      id: "brand",
      title: "Анимации бренда",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <BrandAnimation
            src={LOADER_SRC}
            file="loader.svg"
            title="Лоадер"
            note="«подключаемся…»: ожидание, страница, область"
            width={140}
          />
          <BrandAnimation
            src={MARK_SRC}
            file="logo-mark.svg"
            title="Знак"
            note="парит, искры мигают: агент, пустые состояния"
            width={120}
          />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Единственное состояние компонента: знак и подпись, пока данные не пришли.",
      demo: (
        <div style={{ width: 240 }}>
          <DemoLoader size="sm" label="Загружаем грузы" />
        </div>
      ),
    },
    {
      id: "busy",
      kind: "other",
      title: "Обновление",
      note: "Содержимое видно, поверх затемнение и Spinner xl, у блока aria-busy.",
      demo: <DemoBusyCard busy />,
    },
    NA("hover", "hover", "Hover", "Не интерактивен."),
    NA("active", "active", "Active", "Не интерактивен."),
    NA(
      "focus",
      "focus",
      "Focus",
      "Не в порядке Tab. Затемнение не ловит фокус; содержимое под ним недоступно, пока aria-busy и слой на месте [TODO] проверить inert.",
    ),
    NA("disabled", "disabled", "Disabled", "Нет. Недоступный блок затемняет слой busy."),
    NA(
      "error",
      "error",
      "Error",
      "Загрузка не удалась — Loader заменяют на Alert err или пустое состояние с «Повторить».",
    ),
    NA(
      "empty",
      "empty",
      "Empty",
      "Загрузка закончилась пустым ответом — это пустое состояние блока, не Loader.",
    ),
  ],
  rules: {
    use: [
      "Подпись всегда, глаголом в настоящем времени: «Загружаем грузы».",
      "Для ожидания дольше 2 секунд; для короче — Skeleton или Spinner.",
      'Подключайте файлы из brand/animated как есть: <img src="/brand/animated/loader.svg">.',
      "Если блок уже есть на экране, используйте затемнение (busy), а не заменяйте его Loader.",
      "Дайте выход: через 10 секунд — Alert с «Повторить».",
    ],
    avoid: [
      "Рисовать свою анимацию или перекрашивать знак бренда.",
      "Показывать page-loader при каждом переходе между экранами.",
      "Вешать Loader на кнопку: там Spinner.",
      "Сочетать Loader и Skeleton в одном блоке.",
      "Лоадер без подписи: знак не объясняет, что происходит.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=status, aria-live=polite",
      text: 'Контейнер объявляет подпись при появлении. Знак — alt="": он декоративен.',
    },
    {
      kind: "aria",
      title: "aria-busy",
      text: 'Блок, который обновляется, получает aria-busy="true" на время затемнения; когда данные пришли — атрибут снимается и в aria-live уходит итог («Данные обновлены»).',
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Страничный лоадер перекрывает всё окно: фокус не должен оставаться под ним. Предложение [TODO]: inert на приложение, пока он виден; после закрытия фокус на заголовок страницы.",
    },
    {
      kind: "contrast",
      title: "Подпись",
      text: "--text-2 на surface 8,2:1, пояснение --text-3 4,9:1. Во время «дыхания» прозрачность падает до 50 %, поэтому подпись при минимуме на длительное время не читаем: смысл читает скринридер, а вторую подпись не прячем.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Дыхание подписи выключено. Анимация внутри SVG отключается самим файлом (в brand/animated у каждого svg есть @media (prefers-reduced-motion: reduce) { * { animation: none } }) — остаётся статичный знак.",
    },
  ],
  tokens: [
    {
      name: "/brand/animated/loader.svg",
      value: "299 × 213, анимация 1,4 с",
      usage: "Знак лоадера (ссылка brand/public → brand/animated)",
      kind: "other",
    },
    {
      name: "--page",
      value: "#f4f5f7 (тёмная #0a0e13)",
      usage: "Фон страничного лоадера",
      kind: "color",
    },
    {
      name: "--surface 72 %",
      value: "color-mix + blur 2 px",
      usage: "Затемнение карточки",
      kind: "color",
    },
    {
      name: "--text-2 / --text-3",
      value: "#44505d / #66727f",
      usage: "Подпись · пояснение",
      kind: "color",
    },
    {
      name: "width",
      value: "96 · 150 · 220 px",
      usage: "Знак: compact · область · страница",
      kind: "size",
    },
    {
      name: "z-index",
      value: "1100",
      usage: "Страничный лоадер (выше Dialog 800 и поповера 900, ниже тоста 1200)",
      kind: "other",
    },
    {
      name: "fade",
      value: "200 мс ease / 250 мс ease",
      usage: "Появление и уход страничного лоадера",
      kind: "time",
    },
    {
      name: "breathe",
      value: "1,6 с, ease-in-out, бесконечно",
      usage: "Подпись: opacity до 0,5",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "page",
      title: "Загрузка страницы",
      trigger: "открытие приложения, пока грузится рабочее пространство",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Слой на всё окно (z-index 1100, фон --page) проявляется с 0 до 1.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 0,
          dur: 1400,
          what: "loader.svg играет свой цикл: астронавт качается, искры мигают.",
          prop: "svg animation",
          easing: "ease-in-out",
        },
        {
          at: 0,
          dur: 1600,
          what: "Подпись «дышит»: opacity 1 → 0,5 → 1.",
          prop: "opacity",
          easing: "ease-in-out",
        },
        {
          at: 2000,
          dur: 250,
          what: "Данные пришли: слой гаснет 1 → 0, затем удаляется из DOM.",
          prop: "opacity",
          easing: "ease",
        },
      ],
      focus:
        "Фокус в слой не входит. [TODO] приложение под ним получить inert, чтобы Tab не бродил по невидимому интерфейсу; после ухода слоя фокус на заголовок страницы.",
      reducedMotion: "Появление и уход мгновенные, подпись не дышит, знак статичный.",
      neighbours:
        "Слой перекрывает всё, включая шапку и боковое меню; Toast (z-index 1200) остаётся выше.",
      demo: <PageDemo />,
    },
    {
      id: "busy",
      title: "Карточка с затемнением",
      trigger: "нажатие «Обновить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "У блока aria-busy; поверх появляется слой surface 72 % с blur 2 px, по центру Spinner xl акцентного цвета и подпись «Обновляем…».",
          prop: "—",
        },
        {
          at: 0,
          dur: 800,
          what: "Кольцо Spinner вращается: оборот за 0,8 с.",
          prop: "rotate",
          easing: "linear",
        },
        {
          at: 2000,
          dur: 0,
          what: "Слой удаляется, aria-busy снимается; через Toast: «Данные обновлены».",
          prop: "—",
        },
      ],
      focus:
        "Кнопка «Обновить» блокируется на время обновления, фокус остаётся на ней (disabled — заменить на aria-busy [TODO]).",
      reducedMotion: "Spinner крутится медленнее (3 с на оборот); слой появляется мгновенно.",
      neighbours: "Размер блока не меняется; соседние блоки живут как раньше.",
      demo: <BusyDemo />,
    },
  ],
  examples: [
    {
      id: "area",
      title: "Область",
      demo: (
        <div style={{ width: 280 }}>
          <DemoLoader label="Загружаем грузы" sub="Это займёт пару секунд" />
        </div>
      ),
      code: '<Loader label="Загружаем грузы" hint="Это займёт пару секунд" />',
    },
    {
      id: "busy",
      title: "Блок обновляется",
      demo: <DemoBusyCard busy />,
      code: '<Card aria-busy style={{ position: "relative" }}><BusyOverlay label="Обновляем…" /></Card>',
    },
  ],
});
