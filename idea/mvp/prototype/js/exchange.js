// Обмен (юзкейс 08): путь сообщения по шагам, «как пришло / как ушло», недоставленные и повтор.
// Причина ошибки — по-русски, без кодов. Повтор ЭТрН — только с подтверждением.

const exId = new URLSearchParams(location.search).get("id") || "1c-kontur";
const ex = DATA.exchanges.find((x) => x.id === exId) || DATA.exchanges[0];
const $ = (s) => document.querySelector(s);
const STATE_LABEL = { ok: "работает", warn: "внимание", danger: "упал" };

let screenState = "data";
let undelivered = [];

// Сценарий по обмену: шаги пути и данные до/после
const SCENARIOS = {
  "1c-kontur": {
    msg: "ЭТрН по заявке № 518",
    steps: [
      { title: "Пришло из 1С", time: "09:50:02", text: "Заказ № 518 с реквизитами и грузом" },
      { title: "Преобразовали", time: "09:50:02", text: "Поля 1С разложены по полям ЭТрН" },
      { title: "Проверили", time: "09:50:03", text: "ИНН заполнены, масса и места есть" },
      { title: "Отправили в Контур", time: "09:50:04", text: "Истёк токен Контура. Контур не пускает, пока токен не обновят", bad: true },
    ],
    in: [["Заказ.Номер", "518"], ["Контрагент.Наименование", "ООО «Ромашка»"], ["Контрагент.ИНН", "0000000001"], ["Перевозчик.ИНН", "0000000002"], ["Груз.Вес", "18420"], ["Груз.КоличествоМест", "120"], ["АдресПогрузки", "Владивосток"], ["АдресВыгрузки", "Хабаровск"]],
    out: [["Номер", "518"], ["Грузоотправитель", "ООО «Ромашка», ИНН 0000000001"], ["Перевозчик", "ООО «Дальавто», ИНН 0000000002"], ["Масса брутто", "18 420 кг"], ["Количество мест", "120"], ["Пункт погрузки", "Владивосток"], ["Пункт выгрузки", "Хабаровск"], ["Статус", "не доставлено — истёк токен"]],
  },
  "mail-docs": {
    msg: "Письмо от поставщика, 14.11 08:12",
    steps: [
      { title: "Пришло на почту", time: "08:12:40", text: "Письмо на docs@example.ru" },
      { title: "Нашли вложения", time: "08:12:41", text: "Вложений нет — письмо пропущено", warn: true },
      { title: "Распознали", time: "—", text: "Не нужно", skip: true },
      { title: "Положили в карточку", time: "—", text: "Не нужно", skip: true },
    ],
    in: [["От", "supplier@example.com"], ["Тема", "Re: shipment MSKU1234567"], ["Вложения", "нет"]],
    out: [["Что сделали", "Пропустили: в письме нет документов"], ["Совет", "Если в письме ссылка на файл, скачайте и загрузите в карточку вручную"]],
  },
  "b24-dir": {
    msg: "Компания «Ромашка ООО»",
    steps: [
      { title: "Пришло из Битрикс24", time: "08:30:10", text: "Компания изменена в CRM" },
      { title: "Сопоставили", time: "08:30:10", text: "Похожа на ООО «Ромашка» в Справочнике" },
      { title: "Проверили", time: "08:30:11", text: "Название пишется иначе — нужна проверка человеком", warn: true },
      { title: "Положили в очередь", time: "08:30:11", text: "Очередь проверки дублей" },
    ],
    in: [["TITLE", "Ромашка ООО"], ["UF_INN", "0000000001"], ["PHONE", "+7 000 000-00-00"]],
    out: [["Куда", "Справочник → очередь проверки дублей"], ["Похожа на", "ООО «Ромашка», ИНН 0000000001"]],
  },
};

const sc = SCENARIOS[ex.id];

