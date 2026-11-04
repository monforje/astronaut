// Карточка груза — центр всего (юзкейсы 03, 04+12, 05, 06, 07, 10).
// Вкладки по #hash. Всё состояние в `st`, каждое действие меняет st и перерисовывает экран.

const params = new URLSearchParams(location.search);
const cargoId = (params.get("id") || "MSKU1234567").toUpperCase();
const listed = DATA.cargos.find((c) => c.id === cargoId);
const ex = DATA.example;
const me = DATA.people.manager;

// Какой вариант показывать по умолчанию для грузов из списка
const DEFAULT_MODE = { MSKU7654321: "done", OOLU7778889: "done", CAIU4445556: "draftwait", TGHU1112223: "rejected" };
if (!params.get("state")) {
  const mode = cargoId === "MSKU1234567" ? "full" : DEFAULT_MODE[cargoId] || "new";
  params.set("state", mode);
  history.replaceState(null, "", `?${params}${location.hash}`);
}

let st;

function initState(mode) {
  const full = mode !== "new";
  st = {
    mode,
    docs: full ? ex.documents.map((d) => ({ ...d })) : [],
    lines: full ? "check" : "none",
    uploads: [],
    failNext: mode === "readerror",
    disc: {},
    pkg: "none",
    dt: false,
    dtRemarks: false,
    events: full ? ex.events.map((e) => ({ ...e })) : [],
    stuck: mode === "stuck" || cargoId === "TGHU1112223",
    draftWait: mode === "draftwait",
    transport: null,
    rows: ex.lines.map((l) => ({ ...l })), // строки груза, правятся руками
    editRow: null, // № строки, которую сейчас правят
    viewer: { doc: "inv", hl: null, note: "" }, // просмотр документа рядом со строками
    info: { supplier: DATA.counterparties.supplier.name, from: listed?.from || "Шэньчжэнь", to: listed?.to || "Владивосток",
      goods: ex.goods, places: ex.places, gross: ex.gross },
    infoEdit: false,
    stale: [], // какие документы устарели после правки сведений
  };

  if (st.draftWait) {
    st.docs = st.docs.filter((d) => !d.draft);
    st.events = st.events.slice(0, 2);
  }
  // Зависший груз стоит на терминале: лента обрывается на выгрузке
  if (st.stuck) st.events = st.events.slice(0, 4);
  if (full && !st.draftWait) {
    for (const d of ex.discrepancies) st.disc[d.id] = { status: "open" };
  }
  if (mode === "done") {
    st.lines = "confirmed";
    for (const d of ex.discrepancies) st.disc[d.id] = { status: "closed", how: "Исправлено: загружен новый драфт", by: me.name };
    st.pkg = "sent";
    st.dt = true;
    st.dtRemarks = true;
  }
  if (full && !st.draftWait) {
    const tmode = { rejected: "rejected", operator: "operator", done: "signed" }[mode] || "waiting";
    st.transport = { mode: tmode, carrier: "dalavto", fixed: false };
  }
  if (mode === "readerror") {
    st.uploads.push({ name: "scan_0418.jpg", progress: 100, status: "error", msg: "Не удалось прочитать файл. Загрузите более чёткую копию" });
  }
  // Сбои загрузки для показа: пришёл коносамент вместо драфта, драфт от чужого контейнера
  const preset = { blfinal: "BL_final_MSKU1234567.pdf", wrongbox: "draft_MSKU7654321.pdf" }[mode];
  if (preset) {
    st.uploads.push({ name: preset, progress: 100, ...fileProblem(preset) });
    if (mode === "blfinal") st.blFinal = true;
  }
  st.events_state = { eventsload: "loading", sourceerr: "error" }[mode] || "ok";
  if (mode === "roaming") st.transport.mode = "roaming";
}

/* ---------- Помощники ---------- */

const $ = (sel) => document.querySelector(sel);
const panel = (name) => document.querySelector(`[data-panel="${name}"]`);

const openDisc = () => ex.discrepancies.filter((d) => st.disc[d.id] && st.disc[d.id].status !== "closed");
const hasDoc = (type) => st.docs.some((d) => d.type === type);
const comparable = () => hasDoc("Инвойс") && hasDoc("Упаковочный лист");
const client = () => DATA.counterparties[listed?.client || "romashka"];
const clientName = () => client().name;

