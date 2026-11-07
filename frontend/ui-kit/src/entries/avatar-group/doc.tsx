/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoAvEmpty, DemoAvGroup, DemoAvSkeleton, PEOPLE } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const pad = (children: ReactNode) => (
  <span style={{ display: "inline-flex", padding: "40px 40px 4px" }}>{children}</span>
);

function TipDemo() {
  return (
    <Playback<{ tip?: number }>
      initial={{}}
      script={[
        { at: 400, set: { tip: 0 } },
        { at: 1500, set: { tip: 1 } },
        { at: 2600, set: { tip: undefined } },
      ]}
      tail={500}
      hint="Подсказка с полным именем; аватары не поднимаются и не сдвигаются."
      render={(s) => pad(<DemoAvGroup size="md" tipAt={s.tip} />)}
    />
  );
}

function JoinDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 2 }}
      script={[{ at: 500, set: { n: 3 } }]}
      tail={1200}
      hint="Предложение: новый участник въезжает за 200 мс; «+N» пересчитывается."
      render={(s) => <DemoAvGroup people={PEOPLE.slice(0, s.n === 2 ? 2 : 5)} max={s.n} />}
    />
  );
}

function MoreDemo() {
  return (
    <Playback<{ open: boolean; f?: "hover" | "active" }>
      initial={{ open: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1000, set: { f: "active" } },
        { at: 1200, set: { f: undefined, open: true } },
        { at: 2800, set: { open: false } },
      ]}
      tail={500}
      hint="Предложение: «+N» открывает список; фокус идёт в список, Esc возвращает на «+N»."
      render={(s) => (
        <span style={{ display: "inline-flex", padding: "0 80px 190px 0" }}>
          <DemoAvGroup size="md" max={3} interactive expanded={s.open} moreForce={s.f} />
        </span>
      )}
    />
  );
}

