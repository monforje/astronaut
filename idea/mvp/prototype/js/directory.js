// Справочник (юзкейс 02): список с фильтрами, очередь дублей, добавление по ИНН или иностранной компании.
// Правила — 02-directory/business-logic.md: ИНН+КПП ключ, другой КПП — филиал, ликвидированную предупреждаем, но не запрещаем.

const rows = document.querySelector(".dir-rows");
const search = document.querySelector(".dir-search");
const list = DATA.directory.map((c) => ({ ...c }));
const dupes = DATA.dupes.map((d) => ({ ...d, status: "open" }));

let filter = "all";
let screenState = "data";

function checks(c) {
  const out = [];
  if (c.liquidated) out.push(`<span class="badge badge--warn">Ликвидирована ${c.liquidated}</span>`);
  if (c.nogoslog) out.push('<span class="badge badge--danger">Нет в реестре ГосЛога</span>');
  if (c.goslog) out.push('<span class="badge badge--ok">ГосЛог: есть</span>');
  if (c.foreign) out.push('<span class="badge badge--plain">Иностранная</span>');
  if (c.branch) out.push('<span class="badge badge--plain">Филиал</span>');
  if (c.unchecked) out.push('<span class="badge badge--warn">Не проверено в ЕГРЮЛ</span>');
  const open = c.id === "romashka" ? dupes.filter((d) => d.status === "open").length : 0;
  if (open) out.push(`<span class="badge badge--warn">Похожих в очереди: ${open}</span>`);
  if (!out.length && !c.foreign) out.push('<span class="badge badge--ok">ЕГРЮЛ: действует</span>');
  return out.join("");
}

function renderList() {
  if (screenState === "loading") {
    rows.innerHTML = Array.from({ length: 5 }, () => `<tr>${'<td><div class="skeleton"></div></td>'.repeat(5)}</tr>`).join("");
    return;
  }
  if (screenState === "empty") {
    rows.innerHTML = `<tr><td colspan="5"><div class="empty"><strong>Справочник пока пустой</strong>
      <span>Добавьте первого контрагента — по ИНН подтянем данные из ЕГРЮЛ</span>
      <button class="btn btn--primary" data-act="add">Добавить</button></div></td></tr>`;
    return;
  }
  const q = search.value.trim().toLowerCase();
  const shown = list.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q) && !(c.inn || "").includes(q)) return false;
    if (filter === "dupes") return c.id === "romashka" && dupes.some((d) => d.status === "open");
    if (filter === "problems") return c.liquidated || c.nogoslog || c.unchecked;
    return true;
  });
  rows.innerHTML = shown.length
    ? shown.map((c) => `<tr class="is-link" data-id="${c.id}" tabindex="0">
        <td><span class="dir-name">${esc(c.name)}${c.nameCn ? `<small>${c.nameCn}</small>` : ""}<small>${c.city}</small></span></td>
        <td>${c.kind}</td>
        <td class="mono">${c.inn ? `${c.inn}${c.kpp ? ` / ${c.kpp}` : ""}` : `USCC ${c.uscc}`}</td>
        <td><div class="checks-cell">${checks(c)}</div></td>
        <td class="num">${c.cargos}</td></tr>`).join("")
    : '<tr><td colspan="5"><div class="empty"><strong>Ничего не нашлось</strong><span>Измените поиск или фильтр</span></div></td></tr>';
}

/* ---------- Очередь дублей ---------- */

const FIELDS = [["name", "Название"], ["inn", "ИНН"], ["kpp", "КПП"], ["city", "Город"]];

