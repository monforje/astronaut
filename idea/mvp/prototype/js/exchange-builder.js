// Конструктор обмена (юзкейс 13): шаблон или помощник → схема и поля → тестовый запуск → выкат с подтверждением.
// Жизненный цикл: черновик → тестовый прогон → Тест → Продуктив (01-connect/business-logic.md).
// Правка поля создаёт новую версию-черновик: выкатить можно только после теста (01-connect/user-view.md).

const $ = (s) => document.querySelector(s);
const STAGES = ["Черновик", "Тестовый прогон", "Тест", "Продуктив"];
let stage = 0;
let screenState = "pass";

// Поля 1С с примером значения (fake-data.md, «Поля 1С для окна „Выбор поля“»)
const SOURCE_FIELDS = [
  ["Заказ.Номер", "518"],
  ["Заказ.Дата", "13.11"],
  ["Контрагент.ИНН", "0000000001"],
  ["Контрагент.КПП", "000000001"],
  ["Грузополучатель.ИНН", "0000000001"],
  ["Перевозчик.ИНН", "0000000002"],
  ["Груз.Вес", "18 420"],
  ["Груз.ВесНетто", "16 900"],
  ["Груз.КоличествоМест", "120"],
  ["АдресПогрузки", "Владивосток"],
  ["АдресВыгрузки", "Хабаровск"],
];
const example = (f) => SOURCE_FIELDS.find(([k]) => k === f)?.[1] ?? "—";

// [поле 1С, поле ЭТрН]
let map = [];
let versions = [];
let tested = false;

function reset() {
  map = [
    ["Заказ.Номер", "Номер"],
    ["Контрагент.ИНН", "Грузоотправитель.ИНН"],
    ["Перевозчик.ИНН", "Перевозчик.ИНН"],
    ["Груз.Вес", "Масса брутто, кг"],
    ["Груз.КоличествоМест", "Количество мест"],
    ["АдресВыгрузки", "Пункт выгрузки"],
  ];
  versions = [
    { n: 2, who: "Игорь П.", when: "сегодня", what: "поправил поле «Пункт выгрузки»" },
    { n: 1, who: "помощник по просьбе Игоря П.", when: "05.11", what: "собрал черновик из шаблона" },
  ];
  tested = false;
  stage = 0;
}

function renderLifecycle() {
  $(".lifecycle").innerHTML = STAGES.map((s, i) =>
    `<li class="${i < stage ? "is-done" : i === stage ? "is-on" : ""}">${s}</li>`).join("");
  $(".js-env").textContent = stage < 3 ? "Среда: Разработка" : "Среда: Продуктив";
}

function renderVersions() {
  const now = versions[0];
  $(".versions").innerHTML = versions.map((x, i) => `<li>
    <span class="badge ${i === 0 ? (now.draft ? "badge--warn" : "badge--ok") : "badge--plain"}">версия ${x.n}${x.draft ? " · черновик" : ""}</span>
    <span>${x.what}</span><span class="small muted">${x.who}, ${x.when}</span><span class="spacer"></span>
    ${i === 0 ? '<span class="small muted">сейчас</span>'
      : `<button class="btn btn--ghost btn--sm" data-toast="Показали разницу между версиями ${x.n} и ${now.n}">Сравнить</button>
         <button class="btn btn--ghost btn--sm" data-toast="Откатились на версию ${x.n}">Откатить</button>`}
  </li>`).join("");
  const deploy = $(".deploy-btn");
  deploy.disabled = !tested || stage === 3;
  deploy.textContent = stage === 3 ? "Выкачено" : "Выкатить в Продуктив";
  deploy.title = tested ? "" : "Сначала тестовый запуск";
  $(".js-deploy-version").textContent = `версия ${now.n}`;
}

function renderMap() {
  $(".map-rows").innerHTML = map.map(([a, b], i) =>
    `<tr><td class="mono">${a}</td><td class="map-arrow">→</td><td>${b}</td><td class="muted">${example(a)}</td>
      <td><button class="btn btn--ghost btn--sm" data-map-edit="${i}">Изменить</button></td></tr>`).join("");
}