function facts(pairs) {
  return `<dl class="facts">${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
}

function prefill(pairs, bad) {
  return pairs.map(([k, v]) => `<div class="${k === bad ? "is-bad" : ""}"><span>${k}</span>${v}</div>`).join("");
}

// Руководитель только смотрит (03 и 04, business-logic.md «Кто что может»)
const readOnly = getRole() === "head";

/* ---------- Документ как лист бумаги (юзкейс 04: «просмотр документа рядом со строками») ---------- */

const DOCS = {
  inv: { title: "Инвойс INV-0418", short: "Инвойс" },
  pl: { title: "Упаковочный лист PL-0418", short: "Упаковочный лист" },
  draft: { title: "Драфт коносамента", short: "Драфт" },
  order: { title: `Заявка № ${ex.order}`, short: "Заявка" },
  dt: { title: "ДТ", short: "ДТ" },
};
const DOC_KIND = { "Инвойс": "inv", "Упаковочный лист": "pl", "Драфт коносамента": "draft", "Заявка": "order", "ДТ": "dt" };

// hl — ключ подсвеченной ячейки: "3:qty", "total:gw", "packages"…
function docSheet(kind, hl) {
  const c = (key, text) => `<td data-cell="${key}" class="${key === hl ? "is-hl" : ""}">${text}</td>`;
  const lines = ex.lines;
  if (kind === "inv") {
    return `<div class="sheet"><p class="sheet__title">COMMERCIAL INVOICE No. INV-0418</p>
      <p class="sheet__meta">Seller: ${DATA.counterparties.supplier.name}<br>Buyer: Romashka Co · Currency: USD · Page 1 of 1</p>
      <table><thead><tr><th>No.</th><th>Description</th><th>Qty, ctns</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>
      ${lines.map((l) => `<tr>${c(`${l.n}:no`, l.n)}${c(`${l.n}:name`, l.en)}${c(`${l.n}:qty`, l.places)}${c(`${l.n}:price`, l.price.toFixed(2))}${c(`${l.n}:sum`, fmt(l.places * l.price))}</tr>`).join("")}
      <tr class="sheet__total"><td></td><td>TOTAL</td>${c("total:qty", ex.places)}<td></td>${c("total:sum", fmt(lines.reduce((s, l) => s + l.places * l.price, 0)))}</tr>
      </tbody></table></div>`;
  }
  if (kind === "pl") {
    return `<div class="sheet"><p class="sheet__title">PACKING LIST No. PL-0418</p>
      <p class="sheet__meta">Shipper: ${DATA.counterparties.supplier.name}<br>装箱单 · Page 1 of 1</p>
      <table><thead><tr><th>No.</th><th>Description</th><th>Ctns</th><th>G.W., kg</th></tr></thead><tbody>
      ${lines.map((l) => `<tr>${c(`${l.n}:no`, l.n)}${c(`${l.n}:name`, l.en)}${c(`${l.n}:qty`, l.places)}${c(`${l.n}:gw`, fmt(l.gross))}</tr>`).join("")}
      <tr class="sheet__total"><td></td><td>TOTAL · N.W. ${fmt(ex.net)} kg</td>${c("total:qty", ex.places)}${c("total:gw", fmt(ex.gross))}</tr>
      </tbody></table></div>`;
  }
  if (kind === "draft") {
    return `<div class="sheet"><p class="sheet__title">BILL OF LADING — DRAFT</p>
      <table><tbody>
      <tr><th>Shipper</th>${c("shipper", DATA.counterparties.supplier.name)}</tr>
      <tr><th>Consignee</th>${c("consignee", "Romashka Co")}</tr>
      <tr><th>Container</th>${c("container", cargoId)}</tr>
      <tr><th>Number of packages</th>${c("packages", "118")}</tr>
      <tr><th>Gross weight</th>${c("gross", "18 920 kg")}</tr>
      </tbody></table></div>`;
  }
  if (kind === "order") {
    return `<div class="sheet"><p class="sheet__title">Заявка № ${ex.order}</p>
      <table><tbody>
      <tr><th>Клиент</th><td>${esc(clientName())}</td></tr>
      <tr><th>Контейнер</th><td>${cargoId}</td></tr>
      <tr><th>Маршрут</th><td>${st.info.from} → ${st.info.to}</td></tr>
      <tr><th>Товар</th><td>${esc(st.info.goods)}</td></tr>
      </tbody></table><p class="sheet__meta">Источник: 1С</p></div>`;
  }
  return `<div class="sheet"><p class="sheet__title">Декларация на товары</p>
    <table><thead><tr><th>№</th><th>Товар</th><th>Мест</th><th>Код ТН ВЭД</th></tr></thead><tbody>
    ${lines.map((l) => `<tr><td>${l.n}</td><td>${l.name}</td><td>${l.places}</td>${c(`${l.n}:hs`, "[TODO]")}</tr>`).join("")}
    </tbody></table><p class="sheet__meta">Коды ТН ВЭД в фейк-данных не заданы</p></div>`;
}

// Откуда взято число в строке груза: места и цена — инвойс, вес — упаковочный лист
const CELL_SOURCE = {
  name: { doc: "inv", col: "name", label: "графа Description" },
  places: { doc: "inv", col: "qty", label: "графа Qty" },
  price: { doc: "inv", col: "price", label: "графа Unit price" },
  gross: { doc: "pl", col: "gw", label: "графа G.W." },
};

function showSource(n, field) {
  const s = CELL_SOURCE[field];
  st.viewer = { doc: s.doc, hl: `${n}:${s.col}`, note: `${DOCS[s.doc].title}, стр. 1, строка ${n}, ${s.label}` };
}

/* ---------- Шапка ---------- */

function renderHead() {
  document.querySelectorAll(".js-id").forEach((el) => (el.textContent = cargoId));
  document.title = `${cargoId} — Astronaut`;
  const status = st.mode === "new" ? { status: "Новый", tone: "plain" } : listed || { status: "Вывезен", tone: "ok" };
  const route = listed ? `${listed.from} → ${listed.to}` : st.mode === "new" ? "маршрут из формы" : "Шэньчжэнь → Владивосток";
  $(".card-meta").innerHTML = `
    <span class="badge badge--${st.stuck ? "warn" : status.tone}">${status.status}</span>
    <span>${esc(clientName())}</span><span>·</span>
    <span>${route}</span><span>·</span>
    <span>${listed?.type || "40HC"}</span>
    ${cargoId === "MSKU1234567" ? `<span>·</span><span>заявка № ${ex.order}</span>` : ""}`;

  const last = st.events.at(-1);
  $(".where-now").innerHTML = last
    ? `<div class="stack" style="--gap:0.15rem;flex:1">
         <span class="small muted">Последнее известное</span>
         <strong>${last.text}, ${last.date}</strong>
         <span class="small muted">${DATA.eventSources[last.source]}</span>
       </div>
       ${st.stuck ? '<span class="badge badge--warn">Нет новых событий 5 дней</span>' : ""}
       <button class="btn btn--ghost btn--sm" data-go="events">Все события</button>`
    : `<span class="muted">Данных по этому контейнеру пока нет. Следим с момента погрузки</span>`;

  const n = openDisc().length;
  $(".js-disc-count").hidden = !n;
  $(".js-disc-count").textContent = n;
  const t = st.transport && ["waiting", "rejected", "roaming"].includes(st.transport.mode);
  $(".js-transport-count").hidden = !t;
  $(".js-transport-count").textContent = 1;
}

/* ---------- Сведения ---------- */

function renderInfo() {
  const filled = st.mode === "new" ? 8 : listed?.filled ?? 8;
  const missing = ["Наименование товара", "Число мест", "Вес брутто"].slice(0, 8 - filled);
  const v = (x) => (st.mode === "new" ? '<span class="muted">из формы</span>' : x);
  const i = st.info;
  const empty = filled < 8;
  const staleAlert = st.stale.length
    ? `<div class="alert alert--warn"><div><strong>Сведения изменились после того, как подготовили документы.</strong> ${st.staleWhat}. Устарели: ${st.stale.join(", ")}. Подготовьте их заново. <span class="small muted">[TODO: правило, какие документы устаревают, — 03-cargo-card/business-logic.md]</span></div></div>` : "";

  // Форма правки: те же поля, что в «Новом грузе», клиент и контейнер не меняются
  const form = `<form class="info-form stack">
      <div class="form-grid">
        <label class="field"><span>Поставщик</span><input class="input" name="supplier" value="${esc(i.supplier)}"></label>
        <label class="field"><span>Откуда</span><input class="input" name="from" value="${esc(i.from)}"></label>
        <label class="field"><span>Куда</span><input class="input" name="to" value="${esc(i.to)}"></label>
        <label class="field"><span>Наименование товара</span><input class="input" name="goods" value="${esc(i.goods)}"></label>
        <label class="field"><span>Число мест</span><input class="input" name="places" value="${i.places}" inputmode="numeric"></label>
        <label class="field"><span>Вес брутто, кг</span><input class="input" name="gross" value="${i.gross}" inputmode="numeric"></label>
      </div>
      <p class="small muted">Клиента и номер контейнера не меняем: на них ссылаются документы. Нужен другой — заведите новый груз.</p>
      <div class="row"><button type="button" class="btn btn--primary" data-act="info-save">Сохранить</button><button type="button" class="btn btn--secondary" data-act="info-cancel">Отмена</button></div>
    </form>`;

  panel("info").innerHTML = `
    ${empty
      ? `<div class="alert alert--danger"><div><strong>Заполнено ${filled} из 8.</strong> Не хватает: ${missing.join(", ").toLowerCase()}. Пока не заполнено, документы не загрузить.</div></div>`
      : '<div class="alert"><div>Все обязательные сведения заполнены: <strong>8 из 8</strong></div></div>'}
    ${staleAlert}
    <div class="card">
      <div class="card__head"><h2>Сведения о грузе</h2>
        ${readOnly ? '<span class="small muted">Руководитель только смотрит</span>'
          : st.infoEdit ? "" : '<button class="btn btn--secondary btn--sm" data-act="info-edit">Редактировать</button>'}</div>
      ${st.infoEdit ? form : facts([
        ["Клиент", esc(clientName())],
        ["Поставщик", v(esc(i.supplier))],
        ["Контейнер", `<span class="mono">${cargoId}</span>, ${listed?.type || "40HC"}`],
        ["Откуда", v(esc(i.from))],
        ["Куда", v(esc(i.to))],
        ["Наименование товара", empty ? '<span class="muted">не заполнено</span>' : v(esc(i.goods))],
        ["Число мест", empty ? '<span class="muted">не заполнено</span>' : v(i.places)],
        ["Вес брутто", empty ? '<span class="muted">не заполнено</span>' : v(`${fmt(Number(i.gross))} кг`)],
      ])}
    </div>`;
}

// Сохранить сведения: если поменялись места или вес, а документы уже готовили — показать, что устарело
function saveInfo() {
  const f = panel("info").querySelector(".info-form");
  const next = Object.fromEntries(new FormData(f));
  next.places = Number(String(next.places).replace(/\s/g, "")) || st.info.places;
  next.gross = Number(String(next.gross).replace(/\s/g, "")) || st.info.gross;
  const changes = [];
  if (next.places !== st.info.places) changes.push(`число мест ${st.info.places} → ${next.places}`);
  if (next.gross !== st.info.gross) changes.push(`вес брутто ${fmt(st.info.gross)} → ${fmt(next.gross)} кг`);
  st.info = next;
  st.infoEdit = false;
  if (changes.length) {
    const stale = ["поручение экспедитору"];
    if (st.transport) stale.push("ЭТрН");
    if (st.pkg === "sent") stale.push("пакет для брокера");
    st.stale = stale;
    st.staleWhat = `Поменяли ${changes.join(", ")}`;
  }
  toast(changes.length ? "Сведения сохранены. Проверьте документы, которые устарели" : "Сведения сохранены");
}

/* ---------- Документы ---------- */

const DOC_STATUS = { uploaded: "загружен", reading: "распознаётся", ready: "готов", error: "не принят", warn: "внимание" };

function docStatus(d) {
  if (d.draft) {
    const n = ex.discrepancies.filter((x) => x.draft && st.disc[x.id]?.status !== "closed").length;
    return n ? `<span class="badge badge--danger">сверен: расхождений ${n}</span>` : '<span class="badge badge--ok">сошлось</span>';
  }
  return '<span class="badge badge--ok">готов</span>';
}

function renderPackage() {
  const n = openDisc().length;
  const filled = st.mode === "new" ? 8 : listed?.filled ?? 8;
  let body;
  if (filled < 8) {
    body = '<p class="muted">Для пакета нужно заполнить: наименование товара, число мест, вес брутто (вкладка «Сведения»)</p>';
  } else if (!comparable()) {
    body = '<p class="muted">Появится, когда документы по грузу загружены и сверены</p>';
  } else if (n) {
    body = `<div class="row"><button class="btn btn--primary" disabled>Подготовить пакет для брокера</button>
      <span class="muted small">Сначала разберите расхождения: ${n}</span></div>`;
  } else if (st.pkg === "none") {
    body = `<div class="row"><button class="btn btn--primary" data-open="package-dialog">Подготовить пакет для брокера</button>
      <span class="muted small">Документы сверены, можно собирать</span></div>`;
  } else if (!st.dt) {
    body = `<div class="row"><span class="badge badge--warn">Пакет отправлен ${esc(DATA.counterparties.broker.name)}, ответа нет</span>
      <button class="btn btn--ghost btn--sm" data-toast="Напоминание брокеру отправлено">Напомнить</button>
      <span class="spacer"></span>
      <button class="btn btn--secondary" data-act="dt-upload">Загрузить ДТ</button></div>`;
  } else {
    body = `
      <p class="small muted">ДТ сверена с инвойсом, упаковочным листом, коносаментом и ПИ. Решение по ДТ всегда за декларантом, мы только показываем.</p>
      <ul class="result-list">
        <li><span class="badge badge--ok">совпало</span> Стоимость совпала с инвойсом</li>
        <li><span class="badge badge--ok">совпало</span> Наименования: смысловое соответствие</li>
        <li><span class="badge badge--warn">обратите внимание</span> Код ТН ВЭД в позиции 3 не совпадает с платёжкой</li>
      </ul>
      <div class="row">${st.dtRemarks
        ? '<span class="badge badge--ok">Замечания отправлены брокеру</span>'
        : '<button class="btn btn--primary" data-act="dt-remarks">Отправить брокеру замечания</button>'}</div>`;
  }
  return `<div class="card"><div class="card__head"><h2>Пакет для брокера</h2>
    ${st.dt ? '<span class="badge badge--plain">ДТ загружена</span>' : ""}</div>${body}</div>`;
}

// Строки груза: слева таблица, справа документ. Клик по значению — подсветка в документе.
function renderLines() {
  const editable = st.lines === "check" && !readOnly;
  const cell = (r, field, text) =>
    `<td class="num"><button class="cell-link" data-src="${r.n}:${field}" title="Показать в документе">${text}</button></td>`;
  const rows = st.rows.map((r) => {
    const warn = r.check && st.lines === "check";
    if (st.editRow === r.n) {
      const inp = (f) => `<td class="num"><input class="input input--cell" data-f="${f}" value="${r[f]}" inputmode="numeric" aria-label="${f}"></td>`;
      return `<tr class="row--edit"><td>${r.n}</td><td>${r.name}</td>${inp("places")}${inp("gross")}${inp("price")}
        <td><div class="row" style="--gap:0.25rem"><button class="btn btn--primary btn--sm" data-act="row-save">Сохранить</button>
        <button class="btn btn--ghost btn--sm" data-act="row-cancel">Отмена</button></div></td></tr>`;
    }
    return `<tr class="${warn ? "row--warn" : ""}">
      <td>${r.n}</td>
      <td><button class="cell-link" data-src="${r.n}:name">${r.name}</button></td>
      ${cell(r, "places", r.places)}${cell(r, "gross", fmt(r.gross))}${cell(r, "price", r.price)}
      <td><div class="row" style="--gap:0.35rem">
        ${warn ? '<span class="badge badge--warn">проверьте</span>' : ""}
        ${r.edited ? '<span class="badge badge--plain" title="поправлено вручную">вручную</span>' : ""}
        ${editable ? `<button class="btn btn--ghost btn--sm" data-edit-row="${r.n}">Править</button>` : ""}
      </div></td></tr>`;
  }).join("");

  const places = st.rows.reduce((s, r) => s + Number(r.places), 0);
  const gross = st.rows.reduce((s, r) => s + Number(r.gross), 0);
  const off = places !== ex.places || gross !== ex.gross;
  const v = st.viewer;

  return `<div class="card">
    <div class="card__head"><h2>Строки груза</h2>
      ${st.lines === "confirmed"
        ? '<span class="badge badge--ok">Строки подтверждены</span>'
        : readOnly ? "" : '<button class="btn btn--primary btn--sm" data-act="lines-ok">Подтвердить строки</button>'}</div>
    <p class="small muted">Распознано из инвойса INV-0418 и упаковочного листа PL-0418. Нажмите на значение — справа покажем, откуда оно взято. Жёлтое — проверьте.</p>
    ${off ? `<div class="alert alert--warn"><div>После правки итог строк (${places} мест, ${fmt(gross)} кг) не совпадает с упаковочным листом (${ex.places} мест, ${fmt(ex.gross)} кг).</div></div>` : ""}
    <div class="lines-grid">
      <div class="table-wrap"><table class="table">
        <thead><tr><th>№</th><th>Товар</th><th class="num">Мест</th><th class="num">Брутто</th><th class="num">USD</th><th></th></tr></thead>
        <tbody>${rows}
        <tr><td></td><td><strong>Итого</strong></td><td class="num"><strong>${places}</strong></td><td class="num"><strong>${fmt(gross)}</strong></td><td></td><td></td></tr>
        </tbody></table></div>
      <aside class="viewer">
        <div class="row viewer__tabs" style="--gap:0.25rem">
          ${["inv", "pl"].map((k) => `<button class="btn btn--sm ${v.doc === k ? "btn--secondary" : "btn--ghost"}" data-viewer="${k}">${DOCS[k].short}</button>`).join("")}
        </div>
        ${docSheet(v.doc, v.hl)}
        <p class="small ${v.note ? "" : "muted"}">${v.note ? `Откуда взято: <b>${v.note}</b>` : "Нажмите на число в таблице слева"}</p>
      </aside>
    </div>
  </div>`;
}

function renderDocuments() {
  const uploads = st.uploads.map((u) => `<li>
      <span>${esc(u.name)}</span>
      <span class="badge badge--${{ error: "danger", warn: "warn", ready: "ok" }[u.status] || "plain"}">${DOC_STATUS[u.status]}</span>
      ${u.msg
        ? `<span class="small" style="grid-column:1/-1;color:var(--${u.status === "warn" ? "warn" : "danger"})">${u.msg}</span>`
        : u.status === "ready" ? "" : `<div class="progress"><span style="width:${u.progress}%"></span></div>`}
    </li>`).join("");
  const busy = st.uploads.some((u) => u.status === "reading" || u.status === "uploaded");

  const lines = st.lines === "none" ? "" : renderLines();

  const needPl = hasDoc("Инвойс") && !hasDoc("Упаковочный лист");

  panel("documents").innerHTML = `
    ${st.draftWait ? `<div class="alert alert--warn"><div><strong>Ждём драфт коносамента от линии.</strong> Когда придёт на подключённую почту, подтянется сам. Можно загрузить вручную.</div></div>` : ""}
    ${needPl ? '<div class="alert alert--warn"><div>Для сверки нужен упаковочный лист</div></div>' : ""}
    <div class="card">
      <div class="card__head"><h2>Документы</h2><span class="muted small">${st.docs.length ? `${st.docs.length} шт.` : ""}</span></div>
      <label class="dropzone">
        <strong>Перетащите файлы или нажмите, чтобы выбрать</strong>
        <span class="small muted">Инвойс, упаковочный лист, драфт коносамента, ДТ. PDF или скан, можно на английском и китайском</span>
        <input type="file" multiple hidden class="file-input">
      </label>
      ${uploads ? `<ul class="uploads">${uploads}</ul>` : ""}
      ${busy ? '<p class="small muted">Распознавание займёт около минуты. Можно закрыть страницу — пришлём в MAX, когда будет готово</p>' : ""}
      ${st.docs.length
        ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>Документ</th><th>Номер</th><th>Откуда</th><th>Статус</th><th></th></tr></thead>
            <tbody>${st.docs.map((d) => `<tr>
              <td><strong>${d.type}</strong>${d.lang ? `<br><span class="small muted">${d.lang}</span>` : ""}</td>
              <td class="mono">${d.number}</td>
              <td>${d.source}</td>
              <td>${docStatus(d)}</td>
              <td><div class="row" style="--gap:0.25rem">
                <button class="btn btn--ghost btn--sm" data-doc-open="${DOC_KIND[d.type] || "order"}">Открыть</button>
                ${d.draft ? '<button class="btn btn--ghost btn--sm" data-go="discrepancies">Результат сверки</button>' : ""}
              </div></td>
            </tr>`).join("")}</tbody></table></div>`
        : '<div class="empty"><strong>Документов пока нет</strong><span>Загрузите инвойс и упаковочный лист — строки груза появятся сами</span></div>'}
    </div>
    ${lines}
    ${renderPackage()}`;
}

// Загрузка: имитация распознавания. Тип угадываем по имени файла.
function guessType(name) {
  const n = name.toLowerCase();
  if (/dt|дт|declar/.test(n)) return "ДТ";
  if (/bl|draft|драфт|lading/.test(n)) return "Драфт коносамента";
  if (/pl|pack|упак/.test(n)) return "Упаковочный лист";
  if (/inv|инв/.test(n)) return "Инвойс";
  return hasDoc("Инвойс") ? (hasDoc("Упаковочный лист") ? "Драфт коносамента" : "Упаковочный лист") : "Инвойс";
}

// Что не так с файлом (05, 06 user-view «Когда что-то не так»). null — всё в порядке
function fileProblem(name) {
  const box = (name.match(/[a-z]{4}\d{7}/i) || [])[0]?.toUpperCase();
  if (box && box !== cargoId) return { status: "error", msg: `Номер контейнера не совпадает с карточкой: в документе ${box}, в карточке ${cargoId}` };
  if (/final|original|коносамент/i.test(name) && !/draft|драфт/i.test(name)) {
    return { status: "warn", msg: "Это не драфт, а выпущенный коносамент: исправление теперь платное", final: true };
  }
  if (guessType(name) === "ДТ" && !/\.(pdf|xml)$/i.test(name)) {
    return { status: "error", msg: "Не удалось прочитать ДТ. Загрузите PDF или XML [TODO: какие форматы]" };
  }
  return null;
}

function addFiles(names) {
  for (const name of names) {
    const u = { name, progress: 0, status: "uploaded" };
    st.uploads.push(u);
    const timer = setInterval(() => {
      u.progress = Math.min(100, u.progress + 20);
      if (u.progress >= 40) u.status = "reading";
      if (u.progress >= 100) {
        clearInterval(timer);
        const problem = fileProblem(name);
        if (st.failNext) {
          st.failNext = false;
          Object.assign(u, { status: "error", msg: "Не удалось прочитать файл. Загрузите более чёткую копию" });
        } else if (problem) {
          Object.assign(u, problem);
          if (problem.final) st.blFinal = true;
        } else {
          u.status = "ready";
          docArrived(guessType(name));
        }
      }
      render();
    }, 450);
  }
  render();
}

function docArrived(type) {
  if (type === "ДТ") {
    if (st.pkg === "sent") st.dt = true;
    st.docs.push({ type: "ДТ", number: "ДТ", source: "загружен вручную", status: "готов" });
    toast("ДТ загружена и сверена");
    return;
  }
  if (type === "Драфт коносамента") {
    st.draftWait = false;
    st.docs = st.docs.filter((d) => !d.draft);
    st.docs.push({ type, number: "драфт", source: "загружен вручную", status: "готов", draft: true });
    let fixed = 0;
    for (const d of ex.discrepancies) {
      const cur = st.disc[d.id];
      if (cur?.status === "fixing") {
        st.disc[d.id] = { status: "closed", how: "Исправлено: загружен новый драфт, сверка прошла заново", by: me.name };
        fixed++;
      } else if (!cur) st.disc[d.id] = { status: "open" };
    }
    toast(fixed ? "Новый драфт сверен: исправленное сошлось" : "Драфт сверен: есть расхождения");
    return;
  }
  if (!hasDoc(type)) st.docs.push({ type, number: type === "Инвойс" ? "INV-0418" : "PL-0418", source: "загружен вручную", status: "готов" });
  if (comparable() && st.lines === "none") {
    st.lines = "check";
    toast("Строки груза распознаны, инвойс и упаковочный лист сошлись");
  }
}

/* ---------- Расхождения ---------- */

function discCard(d) {
  const s = st.disc[d.id];
  const cls = s.status === "closed" ? "is-closed" : s.status === "assigned" ? "is-assigned" : "";
  let foot;
  if (s.status === "closed") {
    foot = `<span class="badge badge--ok">Закрыто</span> <span class="small muted">${s.how} · ${s.by}${s.comment ? ` · «${esc(s.comment)}»` : ""}</span>`;
  } else if (s.status === "assigned") {
    foot = `<span class="badge badge--warn">Назначено: ${s.to}</span> <span class="small muted">задача ушла в MAX</span>
      <span class="spacer"></span><button class="btn btn--secondary btn--sm" data-resolve-open="${d.id}">Разобрать</button>`;
  } else if (s.status === "fixing") {
    foot = `<span class="badge badge--warn">Ждём исправленный документ</span> <span class="small muted">загрузите новый драфт — сверка пройдёт заново</span>
      <span class="spacer"></span><button class="btn btn--secondary btn--sm" data-go="documents">К документам</button>`;
  } else {
    foot = `${d.hint ? `<span class="small muted">${d.hint}</span>` : ""}<span class="spacer"></span>
      <button class="btn btn--primary btn--sm" data-resolve-open="${d.id}">Разобрать</button>`;
  }
  return `<article class="disc ${cls}">
    <p class="disc__text">${d.text}</p>
    <div class="disc__sources"><span>${d.a.doc}, ${d.a.where}</span><span>${d.b.doc}, ${d.b.where}</span></div>
    <div class="row" style="--gap:0.5rem">${foot}</div>
  </article>`;
}

function renderDiscrepancies() {
  const p = panel("discrepancies");
  if (!comparable()) {
    p.innerHTML = '<div class="card"><div class="empty"><strong>Сверять пока нечего</strong><span>Загрузите инвойс и упаковочный лист во вкладке «Документы»</span><button class="btn btn--secondary" data-go="documents">К документам</button></div></div>';
    return;
  }
  const list = ex.discrepancies.filter((d) => st.disc[d.id]);
  const open = openDisc();
  const draftOpen = open.some((d) => d.draft && st.disc[d.id].status !== "fixing");
  const showNormal = hasDoc("Драфт коносамента");

  p.innerHTML = `
    <div class="grid" style="--min:12rem">
      <div class="stat ${open.length ? "stat--danger" : ""}"><span class="stat__value">${open.length}</span><span class="muted">открытых расхождений</span></div>
      <div class="stat"><span class="stat__value">${showNormal ? ex.normal.length : 0}</span><span class="muted">нормальных различий</span></div>
      <div class="stat"><span class="stat__value">${list.length - open.length}</span><span class="muted">разобрано</span></div>
    </div>
    ${!open.length ? `<div class="alert"><div><strong>Всё сошлось.</strong> ${list.length ? "Все расхождения разобраны, решения остались в истории." : "Инвойс и упаковочный лист совпадают по позициям и количеству."}</div></div>` : ""}
    ${draftOpen && st.blFinal ? `<div class="alert alert--danger"><div><strong>Драфт устарел: линия уже выпустила коносамент.</strong> Исправление теперь платное — уточните у линии стоимость.</div>
      <button class="btn btn--secondary btn--sm" data-act="letter">Подготовить письмо в линию</button></div>` : ""}
    ${draftOpen && !st.blFinal ? `<div class="alert alert--warn"><div><strong>Исправить драфт сейчас бесплатно.</strong> Когда линия выпустит коносамент, исправление станет платным.</div>
      <button class="btn btn--primary btn--sm" data-act="letter">Подготовить письмо в линию</button></div>` : ""}
    ${st.draftWait ? '<div class="alert alert--info"><div>Драфт коносамента ещё не пришёл. Когда загрузите, сверим его с упаковочным листом и карточкой.</div></div>' : ""}
    ${list.length ? `<div class="stack" style="--gap:0.75rem"><h2>Расхождения</h2>${list.map(discCard).join("")}</div>` : ""}
    ${showNormal ? `<div class="card"><h2>Нормальные различия</h2><p class="small muted">Не тревога: так бывает, разбирать не нужно</p>
      <ul class="result-list">${ex.normal.map((n) => `<li><span class="badge badge--plain">норма</span><div>${n.text}<br><span class="small muted">${n.hint}</span></div></li>`).join("")}</ul></div>` : ""}`;
}

let resolving = null;

function openResolve(id) {
  resolving = ex.discrepancies.find((d) => d.id === id);
  // Оба документа рядом, место расхождения подсвечено
  const HL = { places: ["total:qty", "packages"], gross: ["total:gw", "gross"] }[id];
  const side = (s, kind, hl) => `<div class="stack" style="--gap:0.4rem">
      <span class="small"><b>${s.doc}</b> · ${s.where}</span>${docSheet(kind, hl)}</div>`;
  $(".resolve__text").textContent = resolving.text;
  $(".compare").innerHTML = side(resolving.a, "pl", HL[0]) + side(resolving.b, "draft", HL[1]);
  $(".resolve__comment").value = "";
  $(".resolve__assign").hidden = true;
  $(".resolve__person").innerHTML = [DATA.people.head, DATA.people.manager]
    .map((p) => `<option>${p.name} · ${p.role}</option>`).join("");
  $("#resolve-dialog").showModal();
}

document.querySelectorAll("[data-resolve]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const comment = $(".resolve__comment").value.trim();
    const action = btn.dataset.resolve;
    if (action === "assign" && $(".resolve__assign").hidden) {
      $(".resolve__assign").hidden = false;
      return;
    }
    if (action === "accept") {
      st.disc[resolving.id] = { status: "closed", how: "Принято как норма", by: me.name, comment };
      toast("Расхождение закрыто, решение записано в историю");
    } else if (action === "fix") {
      st.disc[resolving.id] = { status: "fixing" };
      toast("Загрузите исправленный документ — сверим заново");
    } else {
      const to = $(".resolve__person").value.split(" · ")[0];
      st.disc[resolving.id] = { status: "assigned", to };
      toast(`Задача отправлена: ${to}, в MAX`);
    }
    $("#resolve-dialog").close();
    render();
  }),
);

