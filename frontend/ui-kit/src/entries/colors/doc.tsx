/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type TokenSpec } from "@/engine/types";
import "./colors.css";

function Sw({ token, label, fg }: { token: string; label?: string; fg?: string }) {
  return (
    <div
      className="ds-colors-sw"
      style={{ "--ds-colors-bg": `var(${token})`, "--ds-colors-fg": fg } as CSSProperties}
    >
      <span>{label ?? token.replace("--", "")}</span>
      <small>{token}</small>
    </div>
  );
}

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="ds-colors-grid">{children}</div>
);

const c = (name: string, value: string, usage: string): TokenSpec => ({
  name,
  value,
  usage,
  kind: "color",
});

type ThemeName = "light" | "dark";

function storedTheme(fallback: ThemeName): ThemeName {
  try {
    const v = localStorage.getItem("ds-theme");
    if (v === "dark" || v === "light") return v;
  } catch {}
  return fallback;
}

function ThemeProbe({ t, home }: { t: "home" | "away"; home: ThemeName }) {
  const base = storedTheme(home);
  const target: ThemeName = t === "home" ? base : base === "dark" ? "light" : "dark";
  useEffect(() => {
    document.documentElement.dataset.theme = target;
  }, [target]);
  useEffect(
    () => () => {
      document.documentElement.dataset.theme = storedTheme(home);
    },
    [home],
  );
  return (
    <div className="ds-colors-preview">
      <code>{`<html data-theme="${target}">`}</code>
      <Grid>
        <Sw token="--page" />
        <Sw token="--surface" />
        <Sw token="--text" fg="var(--surface)" />
        <Sw token="--primary" fg="var(--on-primary)" />
      </Grid>
    </div>
  );
}

function ThemeSwitchDemo() {
  const home = useRef<ThemeName>(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  return (
    <Playback<{ t: "home" | "away" }>
      initial={{ t: "home" }}
      script={[
        { at: 600, set: { t: "away" } },
        { at: 2400, set: { t: "home" } },
      ]}
      tail={600}
      hint="Предложение для проверки: тема на странице словаря переключается на время сценария и возвращается; выбор в localStorage не меняется."
      render={(s) => <ThemeProbe t={s.t} home={home.current} />}
    />
  );
}

const PAINT_STEPS = [
  "Скрипт в <head> читает ds-theme из localStorage",
  "Нет значения: берётся prefers-color-scheme",
  "data-theme ставится на <html>",
  "Первая отрисовка уже в нужной теме",
];

function FirstPaintDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[
        { at: 400, set: { n: 1 } },
        { at: 1000, set: { n: 2 } },
        { at: 1600, set: { n: 3 } },
        { at: 2200, set: { n: 4 } },
      ]}
      tail={800}
      hint="Шаги идут до первой отрисовки; в реальности они занимают доли миллисекунды."
      render={(s) => (
        <ol className="ds-colors-steps">
          {PAINT_STEPS.map((t, i) => (
            <li key={t} data-done={i < s.n || undefined}>
              {t}
            </li>
          ))}
        </ol>
      )}
    />
  );
}

