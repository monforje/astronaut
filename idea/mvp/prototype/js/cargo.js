// Список грузов: поиск, фильтры по клиенту и статусу, «только зависшие». Клик по строке — карточка груза.

const rows = document.querySelector(".cargo-rows");
const search = document.querySelector(".filters__search");
const clientSel = document.querySelector(".filters__client");
const statusSel = document.querySelector(".filters__status");
const stuckBox = document.querySelector(".filters__stuck");

let screenState = "data";

// Варианты фильтров из данных
for (const key of new Set(DATA.cargos.map((c) => c.client))) {
  clientSel.add(new Option(DATA.counterparties[key].name, key));
}
for (const s of new Set(DATA.cargos.map((c) => c.status))) {
  statusSel.add(new Option(s, s));
}

function cargoRow(c) {
  const client = DATA.counterparties[c.client].name;
  const tone = c.stuck ? "warn" : c.tone;
  const problems = c.problems.length
    ? c.problems.map((p) => `<span class="badge badge--${p.includes("из 8") ? "plain" : "danger"}">${esc(p)}</span>`).join("")
    : '<span class="muted small">—</span>';
  return `<tr class="is-link" data-id="${c.id}" tabindex="0">
    <td><span class="cargo-id">${c.id}<small>${c.type}</small></span></td>
    <td>${esc(client)}</td>
    <td>${c.from} → ${c.to}</td>
    <td><span class="badge badge--${tone}">${c.status}</span>${c.stuck ? `<span class="stuck-note">Зависает: ${c.stuck}</span>` : ""}</td>
    <td>${c.updated}</td>
    <td><div class="problems">${problems}</div></td>
  </tr>`;
}

function message(html) {
  rows.innerHTML = `<tr><td colspan="6"><div class="empty">${html}</div></td></tr>`;
}

function render() {
  if (screenState === "loading") {
    rows.innerHTML = Array.from({ length: 4 }, () =>
      `<tr>${'<td><div class="skeleton"></div></td>'.repeat(6)}</tr>`).join("");
    return;
  }
  if (screenState === "error") {
    message(`<strong>Не удалось загрузить грузы</strong><span>Проверьте связь и попробуйте ещё раз</span>
      <button class="btn btn--secondary" data-toast="Загружаем заново…">Повторить</button>`);
    return;
  }
  if (screenState === "empty") {
    message(`<strong>Грузов пока нет</strong><span>Заведите первый груз: клиент, контейнер, что везём</span>
      <a class="btn btn--primary" href="cargo-new.html">Новый груз</a>`);
    return;
  }

  const q = search.value.trim().toLowerCase();
  const list = DATA.cargos.filter((c) => {
    const client = DATA.counterparties[c.client].name.toLowerCase();
    if (q && !c.id.toLowerCase().includes(q) && !client.includes(q)) return false;
    if (clientSel.value && c.client !== clientSel.value) return false;
    if (statusSel.value && c.status !== statusSel.value) return false;
    if (stuckBox.checked && !c.stuck) return false;
    return true;
  });

  if (!list.length) {
    message("<strong>Ничего не нашлось</strong><span>Измените поиск или фильтры</span>");
    return;
  }
  rows.innerHTML = list.map(cargoRow).join("");
}

rows.addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-id]");
  if (tr) location.href = `cargo-card.html?id=${tr.dataset.id}`;
});
rows.addEventListener("keydown", (e) => {
  const tr = e.target.closest("tr[data-id]");
  if (tr && e.key === "Enter") location.href = `cargo-card.html?id=${tr.dataset.id}`;
});

for (const el of [search, clientSel, statusSel, stuckBox]) el.addEventListener("input", render);

// Руководитель смотрит, грузы не заводит (03-cargo-card/business-logic.md)
if (getRole() === "head") document.querySelectorAll('a[href="cargo-new.html"]').forEach((a) => (a.hidden = true));

// ?stuck=1 — пришли с Главной по плитке «зависают»
if (new URLSearchParams(location.search).get("stuck")) stuckBox.checked = true;

stateSwitch({ data: "С данными", empty: "Пусто", loading: "Загрузка", error: "Ошибка" }, (s) => {
  screenState = s;
  render();
});
