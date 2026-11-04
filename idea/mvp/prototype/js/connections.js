// Подключения (юзкейс 01): список с состоянием, мастер «тип → параметры → проверка», обновление токена Контура.
// Сбои мастера (неверный логин, нет прав) — через переключатель состояния экрана.

const grid = document.querySelector(".conn-grid");
const alerts = document.querySelector(".js-alerts");
const conns = DATA.connections.map((c) => ({ ...c }));
let screenState = "data";

const SHORT = { "1С": "1С", "Битрикс24": "Б24", "Почта": "@", "Оператор ЭПД": "ЭПД", "Excel": "XLS" };

function connCard(c) {
  return `<article class="card conn ${c.state !== "ok" ? `is-${c.state}` : ""}">
    <div class="card__head">
      <span class="conn__type">${SHORT[c.type] || "•"}</span>
      <h3>${c.name}</h3>
      <span class="badge badge--plain">${c.env}</span>
    </div>
    <span class="badge badge--${c.state}" style="align-self:flex-start">${c.text}</span>
    <p class="small"><span class="muted">Видим:</span> ${c.objects}</p>
    <p class="small muted">Последние данные: ${c.last}</p>
    <div class="row">
      ${c.state === "off"
        ? `<button class="btn btn--secondary btn--sm" data-enable="${c.id}">Включить</button>`
        : `${c.id === "kontur" && c.state !== "ok"
            ? '<button class="btn btn--primary btn--sm" data-open="token-dialog">Обновить токен</button>'
            : '<button class="btn btn--secondary btn--sm" data-toast="Проверка прошла: сеть, логин, права, список объектов">Проверить</button>'}
          <button class="btn btn--ghost btn--sm" data-settings="${c.id}">Настройки</button>`}
    </div>
  </article>`;
}

function render() {
  const kontur = conns.find((c) => c.id === "kontur");
  if (screenState === "expiring" && kontur.state === "danger") Object.assign(kontur, { state: "warn", text: "Токен истекает через 7 дней" });
  if (screenState === "data" && kontur.state === "warn") Object.assign(kontur, { state: "danger", text: "Токен истёк 10 минут назад" });

  const a = [];
  if (kontur.state === "danger") a.push(`<div class="alert alert--danger"><div><strong>Токен Контура истёк 10 минут назад.</strong> Обмен «1С → Контур (ЭТрН)» стоит, 2 ЭТрН не доставлены. Предупреждали 07.11.</div>
    <button class="btn btn--primary btn--sm" data-open="token-dialog">Обновить токен</button></div>`);
  if (kontur.state === "warn") a.push(`<div class="alert alert--warn"><div><strong>Токен Контура истекает через 7 дней.</strong> Обновите заранее, иначе обмен с Контуром остановится.</div>
    <button class="btn btn--secondary btn--sm" data-open="token-dialog">Обновить токен</button></div>`);
  if (screenState === "changed") a.push(`<div class="alert alert--warn"><div><strong>1С обновилась, структура изменилась.</strong> Появилось поле «Заказ.СрокДоставки», пропало «Заказ.Комментарий2». Подтвердите, что обмены можно продолжать [TODO: как показываем дифф].</div>
    <button class="btn btn--secondary btn--sm" data-toast="Изменения подтверждены">Подтвердить</button></div>`);
  alerts.innerHTML = a.join("");

  grid.innerHTML = screenState === "empty"
    ? `<div class="card" style="grid-column:1/-1"><div class="empty"><strong>Подключений пока нет</strong>
        <span>Начните с 1С: оттуда придут клиенты и заказы</span><button class="btn btn--primary" data-act="add">Добавить</button></div></div>`
    : conns.map(connCard).join("");
}

/* ---------- Мастер ---------- */

const wiz = document.getElementById("wizard");
const next = wiz.querySelector(".wiz-next");
const back = wiz.querySelector(".wiz-back");
let step = 1;
let type = null;