function openLetter() {
  const items = openDisc().filter((d) => d.draft)
    .map((d) => `— ${d.b.where.replace("стр. 1, графа ", "")}: в драфте ${d.b.value}, по упаковочному листу ${d.a.value}`);
  $(".letter__text").value = `Добрый день!

Просим исправить драфт коносамента по контейнеру ${cargoId}:
${items.join("\n")}

Получатель «Romashka Co» оставить как есть.
Пришлите, пожалуйста, исправленный драфт.

${me.name}, ${me.role}`;
  $("#letter-dialog").showModal();
}

$(".letter__copy").addEventListener("click", () => {
  navigator.clipboard?.writeText($(".letter__text").value).catch(() => {});
  toast("Текст письма скопирован");
});

/* ---------- События ---------- */

const MAX_EVENTS = ["Погружен на судно", "Судно вышло", "Прибыл во Владивосток", "Выгружен на терминале", "Выпущен таможней", "Вывезен"];
const maxOn = new Set(["Прибыл во Владивосток", "Выпущен таможней", "Вывезен"]);

function renderEvents() {
  const list = [...st.events].reverse();
  panel("events").innerHTML = `
    <div class="row">
      <button class="btn btn--secondary" data-open="event-dialog">Отметить событие</button>
      <button class="btn btn--secondary" data-act="max">Что слать клиенту в MAX</button>
      <span class="spacer"></span>
      <span class="small muted">Море и ЖД — от агрегатора, местный этап — от терминала или отметкой</span>
    </div>
    ${st.stuck ? `<div class="alert alert--warn"><div><strong>Нет новых событий 5 дней.</strong> Терминал не отдаёт данные — отметьте выгрузку вручную.</div></div>` : ""}
    ${st.events_state === "error" ? `<div class="alert alert--danger"><div><strong>Агрегатор сейчас не отвечает.</strong> Показываем последнее известное, новые события подтянем сами. Можно отметить событие вручную. <span class="small muted">[TODO: текст]</span></div></div>` : ""}
    <div class="card">
      ${st.events_state === "loading"
        ? `<div class="stack">${'<div class="skeleton"></div>'.repeat(5)}</div>`
        : list.length
        ? `<ol class="timeline">${list.map((e) => `<li>
            <span class="timeline__date">${e.date}</span>
            <span class="timeline__text">${e.text}</span>
            <span class="badge badge--plain">${DATA.eventSources[e.source]}</span></li>`).join("")}</ol>`
        : st.mode === "new"
          ? '<div class="empty"><strong>Событий пока нет</strong><span>Данных по этому контейнеру пока нет. Проверьте номер, если груз уже в пути</span></div>'
          : '<div class="empty"><strong>Событий пока нет</strong></div>'}
    </div>`;
}

