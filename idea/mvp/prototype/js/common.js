// Общее для всех страниц: боковое меню с ролями, окна, тосты, переключатель состояний экрана.
// Пункты и группы меню: idea/mvp/usecases/side-nav.md (вариант B). Текущая страница — <body data-page="…">.
// Роль выбирается внизу меню и запоминается в браузере: меню показывает только то, что можно роли.

const ROLES = {
  manager: DATA.people.manager,
  head: DATA.people.head,
  admin: DATA.people.admin,
};

const NAV = [
  {
    title: "Работа",
    items: [
      { page: "index", label: "Главная", badge: 6, roles: ["manager", "head", "admin"] },
      { page: "cargo", label: "Грузы", badge: 2, also: ["cargo-new", "cargo-card"], roles: ["manager", "head"] },
      { page: "directory", label: "Справочник", badge: 3, also: ["counterparty"], roles: ["manager", "admin"] },
    ],
  },
  {
    title: "Настройка",
    items: [
      { page: "exchanges", label: "Обмены", badge: 1, also: ["exchange", "exchange-builder"], roles: ["admin", "head"] },
      { page: "connections", label: "Подключения", badge: 1, roles: ["admin"] },
      { page: "data-access", label: "Доступ к данным", roles: ["admin"] },
    ],
  },
  {
    title: null,
    items: [{ page: "assistant", label: "Помощник", roles: ["manager", "head", "admin"] }],
  },
];

// Роль: в localStorage, но страница работает и без него
function getRole() {
  try {
    return ROLES[localStorage.getItem("proto-role")] ? localStorage.getItem("proto-role") : "manager";
  } catch {
    return "manager";
  }
}

function setRole(role) {
  try {
    localStorage.setItem("proto-role", role);
  } catch {
    /* без памяти — роль сбросится при переходе */
  }
}

// Экранирование для вставки текста в innerHTML
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function renderSideNav() {
  const nav = document.querySelector(".side-nav");
  if (!nav) return;
  const current = document.body.dataset.page;
  const role = getRole();

  const groups = NAV.map((group) => {
    const items = group.items.filter((i) => i.roles.includes(role));
    if (!items.length) return "";
    const links = items
      .map((item) => {
        const on = item.page === current || item.also?.includes(current);
        const active = on ? ' aria-current="page"' : "";
        const badge = item.badge ? `<span class="side-nav__badge">${item.badge}</span>` : "";
        return `<a class="side-nav__link" href="${item.page}.html"${active}><span>${item.label}</span>${badge}</a>`;
      })
      .join("");
    const title = group.title ? `<p class="side-nav__group-title">${group.title}</p>` : "";
    return `<div class="side-nav__group">${title}${links}</div>`;
  }).join("");

  const me = ROLES[role];
  nav.innerHTML = `
    <a class="side-nav__logo" href="index.html"><img src="img/logo-horizontal.svg" alt="Astronaut"></a>
    ${groups}
    <div class="side-nav__footer">
      <strong>${me.name}</strong>
      <label class="small muted">Роль в прототипе
        <select class="select side-nav__role">
          ${Object.entries(ROLES).map(([k, p]) => `<option value="${k}" ${k === role ? "selected" : ""}>${p.role}</option>`).join("")}
        </select>
      </label>
      <a href="#" class="muted" data-open="notify-dialog">Уведомления: MAX, почта</a>
    </div>
  `;
  // На телефоне меню прячется и выезжает по кнопке
  nav.id = "side-nav";
  nav.insertAdjacentHTML("beforebegin",
    '<button class="btn btn--secondary btn--sm nav-burger" aria-controls="side-nav" aria-expanded="false">☰ Меню</button>');
  const burger = nav.previousElementSibling;
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !nav.contains(e.target)) {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", false);
    }
  });

  nav.querySelector(".side-nav__role").addEventListener("change", (e) => {
    setRole(e.target.value);
    location.reload();
  });

  // Раздел не для этой роли: показываем, что увидит человек
  const item = NAV.flatMap((g) => g.items).find((i) => i.page === current || i.also?.includes(current));
  if (item && !item.roles.includes(role)) {
    const main = document.querySelector(".page");
    main?.insertAdjacentHTML("afterbegin",
      `<div class="alert alert--warn"><div><strong>У роли «${me.role}» нет этого пункта в меню.</strong> В продукте сюда не попасть; в прототипе показываем, чтобы было видно экран.</div></div>`);
  }
}