function openBuilder() {
  $(".js-start").hidden = true;
  $(".js-builder").hidden = false;
  renderMap();
  renderLifecycle();
  renderVersions();
}

$("[data-template]").addEventListener("click", openBuilder);
$(".ask-btn").addEventListener("click", () => {
  assistantPanel?.open($(".ask-text").value.trim() || "Собери обмен заявок из 1С в Контур");
});

/* ---------- Выбор поля ---------- */

const fieldDialog = document.getElementById("field-dialog");
let editingRow = null;

$(".map-rows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-map-edit]");
  if (!b) return;
  editingRow = Number(b.dataset.mapEdit);
  const [cur, target] = map[editingRow];
  $(".field__target").textContent = target;
  $(".field-list").innerHTML = SOURCE_FIELDS.map(([f, v]) => `<label class="field-option">
      <input type="radio" name="src-field" value="${f}" ${f === cur ? "checked" : ""}>
      <span class="mono">${f}</span><span class="muted">${v}</span></label>`).join("");
  fieldDialog.showModal();
});

$(".field-apply").addEventListener("click", () => {
  const chosen = fieldDialog.querySelector("input[name=src-field]:checked")?.value;
  const [cur, target] = map[editingRow];
  fieldDialog.close();
  if (!chosen || chosen === cur) return;
  map[editingRow] = [chosen, target];
  const now = versions[0];
  const what = `«${target}» берём из ${chosen} вместо ${cur}`;
  if (now.draft) now.what = `${now.what}; ${what}`;
  else versions.unshift({ n: now.n + 1, who: ROLES[getRole()].name, when: "только что", what, draft: true });
  tested = false;
  stage = 0;
  $(".test-result").innerHTML = '<div class="alert alert--warn"><div>Поле поменяли — нужна новая проверка. Пока тест не пройдёт, выкатить нельзя.</div></div>';
  renderMap();
  renderLifecycle();
  renderVersions();
  toast(`Новая версия-черновик ${versions[0].n}`);
});

/* ---------- Тест и выкат ---------- */

$(".test-btn").addEventListener("click", () => {
  const box = $(".test-result");
  $(".test-btn").disabled = true;
  stage = 1;
  renderLifecycle();
  box.innerHTML = '<div class="progress"><span style="width:10%"></span></div><p class="small muted">Тест идёт: берём 2 последних заказа из 1С…</p>';
  setTimeout(() => (box.querySelector(".progress span").style.width = "70%"), 300);
  setTimeout(() => {
    $(".test-btn").disabled = false;
    if (screenState === "fail") {
      tested = false;
      stage = 0;
      box.innerHTML = `<div class="alert alert--danger"><div><strong>Тест упал.</strong> Заказ № 519: поле ИНН грузополучателя пустое. Заполните ИНН в 1С или в Справочнике и запустите снова.</div></div>
        <ul class="small"><li>Заказ № 518 — прошёл</li><li>Заказ № 519 — поле ИНН пустое</li></ul>`;
    } else {
      tested = true;
      stage = 2;
      versions[0].draft = false;
      box.innerHTML = `<div class="alert"><div><strong>Тест прошёл.</strong> 2 заказа из 1С прошли все шаги. В Контур ничего не записано.</div></div>
        <ul class="small"><li>Заказ № 518 — прошёл</li><li>Заказ № 519 — прошёл</li></ul>`;
    }
    renderLifecycle();
    renderVersions();
  }, 1600);
});

$(".deploy-btn").addEventListener("click", () => document.getElementById("deploy-dialog").showModal());
$(".deploy-ok").addEventListener("click", () => {
  stage = 3;
  document.getElementById("deploy-dialog").close();
  renderLifecycle();
  renderVersions();
  toast("Обмен работает в Продуктиве. Первые ЭТрН уйдут с новыми заказами");
});

stateSwitch({ start: "Выбор шаблона", pass: "Схема, тест пройдёт", fail: "Схема, тест упадёт" }, (s) => {
  screenState = s;
  reset();
  $(".test-result").innerHTML = "";
  if (s === "start") {
    $(".js-start").hidden = false;
    $(".js-builder").hidden = true;
    renderLifecycle();
  } else openBuilder();
});