function renderMaxDialog() {
  $(".max__toggles").innerHTML = MAX_EVENTS.map((e) =>
    `<label class="switch"><input type="checkbox" value="${e}" ${maxOn.has(e) ? "checked" : ""}><span>${e}</span></label>`).join("");
  renderMaxPreview();
}

function renderMaxPreview() {
  const shown = st.events.filter((e) => maxOn.has(e.text)).slice(-3);
  $(".max-preview").innerHTML = shown.length
    ? shown.map((e) => `<p>Контейнер <b>${cargoId}</b>: ${e.text.toLowerCase()}, ${e.date}.<br><span class="muted small">Подробнее: ссылка на груз</span></p>`).join("")
    : '<span class="muted small">Сообщений не будет</span>';
}

$(".max__toggles").addEventListener("change", (e) => {
  if (e.target.checked) maxOn.add(e.target.value);
  else maxOn.delete(e.target.value);
  renderMaxPreview();
});

$(".event__save").addEventListener("click", () => {
  st.events.push({ date: $(".event__date").value, text: $(".event__type").value, source: "manager" });
  st.stuck = false;
  $("#event-dialog").close();
  toast("Событие отмечено, клиенту ушло сообщение в MAX");
  render();
});

/* ---------- Перевозка ---------- */

function cargoPrefill() {
  return [
    ["Грузоотправитель", esc(clientName())],
    ["ИНН грузоотправителя", client().inn],
    ["Грузополучатель", esc(clientName())],
    ["ИНН грузополучателя", st.transport?.mode === "rejected" && !st.transport.fixed ? "0000000010" : client().inn],
    ["Масса брутто", `${fmt(ex.gross)} кг`],
    ["Число мест", ex.places],
    ["Контейнер", cargoId],
  ];
}