// Окно «Куда слать уведомления» — одно на всё приложение (юзкейс 08)
function renderNotifyDialog() {
  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="dialog" id="notify-dialog">
      <div class="dialog__body">
        <h2>Куда слать уведомления</h2>
        <p class="muted">Если MAX недоступен, дублируем на почту</p>
        <label class="switch"><input type="checkbox" checked><span>MAX</span></label>
        <label class="switch"><input type="checkbox" checked><span>Почта: anna@example.ru</span></label>
        <label class="switch"><input type="checkbox"><span>Вебхук для своей системы</span></label>
        <div class="stack" style="--gap:0.5rem">
          <p class="small muted">О чём сообщать</p>
          <label class="switch"><input type="checkbox" checked><span>Обмен упал</span></label>
          <label class="switch"><input type="checkbox" checked><span>Токен истекает через 7 дней</span></label>
          <label class="switch"><input type="checkbox" checked><span>Расхождение назначено мне</span></label>
          <label class="switch"><input type="checkbox" checked><span>ЭТрН не подписана дольше срока</span></label>
        </div>
      </div>
      <div class="dialog__actions">
        <button class="btn btn--secondary" data-close>Отмена</button>
        <button class="btn btn--primary" data-close data-toast="Настройки уведомлений сохранены">Сохранить</button>
      </div>
    </dialog>`);
}

// Тост внизу экрана
function toast(text) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 3200);
}

// data-open="id" открывает <dialog id="id">, data-close закрывает ближайший, data-toast="текст" показывает тост
document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (open && !open.disabled) {
    e.preventDefault();
    document.getElementById(open.dataset.open)?.showModal();
    return;
  }
  const close = e.target.closest("[data-close]");
  if (close) {
    e.preventDefault();
    close.closest("dialog")?.close();
  }
  const t = e.target.closest("[data-toast]");
  if (t && !t.disabled) {
    e.preventDefault();
    toast(t.dataset.toast);
  }
});

// Переключатель состояний экрана (пусто, загрузка, ошибка…) — только для показа прототипа.
// states: { key: "Подпись" }. Состояние живёт в ?state=, первое — по умолчанию.
function stateSwitch(states, onChange) {
  const keys = Object.keys(states);
  const params = new URLSearchParams(location.search);
  let current = keys.includes(params.get("state")) ? params.get("state") : keys[0];

  const box = document.createElement("label");
  box.className = "state-switch";
  box.innerHTML = `<span class="muted">Состояние экрана</span>
    <select class="select">${keys.map((k) => `<option value="${k}">${states[k]}</option>`).join("")}</select>`;
  const select = box.querySelector("select");
  select.value = current;
  select.addEventListener("change", () => {
    current = select.value;
    const p = new URLSearchParams(location.search);
    p.set("state", current);
    history.replaceState(null, "", `?${p}${location.hash}`);
    onChange(current);
  });
  document.body.append(box);
  onChange(current);
}

// Вкладки по #hash: кнопки [data-tab], панели [data-panel]. Первая вкладка — по умолчанию.
function hashTabs() {
  const names = [...document.querySelectorAll("[data-tab]")].map((b) => b.dataset.tab);
  const show = () => {
    const tab = names.includes(location.hash.slice(1)) ? location.hash.slice(1) : names[0];
    document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
    document.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tab));
  };
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => (location.hash = b.dataset.tab)));
  window.addEventListener("hashchange", show);
  show();
}

// Сегментный переключатель: кнопки [data-<attr>] в группе, нажатая — secondary, остальные — ghost
function segmented(group, attr, onPick) {
  group.addEventListener("click", (e) => {
    const b = e.target.closest(`[data-${attr}]`);
    if (!b) return;
    group.querySelectorAll(`[data-${attr}]`).forEach((x) => {
      const on = x === b;
      x.setAttribute("aria-pressed", on);
      x.className = `btn btn--sm ${on ? "btn--secondary" : "btn--ghost"}`;
    });
    onPick(b.dataset[attr]);
  });
}

renderSideNav();
renderNotifyDialog();
