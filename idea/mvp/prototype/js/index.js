// Главная: плитки «что зависло» (юзкейс 08, экран руководителя), мои задачи (04/12), строка помощника (09).

const TILES = [
  { value: 2, label: "открытых расхождения", tone: "danger", href: "cargo-card.html?id=MSKU1234567#discrepancies" },
  { value: 2, label: "ЭТрН не подписаны или отклонены", tone: "warn", href: "cargo-card.html?id=MSKU1234567#transport" },
  { value: 1, label: "груз зависает", tone: "warn", href: "cargo.html?stuck=1" },
  { value: 1, label: "обмен упал", tone: "danger", href: "exchanges.html" },
];

const TASKS = [
  { title: "Разобрать расхождение: мест 120 и 118", cargo: "MSKU1234567", tab: "discrepancies", note: "упаковочный лист и драфт коносамента · драфт исправить бесплатно", tone: "" },
  { title: "Разобрать расхождение: брутто 18 420 и 18 920 кг", cargo: "MSKU1234567", tab: "discrepancies", note: "разница 500 кг, больше допуска", tone: "" },
  { title: "Перевозчик не подписал ЭТрН 2 часа", cargo: "MSKU1234567", tab: "transport", note: "ООО «Дальавто», заявка № 518", tone: "warn" },
  { title: "ЭТрН отклонена оператором", cargo: "TGHU1112223", tab: "transport", note: "ИНН грузополучателя не совпадает с реестром", tone: "" },
  { title: "Нет новых событий 5 дней", cargo: "TGHU1112223", tab: "events", note: "отметьте выгрузку вручную, если терминал молчит", tone: "warn" },
  { title: "Дозаполнить сведения: 5 из 8", cargo: "CAIU4445556", tab: "info", note: "наименование товара, число мест, вес брутто", tone: "warn" },
];

// Админ: обмены и подключения. Ссылка ведёт не в карточку груза, а в href.
const ADMIN_TASKS = [
  { title: "Обмен «1С → Контур (ЭТрН)» не работает 10 минут", href: "exchange.html?id=1c-kontur", note: "истёк токен Контура · не доставлены 2 ЭТрН", tone: "" },
  { title: "Обновить токен Контура", href: "connections.html", note: "предупреждали 07.11, истёк сегодня в 09:50", tone: "" },
  { title: "2 письма пропущены в обмене «Почта → Документы»", href: "exchange.html?id=mail-docs", note: "нет вложений — проверьте, не документы ли это", tone: "warn" },
  { title: "3 похожие записи в очереди дублей", href: "directory.html#dupes", note: "ООО «Ромашка»", tone: "warn" },
];

// Руководитель: без технических деталей — что зависло по людям
const HEAD_TASKS = [
  { title: "Открытые расхождения: 2", href: "cargo-card.html?id=MSKU1234567#discrepancies", note: "у Анны К. · MSKU1234567 · драфт ещё можно исправить бесплатно", tone: "" },
  { title: "ЭТрН не подписаны или отклонены: 2", href: "cargo.html", note: "MSKU1234567 ждёт перевозчика 2 часа · TGHU1112223 отклонена", tone: "warn" },
  { title: "Груз зависает: 1", href: "cargo.html?stuck=1", note: "TGHU1112223 · нет новых событий 5 дней", tone: "warn" },
  { title: "Обмен с Контуром не работает", href: "exchanges.html", note: "админ уже получил сообщение в MAX", tone: "" },
];

const DONE = [
  { title: "Драфт исправлен линией, сверка прошла заново", cargo: "OOLU7778889", tab: "discrepancies", note: "Анна К., 06.11", tone: "done" },
];

const EXCHANGES = [
  { name: "1С → Контур (ЭТрН)", state: "danger", text: "Не работает 10 минут. Истёк токен Контура" },
  { name: "Почта → Документы", state: "warn", text: "Работает. На последнем запуске 2 письма пропущены: нет вложений" },
  { name: "Битрикс24 → Справочник", state: "ok", text: "Работает" },
];

document.querySelector(".stuck-tiles").innerHTML = TILES.map((t) =>
  `<a class="stat stat--${t.tone}" href="${t.href}"><span class="stat__value">${t.value}</span><span class="muted">${t.label}</span></a>`).join("");

const role = getRole();
const person = ROLES[role];
document.querySelector(".js-hello").textContent = `Добрый день, ${person.name.split(" ")[0]}`;
if (role === "head") {
  document.querySelector(".js-hello-sub").textContent = "Что зависло по компании. Без технических деталей";
  document.querySelector(".js-tasks-title").textContent = "Что зависло";
}
if (role === "admin") document.querySelector(".js-hello-sub").textContent = "Обмены, подключения и всё, что требует вашего внимания";

function renderTasks(which) {
  const open = role === "admin" ? ADMIN_TASKS : role === "head" ? HEAD_TASKS : TASKS;
  const list = which === "done" ? DONE : open;
  document.querySelector(".tasks").innerHTML = list.map((t) => `<li>
    <span class="task__dot ${t.tone ? `task__dot--${t.tone}` : ""}"></span>
    <div class="task__body">
      <span class="task__title">${esc(t.title)}</span>
      <span class="small muted">${t.cargo ? `<span class="mono">${t.cargo}</span> · ` : ""}${esc(t.note)}</span>
    </div>
    <a class="btn btn--secondary btn--sm" href="${t.href || `cargo-card.html?id=${t.cargo}#${t.tab}`}">Открыть</a>
  </li>`).join("");
}

document.querySelector(".task-filter").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b) return;
  document.querySelectorAll("[data-filter]").forEach((x) => {
    const on = x === b;
    x.setAttribute("aria-pressed", on);
    x.className = `btn btn--sm ${on ? "btn--secondary" : "btn--ghost"}`;
  });
  renderTasks(b.dataset.filter);
});

document.querySelector(".exchanges-brief").innerHTML = `<ul class="tasks">${EXCHANGES.map((x) => `<li>
  <span class="task__dot ${x.state === "danger" ? "" : `task__dot--${x.state === "ok" ? "done" : "warn"}`}"></span>
  <div class="task__body"><span class="task__title">${x.name}</span><span class="small muted">${x.text}</span></div>
</li>`).join("")}</ul>`;

document.querySelector(".ask").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector(".ask__input");
  assistantPanel.open(input.value.trim() || input.placeholder.replace(/^.*«(.*)».*$/, "$1"));
  input.value = "";
});

renderTasks("open");