function renderDupes() {
  const open = dupes.filter((d) => d.status === "open").length;
  const count = document.querySelector(".js-dupes-count");
  count.textContent = open;
  count.hidden = !open;

  const side = (r, other) => `<div class="pair__side">
    <span class="small muted">Источник: <b>${r.source}</b></span>
    ${FIELDS.map(([k, label]) => `<div class="pair__row ${r[k] !== other[k] ? "is-diff" : ""}"><span>${label}</span><span>${esc(r[k])}</span></div>`).join("")}
  </div>`;

  document.querySelector('[data-panel="dupes"]').innerHTML = `
    <p class="muted">Похожие записи из разных систем. Точные совпадения по ИНН и КПП мы уже объединили сами, здесь — то, что решает человек. Различия подсвечены.</p>
    ${!open ? '<div class="alert"><div><strong>Очередь пуста.</strong> Все похожие записи разобраны.</div></div>' : ""}
    ${dupes.map((d) => `<article class="card">
      <div class="card__head"><h3>${d.hint}</h3>
        ${d.status === "merged" ? '<span class="badge badge--ok">Объединены</span>' : d.status === "separate" ? '<span class="badge badge--plain">Оставлены раздельно</span>' : ""}</div>
      <div class="pair">${side(d.a, d.b)}${side(d.b, d.a)}</div>
      ${d.status === "open" ? `<div class="row"><span class="spacer"></span>
        <button class="btn btn--secondary" data-dupe="separate" data-id="${d.id}">Это разные</button>
        <button class="btn btn--primary" data-dupe="merge" data-id="${d.id}">Объединить</button></div>` : ""}
    </article>`).join("")}`;
}

let merging = null;
document.querySelector('[data-panel="dupes"]').addEventListener("click", (e) => {
  const b = e.target.closest("[data-dupe]");
  if (!b) return;
  const d = dupes.find((x) => x.id === b.dataset.id);
  if (b.dataset.dupe === "separate") {
    d.status = "separate";
    toast("Оставили раздельно. Больше не предложим");
    render();
  } else {
    merging = d;
    document.querySelector(".merge-text").innerHTML =
      `Останется одна запись <b>${esc(d.a.name)}</b> (ИНН ${d.a.inn}). Всё, что ссылалось на «${esc(d.b.name)}» из системы «${d.b.source}», будет ссылаться на неё.`;
    document.getElementById("merge-dialog").showModal();
  }
});
document.querySelector(".merge-ok").addEventListener("click", () => {
  merging.status = "merged";
  document.getElementById("merge-dialog").close();
  toast("Записи объединены");
  render();
});

/* ---------- Добавить ---------- */

const addDialog = document.getElementById("add-dialog");
const result = document.querySelector(".add-result");
let kind = "ru";
let found = null;

segmented(addDialog.querySelector(".segmented"), "kind", (k) => {
  kind = k;
  addDialog.querySelector(".add-ru").hidden = k !== "ru";
  addDialog.querySelector(".add-foreign").hidden = k !== "foreign";
});

function registryBlock(c) {
  return `<div class="registry">
    <div><span>Название</span>${esc(c.name)}</div>
    <div><span>Адрес</span>${esc(c.address)}</div>
    <div><span>Руководитель</span>${esc(c.head)}</div>
    <div><span>Статус в ЕГРЮЛ</span>${c.status}</div>
  </div>`;
}

addDialog.querySelector(".add-find").addEventListener("click", () => {
  const inn = addDialog.querySelector(".add-inn").value.trim();
  const role = addDialog.querySelector(".add-role").value;
  found = null;
  if (screenState === "registry-down") {
    found = { name: `Компания с ИНН ${inn}`, inn, unchecked: true };
    result.innerHTML = `<div class="alert alert--warn"><div>Данные из ЕГРЮЛ пока недоступны. Можно сохранить и дополнить позже — запись будет помечена «не проверено».</div>
      <button class="btn btn--secondary btn--sm add-find-retry">Повторить</button></div>`;
    return;
  }
  if (!/^\d{10}(\d{2})?$/.test(inn)) {
    result.innerHTML = '<p class="field__error">ИНН — 10 цифр для компании или 12 для ИП</p>';
    return;
  }
  const existing = list.find((c) => c.inn === inn && !c.branch);
  if (existing) {
    const liq = existing.liquidated
      ? `<div class="alert alert--warn"><div><strong>Ликвидирована ${existing.liquidated}.</strong> Точно работать с ней?</div></div>` : "";
    result.innerHTML = `${liq}<div class="alert"><div>Такая компания уже есть в Справочнике: <strong>${esc(existing.name)}</strong>. Новую создавать не нужно.</div>
      <a class="btn btn--primary btn--sm" href="counterparty.html?id=${existing.id}">Открыть</a></div>`;
    return;
  }
  if (inn !== "0000000007") {
    result.innerHTML = '<div class="alert alert--danger"><div>Такого ИНН нет в реестре. Проверьте цифры</div></div>';
    return;
  }
  found = { id: "primer-log", name: "ООО «Пример-Логистик»", kind: role, inn, city: "Владивосток", cargos: 0,
    address: "г. Владивосток", head: "Сидоров С. С.", status: "действует", goslog: role === "Перевозчик" };
  result.innerHTML = `
    <p class="small muted">Из ЕГРЮЛ</p>
    ${registryBlock(found)}
    ${role === "Перевозчик" ? '<div class="alert"><div><strong>Реестр ГосЛога:</strong> есть</div></div>' : ""}
    <p class="small muted">Нашли похожих — проверьте, не та же ли это компания</p>
    <div class="similar"><div style="flex:1"><strong>ООО «Пример-Импорт»</strong><br><span class="small muted">ИНН 0000000005 · другой ИНН, похожее название</span></div>
      <a class="btn btn--secondary btn--sm" href="counterparty.html?id=primer">Это она</a>
      <button class="btn btn--ghost btn--sm" data-similar="other">Это другая</button></div>`;
});