function payload(rows) {
  return `<div class="table-wrap payload"><table class="table"><tbody>${rows.map(([k, v]) => `<tr><td class="mono">${k}</td><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div>`;
}

function render() {
  document.querySelectorAll(".js-name").forEach((el) => (el.textContent = ex.name));
  document.title = `${ex.name} — Astronaut`;
  const state = ex.id === "1c-kontur" && !undelivered.length && screenState !== "data" ? "ok" : ex.state;
  $(".js-meta").innerHTML = `<span class="badge badge--${state}">${STATE_LABEL[state]}</span>
    <span class="badge badge--plain">${ex.env}</span><span class="muted small">сегодня ${ex.today} сообщений</span>`;

  let banner = "";
  if (ex.id === "1c-kontur") {
    if (screenState === "retrying") banner = '<div class="alert alert--info"><div><strong>Повтор идёт…</strong> Отправляем недоставленные заново.</div></div>';
    else if (screenState === "retry-failed") banner = '<div class="alert alert--danger"><div><strong>Повтор не помог:</strong> токен Контура всё ещё не обновлён. Сообщения остались в недоставленных.</div><a class="btn btn--primary btn--sm" href="connections.html">Обновить токен</a></div>';
    else if (undelivered.length) banner = `<div class="alert alert--danger"><div><strong>Обмен не работает 10 минут. Истёк токен Контура.</strong> Обновите токен в «Подключениях», потом нажмите «Повторить».
      <br><span class="small muted">В 09:50 ушло сообщение в MAX Игорю П.: «Обмен 1С → Контур не работает 10 минут. Истёк токен Контура». Если MAX недоступен — дублируем на почту.</span></div>
      <a class="btn btn--primary btn--sm" href="connections.html">Обновить токен</a></div>`;
    else banner = '<div class="alert"><div><strong>Обмен снова работает.</strong> Недоставленных нет.</div></div>';
  } else if (ex.state === "warn") {
    banner = `<div class="alert alert--warn"><div>${ex.text}</div></div>`;
  }
  $(".js-banner").innerHTML = banner;

  $(".js-msg-name").textContent = sc.msg;
  const delivered = ex.id === "1c-kontur" && !undelivered.length;
  $(".path").innerHTML = sc.steps.map((s) => {
    const bad = s.bad && !delivered;
    const cls = bad ? "is-bad" : s.warn ? "is-warn" : s.skip ? "is-skip" : "";
    return `<li class="${cls}"><strong>${s.title}</strong><span class="path__time">${s.time}</span>
      <span class="small">${bad || !s.bad ? s.text : "Доставлено"}</span></li>`;
  }).join("");

  $('[data-panel="in"]').innerHTML = payload(sc.in);
  $('[data-panel="out"]').innerHTML = payload(delivered ? sc.out.map(([k, v]) => [k, k === "Статус" ? "доставлено" : v]) : sc.out);

  const box = $(".js-undelivered");
  if (ex.id !== "1c-kontur") {
    box.innerHTML = '<h2>Недоставленные</h2><p class="muted">Недоставленных нет</p>';
    return;
  }
  box.innerHTML = `<div class="card__head"><h2>Недоставленные</h2>
      ${undelivered.length ? `<button class="btn btn--primary btn--sm" data-open="retry-dialog" ${screenState === "retrying" ? "disabled" : ""}>Повторить все (${undelivered.length})</button>` : ""}</div>
    ${undelivered.length
      ? `<div class="table-wrap"><table class="table"><thead><tr><th>Сообщение</th><th>Груз</th><th>Причина</th></tr></thead>
          <tbody>${undelivered.map((u) => `<tr><td>${u.what}</td><td><a class="mono" href="cargo-card.html?id=${u.cargo}#transport">${u.cargo}</a></td><td>${u.reason}</td></tr>`).join("")}</tbody></table></div>`
      : '<p class="muted">Недоставленных нет</p>'}`;
  $(".retry-list").innerHTML = undelivered.map((u) => `<li>${u.what} · <span class="mono">${u.cargo}</span></li>`).join("");
}

$(".retry-ok").addEventListener("click", () => {
  document.getElementById("retry-dialog").close();
  const willFail = screenState === "retry-failed-next";
  screenState = "retrying";
  render();
  setTimeout(() => {
    if (willFail) {
      screenState = "retry-failed";
      toast("Повтор не помог: токен не обновлён");
    } else {
      undelivered = [];
      screenState = "done";
      toast("2 ЭТрН доставлены в Контур");
    }
    render();
  }, 1800);
});

hashTabs();
stateSwitch(
  { data: "Упал, есть недоставленные", "retry-failed-next": "Повтор не поможет", done: "Починили" },
  (s) => {
    screenState = s;
    undelivered = s === "done" ? [] : DATA.undelivered.map((u) => ({ ...u }));
    render();
  },
);