function carrierCheck(key) {
  const c = DATA.counterparties[key];
  return `<div class="checks">
    <div class="alert"><div><strong>ЕГРЮЛ:</strong> действует<br><span class="small muted">${esc(c.name)}, ИНН ${c.inn}</span></div></div>
    ${c.goslog
      ? '<div class="alert"><div><strong>Реестр ГосЛога:</strong> есть</div></div>'
      : '<div class="alert alert--danger"><div><strong>Нет в реестре ГосЛога.</strong> С 01.03.2027 договор с таким перевозчиком заключать нельзя</div></div>'}
  </div>`;
}

const TITLE_STATES = {
  waiting: [
    { who: "Грузоотправитель", cls: "is-signed", text: "подписан 13.11 в 10:05" },
    { who: "Перевозчик", cls: "is-waiting", text: "не подписан 2 часа" },
    { who: "Грузополучатель", cls: "", text: "ждёт, пока подпишет перевозчик" },
  ],
  rejected: [
    { who: "Грузоотправитель", cls: "is-rejected", text: "отклонён оператором" },
    { who: "Перевозчик", cls: "", text: "не отправлен" },
    { who: "Грузополучатель", cls: "", text: "не отправлен" },
  ],
  operator: [
    { who: "Грузоотправитель", cls: "is-waiting", text: "ждёт оператора" },
    { who: "Перевозчик", cls: "", text: "не отправлен" },
    { who: "Грузополучатель", cls: "", text: "не отправлен" },
  ],
  sent: [
    { who: "Грузоотправитель", cls: "is-waiting", text: "отправлен на подпись только что" },
    { who: "Перевозчик", cls: "", text: "ждёт грузоотправителя" },
    { who: "Грузополучатель", cls: "", text: "ждёт перевозчика" },
  ],
  roaming: [
    { who: "Грузоотправитель", cls: "is-signed", text: "подписан 13.11 в 10:05" },
    { who: "Перевозчик", cls: "is-waiting", text: "отправлен 3 часа назад, не получен" },
    { who: "Грузополучатель", cls: "", text: "ждёт перевозчика" },
  ],
  signed: [
    { who: "Грузоотправитель", cls: "is-signed", text: "подписан" },
    { who: "Перевозчик", cls: "is-signed", text: "подписан" },
    { who: "Грузополучатель", cls: "is-signed", text: "подписан" },
  ],
};