const TYPES = [
  { id: "1С", hint: "Бухгалтерия, УТ, ERP" },
  { id: "Битрикс24", hint: "CRM" },
  { id: "Почта", hint: "Документы из писем" },
  { id: "Excel", hint: "Файлы и таблицы" },
  { id: "Контур", hint: "Оператор ЭПД" },
  { id: "СБИС", hint: "Оператор ЭПД" },
];

const PARAMS = {
  "1С": [["Адрес публикации", "https://1c.example.ru/base"], ["Логин", "integration"], ["Пароль", "••••••••"]],
  "Битрикс24": [["Адрес портала", "https://example.bitrix24.ru"], ["Вебхук", "••••••••"]],
  "Почта": [["Ящик", "docs@example.ru"], ["Пароль приложения", "••••••••"]],
  "Excel": [["Папка или ссылка", "\\\\server\\обмен"]],
  "Контур": [["Токен", "••••••••"]],
  "СБИС": [["Логин", "integration"], ["Пароль", "••••••••"]],
};

const OBJECTS = { "1С": "Клиенты, Заказы", "Битрикс24": "Компании, Сделки", "Почта": "Письма с вложениями", "Excel": "Файлы .xlsx", "Контур": "ЭТрН, титулы", "СБИС": "ЭТрН, титулы" };

wiz.querySelector(".type-grid").innerHTML = TYPES.map((t) =>
  `<button class="type-tile" data-type="${t.id}" aria-pressed="false"><strong>${t.id}</strong><span class="small muted">${t.hint}</span></button>`).join("");

wiz.querySelector(".type-grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-type]");
  if (!b) return;
  type = b.dataset.type;
  wiz.querySelectorAll("[data-type]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  next.disabled = false;
});

function showStep(n) {
  step = n;
  wiz.querySelectorAll("[data-step-panel]").forEach((p) => (p.hidden = Number(p.dataset.stepPanel) !== n));
  wiz.querySelectorAll("[data-step]").forEach((s) => s.classList.toggle("is-on", Number(s.dataset.step) === n));
  back.hidden = n === 1;
  next.textContent = n === 1 ? "Дальше" : n === 2 ? "Проверить" : "Сохранить";
  if (n === 2) {
    wiz.querySelector('[data-step-panel="2"]').innerHTML = `
      <p class="muted">Параметры для «${type}»</p>
      <div class="form-grid">${PARAMS[type].map(([k, v]) => `<label class="field"><span>${k}</span><input class="input" value="${v}"></label>`).join("")}
        <label class="field"><span>Среда</span><select class="select"><option>Разработка</option><option>Тест</option><option>Продуктив</option></select></label>
      </div>`;
  }
  if (n === 3) runChecks();
}

function runChecks() {
  const list = wiz.querySelector('[data-step-panel="3"] .check-list');
  const res = wiz.querySelector(".wiz-result");
  const fail = { badlogin: 1, norights: 2 }[screenState];
  const items = [
    ["Сеть", "сервер отвечает"],
    ["Логин", fail === 1 ? "Не удалось войти. Проверьте логин и пароль" : "вошли"],
    ["Права", fail === 2 ? "Не хватает прав на: Заказы. Попросите администратора 1С дать доступ" : "прав хватает"],
    ["Список объектов", `видим: ${OBJECTS[type]}`],
  ];
  res.innerHTML = "";
  next.disabled = true;
  list.innerHTML = items.map(([k]) => `<li class="is-run"><span class="mark">…</span><div><strong>${k}</strong></div></li>`).join("");
  items.forEach(([k, text], i) => {
    setTimeout(() => {
      if (step !== 3) return;
      const li = list.children[i];
      const bad = fail === i;
      if (fail !== undefined && i > fail) {
        li.className = "";
        li.innerHTML = `<span class="mark">–</span><div><strong>${k}</strong><br><span class="small muted">не проверяли</span></div>`;
      } else {
        li.className = bad ? "is-bad" : "is-ok";
        li.innerHTML = `<span class="mark">${bad ? "✕" : "✓"}</span><div><strong>${k}</strong><br><span class="small ${bad ? "" : "muted"}">${text}</span></div>`;
      }
      if (i === items.length - 1) {
        if (fail !== undefined) {
          res.innerHTML = '<div class="alert alert--danger"><div>Проверка не прошла. Исправьте и проверьте снова.</div></div>';
          next.textContent = "Проверить снова";
          next.disabled = false;
          next.onclick = () => { next.onclick = null; runChecks(); };
        } else {
          res.innerHTML = `<div class="alert"><div><strong>Всё работает.</strong> Видим объекты: ${OBJECTS[type]}. Первые данные придут в течение минуты.</div></div>`;
          next.disabled = false;
        }
      }
    }, 600 * (i + 1));
  });
}

