// Обмены (юзкейс 08): сводка «работает / внимание / упало», список, журнал действий.
// Руководитель видит только общий экран без технических деталей.

const role = getRole();
const STATE_LABEL = { ok: "работает", warn: "внимание", danger: "упал" };
let screenState = "data";

function exchanges() {
  if (screenState === "empty") return [];
  if (screenState === "allgood") return DATA.exchanges.map((x) => ({ ...x, state: "ok", text: "Работает", failed: 0 }));
  return DATA.exchanges;
}

function render() {
  const list = exchanges();
  const n = (s) => list.filter((x) => x.state === s).length;
  document.querySelector(".js-tiles").innerHTML = `
    <div class="stat stat--ok"><span class="stat__value">${n("ok")}</span><span class="muted">работают</span></div>
    <div class="stat stat--warn"><span class="stat__value">${n("warn")}</span><span class="muted">требуют внимания</span></div>
    <div class="stat stat--danger"><span class="stat__value">${n("danger")}</span><span class="muted">упали</span></div>
    <div class="stat"><span class="stat__value">${list.reduce((s, x) => s + x.today, 0)}</span><span class="muted">сообщений сегодня</span></div>`;

  const rows = document.querySelector(".ex-rows");
  if (!list.length) {
    rows.innerHTML = `<tr><td colspan="5"><div class="empty"><strong>Обменов пока нет</strong>
      <span>Соберите первый из шаблона или попросите помощника</span><a class="btn btn--primary" href="exchange-builder.html">Собрать обмен</a></div></td></tr>`;
    return;
  }
  // Проблемные сверху
  const order = { danger: 0, warn: 1, ok: 2 };
  rows.innerHTML = [...list].sort((a, b) => order[a.state] - order[b.state]).map((x) => `
    <tr class="${role === "head" ? "" : "is-link"}" data-id="${x.id}">
      <td><span class="ex-name">${x.name}</span>${role === "head" ? "" : `<span class="ex-text">${x.text}</span>`}</td>
      <td><span class="badge badge--${x.state}">${STATE_LABEL[x.state]}</span></td>
      <td class="num">${x.today}</td>
      <td class="num">${x.failed ? `<strong style="color:var(--danger)">${x.failed}</strong>` : "0"}</td>
      <td class="js-admin">${x.env}</td>
    </tr>`).join("");
  applyRole();
}

function renderJournal() {
  const q = document.querySelector(".journal-search").value.trim().toLowerCase();
  const rows = DATA.journal.filter((j) => !q || `${j.who} ${j.what}`.toLowerCase().includes(q));
  document.querySelector(".journal-rows").innerHTML = rows.length
    ? rows.map((j) => `<tr><td class="mono">${j.when}</td><td>${j.who}</td><td>${j.what}</td></tr>`).join("")
    : '<tr><td colspan="3"><div class="empty">Ничего не нашлось</div></td></tr>';
}

function applyRole() {
  if (role !== "head") return;
  document.querySelectorAll(".js-admin").forEach((el) => (el.hidden = true));
  document.querySelector(".js-head-note").innerHTML =
    '<div class="alert alert--info"><div>Общий экран для руководителя: что зависло и сколько. Чинит админ — ему уже пришло сообщение в MAX.</div></div>';
}

document.querySelector(".ex-rows").addEventListener("click", (e) => {
  const tr = e.target.closest("tr.is-link");
  if (tr) location.href = `exchange.html?id=${tr.dataset.id}`;
});
document.querySelector(".journal-search").addEventListener("input", renderJournal);

hashTabs();
renderJournal();
stateSwitch({ data: "Есть проблемы", allgood: "Всё хорошо", empty: "Пусто" }, (s) => {
  screenState = s;
  render();
});