function renderTransport() {
  const p = panel("transport");
  const t = st.transport;
  if (!t) {
    p.innerHTML = `<div class="card"><div class="empty"><strong>Заявок перевозчику пока нет</strong>
      <span>Данные возьмём из карточки: адреса, ИНН, массу, число мест</span>
      <button class="btn btn--primary" data-act="carrier">Новая заявка перевозчику</button></div></div>`;
    return;
  }
  const carrier = DATA.counterparties[t.carrier];
  let banner = "";
  if (t.mode === "waiting") {
    banner = `<div class="alert alert--warn"><div><strong>Перевозчик не подписал 2 часа.</strong> Через час напомним сами, потом поставим вам задачу.</div>
      <button class="btn btn--secondary btn--sm" data-act="remind">Напомнить</button></div>`;
  } else if (t.mode === "reminded") {
    banner = '<div class="alert alert--info"><div>Напоминание перевозчику отправлено только что</div></div>';
  } else if (t.mode === "rejected") {
    banner = `<div class="alert alert--danger"><div><strong>Оператор отклонил: ИНН грузополучателя не совпадает с реестром.</strong> Поле подсвечено ниже.</div>
      ${t.fixed
        ? '<button class="btn btn--primary btn--sm" data-open="resend-dialog">Отправить заново</button>'
        : '<button class="btn btn--primary btn--sm" data-act="fix-inn">Исправить</button>'}</div>`;
  } else if (t.mode === "operator") {
    banner = '<div class="alert alert--info"><div><strong>Оператор сейчас не отвечает.</strong> Повторим сами, когда восстановится. Ничего делать не нужно.</div></div>';
  } else if (t.mode === "roaming") {
    banner = `<div class="alert alert--warn"><div><strong>Документ отправлен 3 часа назад, получатель не видит.</strong> У перевозчика другой оператор ЭПД — документ идёт через роуминг. Позвоните перевозчику или напомните. <span class="small muted">[TODO: что делаем дальше]</span></div>
      <button class="btn btn--secondary btn--sm" data-act="remind">Напомнить</button></div>`;
  } else if (t.mode === "signed") {
    banner = '<div class="alert"><div><strong>ЭТрН подписана всеми.</strong></div></div>';
  }
  const titles = TITLE_STATES[t.mode === "reminded" ? "waiting" : t.mode];

  p.innerHTML = `
    <div class="card">
      <div class="card__head"><h2>Заявка перевозчику</h2><span class="badge badge--plain">${ex.transport.route}</span></div>
      ${facts([["Перевозчик", esc(carrier.name)], ["ИНН", carrier.inn], ["Масса", `${fmt(ex.gross)} кг`], ["Мест", ex.places]])}
      ${carrierCheck(t.carrier)}
    </div>
    <div class="card">
      <div class="card__head"><h2>ЭТрН</h2><span class="small muted">через оператора ЭПД «Контур»</span></div>
      ${banner}
      <div class="titles">${titles.map((x) => `<div class="title-step ${x.cls}"><strong>${x.who}</strong><span class="small muted">${x.text}</span></div>`).join("")}</div>
      <p class="small muted">Титул — часть ЭТрН, которую подписывает одна сторона. Подпись ставят в кабинете оператора ЭПД, не у нас.</p>
      ${t.mode === "rejected" ? `<div><p class="small muted">Данные документа</p><div class="prefill">${prefill(cargoPrefill(), t.fixed ? "" : "ИНН грузополучателя")}</div></div>` : ""}
    </div>
    <div class="row"><button class="btn btn--secondary" data-act="carrier">Новая заявка перевозчику</button></div>`;
}