export default defineDoc({
  id: "avatar-group",
  title: "AvatarGroup",
  group: "people",
  cssPrefix: "ds-avgroup",
  order: 20,
  keywords: [
    "группа",
    "group",
    "участники",
    "participants",
    "аватары",
    "avatars",
    "стек",
    "stack",
    "avatar stack",
    "avatar group",
    "команда",
    "team",
    "исполнители",
    "ещё n",
    "+n",
    "overflow",
  ],
  summary:
    "Несколько аватаров внахлёст с кольцом цвета поверхности; когда участников больше, чем влезает, последним идёт «+N».",
  purpose:
    "Показывает, кто участвует в обсуждении, грузе или задаче, не занимая строку на каждого. Перекрытие зависит от размера: 5, 7 и 9 px. Полный список участников — не задача группы: его открывает «+N» или соседняя кнопка. [TODO] решить, открывает ли «+N» список: в макете это просто метка.",
  related: ["avatar", "user-chip", "thread", "tooltip"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-avgroup__item .ds-avatar", side: "t" },
          { n: 2, anchor: ".ds-avatar--more", side: "b" },
        ]}
      >
        <DemoAvGroup size="lg" max={3} />
      </Marks>
    ),
    parts: [
      {
        name: "Аватар участника",
        description:
          "Обычный Avatar того же размера; кольцо цвета поверхности 2 px рисует обёртка группы, а не сам аватар. Левый аватар лежит выше соседей.",
      },
      {
        name: "«+N»",
        description:
          "Нейтральный круг с числом остальных. N = всего − показано. Цифры без моноширинного шрифта.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "default",
      title: "Три и «+N»",
      description: "Размер по умолчанию (24), перекрытие 5 px. Шапка обсуждения, строка груза.",
      when: "рядом с названием, где важен сам факт участия.",
      demo: <DemoAvGroup max={3} />,
    },
    {
      id: "md",
      title: "Четыре, md",
      description: "Аватар 32, перекрытие 7 px. Карточка клиента, заголовок страницы.",
      demo: <DemoAvGroup size="md" max={4} />,
    },
    {
      id: "lg",
      title: "Пять, lg",
      description: "Аватар 40, перекрытие 9 px. Крупная шапка, пустое состояние.",
      demo: <DemoAvGroup size="lg" max={5} />,
    },
    {
      id: "all",
      title: "Без «+N»",
      description: "Участников не больше лимита: «+N» не рисуется вовсе, а не «+0».",
      demo: <DemoAvGroup size="md" people={PEOPLE.slice(0, 3)} max={4} />,
    },
    {
      id: "interactive",
      title: "«+N» как кнопка",
      description: "Предложение: «+N» открывает список всех участников с ролями.",
      when: "когда нужно узнать, кто именно скрыт.",
      demo: <DemoAvGroup size="md" max={3} interactive />,
    },
  ],
  sizes: [
    {
      id: "overlap",
      title: "Перекрытие",
      value: "5 · 7 · 9 px",
      note: "по умолчанию · md · lg; для xs и sm 4 px [TODO] нет в макете",
      demo: (
        <>
          <DemoAvGroup max={3} />
          <DemoAvGroup size="md" max={3} />
          <DemoAvGroup size="lg" max={3} />
        </>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Обычный",
      note: "Аватары внахлёст, «+N» в конце.",
      demo: <DemoAvGroup size="md" max={3} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover на человеке",
      note: "Подсказка с полным именем. Аватар не поднимается и не сдвигается.",
      forced: true,
      demo: pad(<DemoAvGroup size="md" tipAt={1} />),
    },
    {
      id: "hover-more",
      kind: "hover",
      title: "Hover на «+N»",
      note: "Предложение: круг темнеет на слой 34 % тона. Только у интерактивной группы.",
      forced: true,
      demo: <DemoAvGroup size="md" max={3} interactive moreForce="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Предложение: «+N» темнее ещё на ступень, пока список открывается.",
      forced: true,
      demo: <DemoAvGroup size="md" max={3} interactive moreForce="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо --focus 2 px с отступом 1 px вокруг «+N». Сами аватары в Tab не входят.",
      forced: true,
      demo: <DemoAvGroup size="md" max={3} interactive moreForce="focus" />,
    },
    {
      id: "open",
      kind: "selected",
      title: "Список открыт",
      note: "У «+N» aria-expanded=true и тёмный круг; список лежит поверх страницы.",
      demo: (
        <span style={{ display: "inline-flex", minWidth: 232, paddingBottom: 182 }}>
          <DemoAvGroup size="md" max={3} interactive expanded />
        </span>
      ),
    },
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "Группа только показывает. Недоступного участника показывает присутствие off у Avatar.",
    ),
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Серые круги-заглушки того же размера, мигание 1,4 с. Предложение: в макете нет.",
      demo: <DemoAvSkeleton />,
    },
    NA(
      "error",
      "error",
      "Error",
      "Нет. Не загрузился список — скрываем группу, а ошибку показывает контейнер.",
    ),
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: текст «Участников нет» и кнопка «+» с пунктирным кругом, если участников можно добавить.",
      demo: <DemoAvEmpty />,
    },
  ],
  choreography: [
    {
      id: "tip",
      title: "Подсказка с именем",
      trigger: "курсор над аватаром группы",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подсказка проявляется над аватаром: прозрачность 0→1, масштаб .96→1, сдвиг на 4 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 1100,
          dur: 0,
          what: "Курсор ушёл на другой аватар: прежняя подсказка исчезает мгновенно, новая появляется сразу.",
        },
      ],
      focus:
        "Аватары не фокусируются, подсказки от клавиатуры нет; имена перечислены в aria-label группы или в списке «+N».",
      reducedMotion: "Подсказка появляется без анимации.",
      neighbours: "Соседи не двигаются: подсказка лежит поверх и не меняет раскладку.",
      demo: <TipDemo />,
    },
    {
      id: "join",
      title: "Новый участник",
      trigger: "в обсуждение добавили человека",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Новый аватар въезжает с края группы: прозрачность 0→1, масштаб .6→1, сдвиг на 8 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Число в «+N» меняется сразу, без анимации счёта; последний видимый аватар уходит под «+N».",
        },
      ],
      focus:
        "Не затрагивается. Появление объявляет текст в aria-live рядом («Алексей добавлен»), а не сама группа.",
      reducedMotion: "Аватар появляется сразу.",
      neighbours:
        "Группа растёт вправо; соседний текст сдвигается один раз, без пружины. [TODO] подтвердить.",
      demo: <JoinDemo />,
    },
    {
      id: "more",
      title: "Список по «+N»",
      trigger: "клик или Enter / Space на «+N»",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "«+N» темнеет до слоя active.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Список всплывает под группой: прозрачность 0→1, масштаб .96→1, сдвиг сверху 4 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 1600,
          dur: 0,
          what: "Esc или клик снаружи: список исчезает мгновенно, фокус возвращается на «+N».",
        },
      ],
      focus: "Фокус уходит на первую строку списка; Tab идёт по строкам; Esc возвращает на «+N».",
      reducedMotion: "Список появляется без сдвига и масштаба.",
      neighbours: "Список лежит поверх контента, раскладка не меняется.",
      demo: <MoreDemo />,
    },
  ],
  rules: {
    use: [
      "Три-четыре аватара и «+N»: дальше группа превращается в кашу.",
      "Один размер на всю группу, перекрытие по таблице размеров.",
      "Порядок — по значимости (автор, ответственный, остальные), одинаковый во всех списках.",
      "Организации и людей в одной группе не смешивать: у организаций квадрат.",
    ],
    avoid: [
      "Рисовать «+0» и «+1»: одного скрытого человека лучше показать.",
      "Менять перекрытие вручную или убирать кольцо: без него круги сливаются.",
      "Делать группу кнопкой целиком: интерактивным бывает только «+N».",
      "Ставить присутствие на аватары в группе: точки вылезают за кольцо.",
      "Добавлять градиенты и тени: аватары плоские.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="group" + aria-label',
      text: "Группа называется «Участники» (или точнее: «Участники обсуждения»). Отдельные аватары имеют role=img с именем.",
    },
    {
      kind: "aria",
      title: "«+N»",
      text: "Неинтерактивный читается как «ещё N». Кнопка получает aria-label «Ещё N: показать всех участников», aria-haspopup, aria-expanded.",
    },
    {
      kind: "key",
      title: "Tab / Enter / Space / Esc",
      text: "В Tab входит только «+N»-кнопка. Enter и Space открывают список, Esc закрывает и возвращает фокус.",
    },
    {
      kind: "focus",
      title: "Кольцо фокуса",
      text: "--focus 2 px, отступ 1 px, поверх кольца цвета поверхности.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Анимации появления, подсказки и списка отключаются, мигание заглушек останавливается.",
    },
  ],
  tokens: [
    {
      name: "overlap",
      value: "5 · 7 · 9 px",
      usage: "Перекрытие: по умолчанию · md · lg; xs/sm 4 px [TODO]",
      kind: "size",
    },
    {
      name: "ring",
      value: "2 px --surface",
      usage: "Кольцо вокруг каждого аватара (box-shadow обёртки)",
      kind: "size",
    },
    {
      name: "--text-3 / --text-2",
      value: "#66727f / #44505d",
      usage: "«+N»: подложка и цифры",
      kind: "color",
    },
    { name: "--surface", value: "#fff / #151b23", usage: "Кольцо и фон списка", kind: "color" },
    { name: "--shadow-pop", value: "0 6px 20px …", usage: "Подсказка и список", kind: "shadow" },
    { name: "--r-popover", value: "12px", usage: "Радиус списка участников", kind: "radius" },
    {
      name: "--dur-f / --dur",
      value: "125 / 200 мс",
      usage: "Подсказка, список · въезд участника",
      kind: "time",
    },
    {
      name: "--ease",
      value: "cubic-bezier(.6,0,.05,.95)",
      usage: "Все движения группы",
      kind: "ease",
    },
  ],
  examples: [
    {
      id: "header",
      title: "Шапка обсуждения",
      demo: (
        <>
          <b>Груз MSKU4821907</b>
          <DemoAvGroup max={4} people={PEOPLE} />
        </>
      ),
      code: `<AvatarGroup max={4} label="Участники обсуждения" people={people} />`,
    },
    {
      id: "more",
      title: "Список скрытых",
      demo: <DemoAvGroup size="md" max={3} interactive />,
      code: `<AvatarGroup people={people} max={3} size="md" interactive />`,
    },
  ],
});