export default defineDoc({
  id: "colors",
  title: "Цвета",
  group: "base",
  cssPrefix: "ds-colors",
  order: 10,
  foundation: true,
  keywords: [
    "палитра",
    "palette",
    "цвет",
    "color",
    "colors",
    "тема",
    "theme",
    "тёмная",
    "dark",
    "светлая",
    "light",
    "teal",
    "navy",
    "orange",
    "токены",
    "tokens",
    "роли",
    "роли цвета",
    "контраст",
    "contrast",
    "бренд",
    "brand",
    "primary",
  ],
  summary:
    "Нейтральный графит с teal-акцентом. Navy — только логотип и текст на teal и orange; orange — сигнал. Две темы: светлая и тёмная.",
  purpose:
    "Компонент берёт цвет по роли (--text, --border, --primary), а не по HEX и не по бренду. Так тёмная тема получается заменой значений ролей, а не правкой компонентов. Новый оттенок получают через color-mix от существующих ролей.",
  related: ["state-layers", "typography"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-colors-chain__brand", side: "l" },
          { n: 2, anchor: ".ds-colors-chain__role", side: "l" },
          { n: 3, anchor: ".ds-colors-chain__layer", side: "r" },
        ]}
      >
        <div className="ds-colors-chain">
          <div className="ds-colors-chain__col">
            <code className="ds-colors-chain__brand">--color-teal #00d4d0</code>
            <span aria-hidden="true">↓</span>
            <code className="ds-colors-chain__role">--primary</code>
            <span aria-hidden="true">↓</span>
            <code>.ds-btn--primary</code>
          </div>
          <div className="ds-colors-chain__col">
            <code className="ds-colors-chain__layer">--layer-1</code>
            <span aria-hidden="true">↓</span>
            <code>:hover</code>
          </div>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Бренд",
        description:
          "Четыре цвета из idea/skelet/brand/design/tokens.css: navy #082f53, teal #00d4d0, orange #ff9455, off-white #fbf5eb. Источник правды, в словаре не копируется.",
      },
      {
        name: "Роли",
        description:
          "Имена по назначению: --page, --surface, --text, --border, --primary, --danger. Значения зависят от темы.",
      },
      {
        name: "Слои",
        description:
          "Прозрачный ink 4–12 % поверх любого фона: состояния hover и active (страница «Слои состояний»).",
      },
    ],
  },
  variants: [
    {
      id: "surfaces",
      title: "Поверхности",
      description:
        "Фон страницы под карточками, сами карточки, приглушённые блоки, поле ввода и выбранный элемент.",
      demo: (
        <Grid>
          <Sw token="--page" />
          <Sw token="--surface" />
          <Sw token="--surface-muted" />
          <Sw token="--field" />
          <Sw token="--selected" />
        </Grid>
      ),
    },
    {
      id: "text",
      title: "Текст и линии",
      description:
        "Четыре ступени текста и три линии: границы контролов, разделители, граница выбранного.",
      demo: (
        <>
          <div className="ds-colors-text">
            <span>Aa</span>
            <span style={{ color: "var(--text-2)" }}>Aa</span>
            <span style={{ color: "var(--text-3)" }}>Aa</span>
            <span style={{ color: "var(--text-ph)" }}>Aa</span>
          </div>
          <Grid>
            <Sw token="--border" />
            <Sw token="--divider" />
            <Sw token="--border-selected" />
          </Grid>
        </>
      ),
    },
    {
      id: "accent",
      title: "Акцент",
      description:
        "Teal — главное действие и выбор; orange — сигнал; navy — только текст на teal и orange. Ссылки и фокус — тёмный teal, читаемый на белом.",
      demo: (
        <Grid>
          <Sw token="--primary" fg="var(--on-primary)" />
          <Sw token="--spark" fg="var(--on-primary)" />
          <Sw token="--on-primary" label="on-primary" />
          <Sw token="--link" />
          <Sw token="--focus" />
        </Grid>
      ),
    },
    {
      id: "semantic",
      title: "Смысл",
      description:
        "Опасность, информация и тексты статусов. Заливка тона — одна, текст тона — отдельная роль, чтобы читаться на подложке.",
      demo: (
        <Grid>
          <Sw token="--danger" />
          <Sw token="--info" />
          <Sw token="--ok-text" />
          <Sw token="--warn-text" />
          <Sw token="--err-text" />
          <Sw token="--info-text" />
        </Grid>
      ),
    },
  ],
  states: [],
  choreography: [
    {
      id: "theme-switch",
      title: "Переключение темы",
      trigger: "кнопка в шапке (солнце / луна)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Атрибут data-theme на <html> меняется на light или dark: все роли получают новые значения одновременно.",
        },
        {
          at: 0,
          dur: 0,
          what: "Выбор сохраняется в localStorage (в макете ключ ast-theme, в словаре ds-theme).",
        },
      ],
      focus: "Фокус остаётся на кнопке темы, кольцо не пропадает.",
      reducedMotion: "Не применяется: перехода между темами нет.",
      neighbours:
        "Весь интерфейс меняется разом. Плавный кроссфейд не делали: [TODO] решить, нужен ли он (цена — дорогая перерисовка).",
      demo: <ThemeSwitchDemo />,
    },
    {
      id: "first-paint",
      title: "Первая отрисовка",
      trigger: "открытие страницы",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Скрипт в <head> читает сохранённую тему; если её нет — берёт prefers-color-scheme.",
        },
        {
          at: 0,
          dur: 0,
          what: "data-theme ставится до первой отрисовки, поэтому вспышки светлой темы у тёмного режима нет.",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Не применяется.",
      neighbours: "Не затрагиваются.",
      demo: <FirstPaintDemo />,
    },
  ],
  rules: {
    use: [
      "Брать цвет ролью (--text, --primary), не HEX и не --teal напрямую.",
      "Текст на teal и orange — всегда navy.",
      "Одна главная кнопка (teal) на экране; orange — только сигнал.",
      "Состояние передавать тоном и словом вместе (Badge, Alert).",
      "Новый оттенок получать color-mix от ролей, добавляя роль в tokens.css.",
    ],
    avoid: [
      "Красить интерфейс navy: navy — это логотип и текст на цвете, не фон.",
      "Писать HEX в css компонента: тёмная тема сломается.",
      "Передавать смысл одним цветом, без текста или значка.",
      "Использовать --text-ph для текста, который нужно прочитать: это подсказка и disabled.",
      "Менять цвета бренда в словаре: они приходят симлинком из idea/skelet/brand.",
    ],
  },
  a11y: [
    {
      kind: "contrast",
      title: "Текст",
      text: "--text на белом 16,5:1, --text-2 8,2:1, --text-3 4,9:1 (подписи 11–12 px на пределе), --text-ph 3,2:1 — только подсказки и disabled.",
    },
    {
      kind: "contrast",
      title: "Тексты статусов",
      text: "На белом: ok 4,8:1, warn 5,0:1, err 5,5:1, info 6,7:1, ссылка 4,9:1. В тёмной теме на --surface от 7,6:1.",
    },
    {
      kind: "contrast",
      title: "Navy на заливке",
      text: "Navy на teal 7,4:1, на orange 6,2:1. Белый на --danger #d03538 в светлой теме 4,9:1 (hover 5,6:1, active 6,5:1), в тёмной --on-danger на #ff6b6b 6,6:1: норма 4,5:1 выполнена без смесей в компонентах.",
    },
    {
      kind: "contrast",
      title: "Линии",
      text: "--border на белом 1,6:1, --divider 1,3:1: это обрамление, не единственный носитель смысла. Кольцо фокуса --focus — 3,7:1 на белом.",
    },
    {
      kind: "note",
      title: "Цвет не единственный носитель",
      text: "Статус всегда в паре со словом или значком; точка присутствия — с текстовой альтернативой.",
    },
    {
      kind: "motion",
      title: "prefers-color-scheme",
      text: "Без сохранённого выбора тема берётся из системной.",
    },
  ],
  tokens: [
    c("--page", "#f4f5f7 / #0a0e13", "Фон страницы под карточками"),
    c("--surface", "#ffffff / #151b23", "Карточки, меню, шапка, таблицы"),
    c("--surface-muted", "#eceef2 / #1f2833", "Приглушённые блоки, дорожка переключателя"),
    c("--field", "#ffffff / #0f141b", "Фон поля ввода"),
    c("--text", "#15202b / #f7f9fb", "Основной текст"),
    c("--text-2", "#44505d / #c9d2dc", "Второстепенный текст, подписи"),
    c("--text-3", "#66727f / #a0adbb", "Третичный текст, иконки"),
    c("--text-ph", "#8792a0 / #7f8c9b", "Подсказка в поле, disabled"),
    c("--border", "#c6cdd6 / #4d5b6b", "Кольцо контролов (outline, поле)"),
    c("--divider", "#e0e4e9 / #323e4b", "Разделители, кольцо карточек"),
    c("--primary / --on-primary", "teal #00d4d0 / navy #082f53", "Главное действие и текст на нём"),
    c("--spark", "orange #ff9455", "Сигнал, accent-кнопка"),
    c("--link / --link-strong", "#007f7a, #006662 / teal", "Ссылки, акцент-текст"),
    c("--focus", "#00968f / teal", "Кольцо фокуса"),
    c("--selected", "teal 15–16 % на --surface", "Выбранный элемент"),
    c("--border-selected", "teal 60 % на --surface", "Кольцо выбранного"),
    c("--danger / --on-danger", "#d03538, #fff / #ff6b6b, #2a0b08", "Опасность и текст на ней"),
    c("--info", "#2563eb / #7ab0ff", "Информация"),
    c("--ok-text", "#00807a / #2de3df", "Текст статуса «ок»"),
    c("--warn-text", "#b45309 / #ffb067", "Текст статуса «ждём»"),
    c("--err-text", "#c92a2a / #ff8d8d", "Текст статуса «ошибка»"),
    c("--info-text", "#1d4ed8 / #9cc4ff", "Текст статуса «в пути»"),
    c("--overlay", "rgba(14,20,28,.45) / rgba(0,0,0,.62)", "Затемнение под окном и панелью"),
    c("--ink", "#0e1620 / #ffffff", "База слоёв состояний"),
  ],
  examples: [
    {
      id: "pair",
      title: "Текст на заливке",
      description:
        "Любая заливка — со своей парой текста: navy на teal и orange, --on-danger на красном.",
      demo: (
        <Grid>
          <Sw token="--primary" fg="var(--on-primary)" label="teal + navy" />
          <Sw token="--spark" fg="var(--on-primary)" label="orange + navy" />
          <Sw token="--danger" fg="var(--on-danger)" label="danger + on-danger" />
        </Grid>
      ),
      code: `background: var(--primary);
color: var(--on-primary);   /* не navy HEX и не --text */`,
    },
  ],
});