function renderCarrierDialog() {
  const key = $(".carrier__select").value;
  $(".carrier__check").innerHTML = carrierCheck(key) + (DATA.counterparties[key].goslog ? ""
    : '<p class="small muted">Кнопка «Подготовить ЭТрН» неактивна. [TODO: блокировать или только предупреждать — 07-transport-docs/user-view.md]</p>');
  $(".carrier__prefill").innerHTML = prefill(cargoPrefill().map(([k, v]) => [k, k === "ИНН грузополучателя" ? client().inn : v]));
  const bad = !DATA.counterparties[key].goslog;
  $(".carrier__submit").disabled = bad;
  $(".carrier__submit").title = bad ? "Перевозчика нет в реестре ГосЛога [TODO: блокировать или только предупреждать]" : "";
}

$(".carrier__select").innerHTML = ["dalavto", "ivanov"].map((k) => `<option value="${k}">${DATA.counterparties[k].name}</option>`).join("");
$(".carrier__select").addEventListener("change", renderCarrierDialog);
$(".carrier__submit").addEventListener("click", () => {
  st.transport = { mode: "sent", carrier: $(".carrier__select").value, fixed: false };
  $("#carrier-dialog").close();
  toast("ЭТрН отправлена через оператора на подпись");
  render();
});

$(".resend__ok").addEventListener("click", () => {
  st.transport = { ...st.transport, mode: "sent" };
  $("#resend-dialog").close();
  toast("ЭТрН отправлена заново");
  render();
});

/* ---------- Пакет для брокера ---------- */