// Решил ли менеджер про похожую запись. Не решил — после сохранения пара уйдёт в очередь дублей
let similarDecided = false;

result.addEventListener("click", (e) => {
  if (e.target.closest(".add-find-retry")) toast("Реестр всё ещё не отвечает. Повторим сами позже");
  const s = e.target.closest("[data-similar]");
  if (s) {
    similarDecided = true;
    s.closest(".similar").innerHTML = '<span class="small muted">Отметили: ООО «Пример-Логистик» и ООО «Пример-Импорт» — разные компании</span>';
  }
});

addDialog.querySelector(".add-save").addEventListener("click", () => {
  if (kind === "foreign") {
    const name = addDialog.querySelector(".add-foreign input").value.trim() || "Иностранная компания";
    list.push({ id: "foreign-new", name, kind: "Поставщик", uscc: "—", city: "Китай", foreign: true, cargos: 0 });
  } else if (found) {
    list.push({ kind: "Клиент", city: "—", cargos: 0, ...found });
    if (found.id === "primer-log" && !similarDecided) {
      dupes.push({
        id: "primer", status: "open", hint: "Похожие названия, разные ИНН — проверьте, не одна ли это компания",
        a: { source: "Справочник", name: "ООО «Пример-Импорт»", inn: "0000000005", kpp: "—", city: "Владивосток" },
        b: { source: "Справочник, новая", name: "ООО «Пример-Логистик»", inn: "0000000007", kpp: "—", city: "Владивосток" },
      });
      addDialog.close();
      toast("Сохранено. Похожая запись ушла в очередь проверки, вам пришло сообщение в MAX");
      render();
      return;
    }
  } else {
    result.innerHTML = '<p class="field__error">Сначала найдите компанию по ИНН</p>';
    return;
  }
  addDialog.close();
  toast("Контрагент сохранён и доступен при заведении груза");
  location.hash = "list";
  render();
});

document.addEventListener("click", (e) => {
  if (e.target.closest('[data-act="add"]')) {
    result.innerHTML = "";
    addDialog.querySelector(".add-inn").value = "";
    found = null;
    similarDecided = false;
    addDialog.showModal();
  }
});

/* ---------- Общее ---------- */

rows.addEventListener("click", (e) => {
  const tr = e.target.closest("tr[data-id]");
  if (tr && DATA.directory.some((c) => c.id === tr.dataset.id)) location.href = `counterparty.html?id=${tr.dataset.id}`;
});
search.addEventListener("input", renderList);
segmented(document.querySelector('[data-panel="list"] .segmented'), "filter", (f) => {
  filter = f;
  renderList();
});

function render() {
  renderList();
  renderDupes();
}

hashTabs();
stateSwitch({ data: "С данными", empty: "Пусто", loading: "Загрузка", "registry-down": "Реестр не отвечает" }, (s) => {
  screenState = s;
  render();
});