next.addEventListener("click", () => {
  if (next.onclick) return;
  if (step < 3) return showStep(step + 1);
  conns.push({ id: `new-${conns.length}`, name: type, type: ["Контур", "СБИС"].includes(type) ? "Оператор ЭПД" : type,
    env: wiz.querySelector('[data-step-panel="2"] select')?.value || "Разработка", state: "ok", text: "Работает", objects: OBJECTS[type], last: "только что" });
  wiz.close();
  render();
  toast("Подключение сохранено. Можно собирать обмен");
});
back.addEventListener("click", () => showStep(step - 1));

document.addEventListener("click", (e) => {
  if (!e.target.closest('[data-act="add"]')) return;
  type = null;
  wiz.querySelectorAll("[data-type]").forEach((x) => x.setAttribute("aria-pressed", false));
  next.disabled = true;
  next.onclick = null;
  showStep(1);
  wiz.showModal();
});

/* ---------- Токен ---------- */

document.querySelector(".token-ok").addEventListener("click", () => {
  const list = document.querySelector(".token-checks");
  list.innerHTML = '<li class="is-run"><span class="mark">…</span><div>Проверяем токен в Контуре</div></li>';
  setTimeout(() => {
    list.innerHTML = '<li class="is-ok"><span class="mark">✓</span><div>Токен работает до 14.02 [TODO: срок действия токена Контура]</div></li>';
    setTimeout(() => {
      Object.assign(conns.find((c) => c.id === "kontur"), { state: "ok", text: "Работает", last: "только что" });
      document.getElementById("token-dialog").close();
      list.innerHTML = "";
      render();
      toast("Токен обновлён. Повторите недоставленные в «Обменах»");
    }, 700);
  }, 900);
});

/* ---------- Настройки подключения ---------- */

// Какие обмены остановятся, если отключить подключение
const USED_BY = {
  "1c": ["1С → Контур (ЭТрН)"],
  kontur: ["1С → Контур (ЭТрН)"],
  b24: ["Битрикс24 → Справочник"],
  mail: ["Почта → Документы"],
};
// Что можно брать из системы (галочки «какие объекты брать»)
const ALL_OBJECTS = {
  "1С": ["Клиенты", "Заказы", "Номенклатура", "Склады"],
  "Битрикс24": ["Компании", "Сделки", "Контакты"],
  "Почта": ["Письма с вложениями", "Письма без вложений"],
  "Оператор ЭПД": ["ЭТрН", "титулы"],
};
const PARAMS_BY_TYPE = { "1С": "1С", "Битрикс24": "Битрикс24", "Почта": "Почта", "Оператор ЭПД": "Контур", "Excel": "Excel" };

const settings = document.getElementById("settings-dialog");
let editing = null;