$(".package__broker").innerHTML = `<option>${DATA.counterparties.broker.name}</option>`;
$(".package__list").innerHTML = [
  `Контрагенты: ${clientName()}, ${DATA.counterparties.supplier.name}`,
  `Позиции: ${ex.lines.length}, мест ${ex.places}`,
  `Вес брутто ${fmt(ex.gross)} кг, нетто ${fmt(ex.net)} кг`,
  `Стоимость: ${fmt(ex.lines.reduce((s, l) => s + l.places * l.price, 0))} USD`,
  "Документы: инвойс, упаковочный лист, коносамент",
].map((x) => `<li>${esc(x)}</li>`).join("");
$(".package__send").addEventListener("click", () => {
  st.pkg = "sent";
  $("#package-dialog").close();
  toast("Пакет отправлен брокеру");
  render();
});

$(".order__prefill").innerHTML = prefill([
  ["Клиент", esc(clientName())],
  ["Контейнер", cargoId],
  ["Маршрут", "Шэньчжэнь → Владивосток"],
  ["Товар", ex.goods],
  ["Мест", ex.places],
  ["Брутто", `${fmt(ex.gross)} кг`],
]);

// Помощник подтвердил действие — показываем его в карточке
window.onAssistantApply = (action) => {
  if (action === "assign-places" && st.disc.places && st.disc.places.status !== "closed") {
    st.disc.places = { status: "assigned", to: me.name };
    render();
  }
};

/* ---------- Действия и вкладки ---------- */

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    location.hash = go.dataset.go;
    return;
  }
  const ro = e.target.closest("[data-resolve-open]");
  if (ro) {
    openResolve(ro.dataset.resolveOpen);
    return;
  }
  // Строки груза ↔ документ
  const src = e.target.closest("[data-src]");
  if (src) {
    const [n, field] = src.dataset.src.split(":");
    showSource(Number(n), field);
    render();
    return;
  }
  const vw = e.target.closest("[data-viewer]");
  if (vw) {
    st.viewer = { doc: vw.dataset.viewer, hl: null, note: "" };
    render();
    return;
  }
  const er = e.target.closest("[data-edit-row]");
  if (er) {
    st.editRow = Number(er.dataset.editRow);
    render();
    return;
  }
  const dopen = e.target.closest("[data-doc-open]");
  if (dopen) {
    const kind = dopen.dataset.docOpen;
    $(".doc-dialog__title").textContent = DOCS[kind].title;
    $(".doc-dialog__sheet").innerHTML = docSheet(kind, null);
    $("#doc-dialog").showModal();
    return;
  }
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (!act) return;
  if (act === "row-save") {
    const row = st.rows.find((r) => r.n === st.editRow);
    panel("documents").querySelectorAll("[data-f]").forEach((inp) => {
      const val = Number(inp.value.replace(/\s/g, ""));
      if (Number.isFinite(val) && val >= 0) row[inp.dataset.f] = val;
    });
    row.edited = true;
    row.check = false;
    st.editRow = null;
    toast("Строка поправлена, правка записана в историю");
  } else if (act === "row-cancel") {
    st.editRow = null;
  } else if (act === "info-edit") {
    st.infoEdit = true;
  } else if (act === "info-cancel") {
    st.infoEdit = false;
  } else if (act === "info-save") {
    saveInfo();
  } else if (act === "lines-ok") {
    st.lines = "confirmed";
    st.editRow = null;
    toast("Строки подтверждены");
  } else if (act === "letter") {
    openLetter();
    return;
  } else if (act === "max") {
    renderMaxDialog();
    $("#max-dialog").showModal();
    return;
  } else if (act === "carrier") {
    renderCarrierDialog();
    $("#carrier-dialog").showModal();
    return;
  } else if (act === "remind") {
    st.transport.mode = "reminded";
    toast("Напоминание перевозчику отправлено");
  } else if (act === "fix-inn") {
    st.transport.fixed = true;
    toast("ИНН грузополучателя взят из Справочника");
  } else if (act === "dt-upload") {
    addFiles(["DT_MSKU1234567.pdf"]);
    return;
  } else if (act === "dt-remarks") {
    st.dtRemarks = true;
    toast("Замечания отправлены брокеру");
  }
  render();
});

// Загрузка файлов: выбор и перетаскивание
document.addEventListener("change", (e) => {
  if (e.target.matches(".file-input") && e.target.files.length) addFiles([...e.target.files].map((f) => f.name));
});
document.addEventListener("dragover", (e) => {
  const z = e.target.closest(".dropzone");
  if (!z) return;
  e.preventDefault();
  z.classList.add("is-over");
});
document.addEventListener("dragleave", (e) => e.target.closest(".dropzone")?.classList.remove("is-over"));
document.addEventListener("drop", (e) => {
  const z = e.target.closest(".dropzone");
  if (!z) return;
  e.preventDefault();
  addFiles([...e.dataTransfer.files].map((f) => f.name));
});

const TABS = ["info", "documents", "discrepancies", "events", "transport"];

function showTab() {
  const tab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "info";
  document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
  document.querySelectorAll("[data-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tab));
}

document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => (location.hash = b.dataset.tab)));
window.addEventListener("hashchange", showTab);

// Руководитель: всё видно, но действий, которые меняют груз, нет
const WRITE_ACTIONS = ".dropzone, [data-resolve-open], [data-edit-row], [data-open], " +
  ["lines-ok", "letter", "max", "carrier", "remind", "fix-inn", "dt-upload", "dt-remarks", "info-edit"].map((a) => `[data-act="${a}"]`).join(", ");

function applyReadOnly() {
  if (!readOnly) return;
  document.querySelectorAll(`.page ${WRITE_ACTIONS.split(", ").join(", .page ")}`).forEach((el) => (el.hidden = true));
  if (!$(".js-readonly-note")) {
    $(".where-now").insertAdjacentHTML("beforebegin",
      '<div class="alert alert--info js-readonly-note"><div>Вы смотрите как руководитель: всё видно, менять груз, документы и расхождения может менеджер ВЭД.</div></div>');
  }
}

function render() {
  renderHead();
  renderInfo();
  renderDocuments();
  renderDiscrepancies();
  renderEvents();
  renderTransport();
  applyReadOnly();
}

stateSwitch(
  {
    full: "Как в примере",
    new: "Новый груз, пусто",
    draftwait: "Ждём драфт",
    readerror: "Файл не прочитан",
    blfinal: "Пришёл коносамент, не драфт",
    wrongbox: "Драфт с другого контейнера",
    stuck: "Груз зависает",
    eventsload: "События: загрузка",
    sourceerr: "События: агрегатор не отвечает",
    rejected: "ЭТрН отклонена",
    roaming: "ЭТрН: получатель не видит",
    operator: "Оператор недоступен",
    done: "Всё сошлось",
  },
  (mode) => {
    initState(mode);
    render();
  },
);
showTab();