function openSettings(id) {
  editing = conns.find((c) => c.id === id);
  settings.querySelector(".settings__title").textContent = `Настройки: ${editing.name}`;
  const params = PARAMS[PARAMS_BY_TYPE[editing.type] || editing.name] || PARAMS["1С"];
  const taken = editing.objects.split(", ");
  const all = ALL_OBJECTS[editing.type] || taken;
  settings.querySelector(".settings__form").innerHTML = `
    <div class="form-grid">
      ${params.map(([k, v]) => `<label class="field"><span>${k}</span><input class="input" value="${v}"></label>`).join("")}
      <label class="field"><span>Среда</span><select class="select settings__env">
        ${["Разработка", "Тест", "Продуктив"].map((e) => `<option ${e === editing.env ? "selected" : ""}>${e}</option>`).join("")}</select></label>
    </div>
    <div class="stack" style="--gap:0.4rem"><p class="small muted">Какие объекты брать</p>
      ${all.map((o) => `<label class="switch"><input type="checkbox" value="${o}" ${taken.includes(o) ? "checked" : ""}><span>${o}</span></label>`).join("")}
    </div>`;
  settings.querySelector(".settings__checks").innerHTML = "";
  settings.querySelector(".settings__off").innerHTML = "";
  settings.querySelector(".settings__save").disabled = false;
  settings.showModal();
}

settings.querySelector(".settings__save").addEventListener("click", () => {
  const list = settings.querySelector(".settings__checks");
  const objs = [...settings.querySelectorAll(".settings__form input[type=checkbox]:checked")].map((i) => i.value);
  const env = settings.querySelector(".settings__env").value;
  settings.querySelector(".settings__save").disabled = true;
  const steps = ["Сеть", "Логин", "Права", "Список объектов"];
  list.innerHTML = steps.map((s) => `<li class="is-run"><span class="mark">…</span><div><strong>${s}</strong></div></li>`).join("");
  steps.forEach((s, i) => setTimeout(() => {
    list.children[i].className = "is-ok";
    list.children[i].innerHTML = `<span class="mark">✓</span><div><strong>${s}</strong></div>`;
    if (i === steps.length - 1) {
      Object.assign(editing, { env, objects: objs.join(", ") || "ничего не берём", last: "только что" });
      setTimeout(() => {
        settings.close();
        render();
        toast(`Сохранено, проверка прошла. Среда: ${env}`);
      }, 500);
    }
  }, 450 * (i + 1)));
});

settings.querySelector(".settings__disable").addEventListener("click", () => {
  const box = settings.querySelector(".settings__off");
  if (box.innerHTML) return;
  const used = USED_BY[editing.id] || [];
  box.innerHTML = `<div class="alert alert--danger"><div><strong>Отключить «${editing.name}»?</strong>
      ${used.length ? `Остановятся обмены: ${used.join(", ")}.` : "Обмены от него не зависят."} Данные, которые уже пришли, останутся.</div>
      <button class="btn btn--danger btn--sm settings__disable-ok">Отключить</button></div>`;
  box.querySelector(".settings__disable-ok").addEventListener("click", () => {
    Object.assign(editing, { state: "off", text: "Отключено" });
    settings.close();
    render();
    toast(used.length ? `Отключено. Остановлены: ${used.join(", ")}` : "Отключено");
  });
});

document.addEventListener("click", (e) => {
  const s = e.target.closest("[data-settings]");
  if (s) openSettings(s.dataset.settings);
  const en = e.target.closest("[data-enable]");
  if (en) {
    const c = conns.find((x) => x.id === en.dataset.enable);
    Object.assign(c, c.id === "kontur" ? { state: "danger", text: "Токен истёк 10 минут назад" } : { state: "ok", text: "Работает" });
    render();
    toast("Подключение включено");
  }
});

stateSwitch(
  { data: "Токен истёк", expiring: "Токен истекает через 7 дней", empty: "Пусто", badlogin: "Мастер: неверный логин", norights: "Мастер: нет прав", changed: "1С изменила структуру" },
  (s) => {
    screenState = s;
    render();
  },
);
