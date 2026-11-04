// Карточка контрагента (юзкейс 02): реквизиты с источником каждого поля, связанные грузы, история, редактирование.
// Подробно расписана только ООО «Ромашка» (fake-data.md, «Справочник: детали»), остальные — по списку.
// Правила правки — 02-directory/business-logic.md: поля из ЕГРЮЛ меняются только в реестре; руководитель только смотрит.

const cpId = new URLSearchParams(location.search).get("id") || "romashka";
const cp = DATA.directory.find((c) => c.id === cpId) || DATA.directory[0];
const $ = (s) => document.querySelector(s);
const me = ROLES[getRole()];
const readOnly = getRole() === "head";

document.querySelectorAll(".js-name").forEach((el) => (el.textContent = cp.name));
document.title = `${cp.name} — Astronaut`;

// Поле: значение, откуда пришло, можно ли править руками (из ЕГРЮЛ — нельзя)
const isRomashka = cp.id === "romashka";
const fields = cp.foreign
  ? [
      { key: "name", label: "Название", value: cp.name, src: ["введено вручную"], edit: true },
      { key: "nameCn", label: "Название по-китайски", value: cp.nameCn || "—", src: ["введено вручную"], edit: true },
      { key: "uscc", label: "USCC", value: cp.uscc, src: ["введено вручную"], edit: true },
      { key: "city", label: "Город", value: cp.city, src: ["введено вручную"], edit: true },
      { key: "phone", label: "Телефон", value: "—", src: ["—"], edit: true },
    ]
  : [
      { key: "name", label: "Название", value: cp.name, src: ["ЕГРЮЛ"] },
      { key: "inn", label: "ИНН", value: cp.inn, src: ["1С", "ЕГРЮЛ"] },
      { key: "kpp", label: "КПП", value: cp.kpp || "—", src: ["1С"], edit: true },
      { key: "address", label: "Адрес", value: isRomashka ? "г. Владивосток, ул. Примерная, д. 1" : cp.city, src: ["ЕГРЮЛ"] },
      { key: "head", label: "Руководитель", value: isRomashka ? "Петров П. П." : "—", src: ["ЕГРЮЛ"] },
      { key: "phone", label: "Телефон", value: isRomashka ? "+7 000 000-00-00" : "—", src: ["Битрикс24"], edit: true },
      { key: "status", label: "Статус в ЕГРЮЛ", value: cp.liquidated ? `ликвидирована ${cp.liquidated}` : "действует", src: ["ЕГРЮЛ"] },
    ];
if (cp.kind === "Перевозчик") fields.push({ key: "goslog", label: "Реестр ГосЛога", value: cp.goslog ? "есть" : "нет", src: ["ГосЛог"] });

const cpHistory = isRomashka
  ? [
      ["01.11", "Заведена из 1С"],
      ["01.11", "Точный дубль из 1С (тот же ИНН и КПП) объединён автоматически"],
      ["03.11", "«Ромашка ООО» из Битрикс24 и «Romashka» из кабинета терминала ушли в очередь проверки"],
    ]
  : [["—", "Изменений пока не было"]];

let changedNote = "";
const cargos = DATA.cargos.filter((c) => c.client === cp.id || (cp.id === "supplier" && c.client === "romashka"));

function render() {
  const src = (names) => `<div class="source">${names.map((n) => `<span class="badge badge--plain">${n}</span>`).join("")}</div>`;
  $(".js-fields").innerHTML = fields.map((f) =>
    `<tr><td class="muted">${f.label}</td><td><strong>${esc(f.value)}</strong></td><td>${src(f.src)}</td></tr>`).join("");

  $(".js-badges").innerHTML = `<span class="badge badge--plain">${cp.kind}</span>` +
    (cp.foreign ? '<span class="badge badge--plain">Иностранная</span>' : "") +
    (cp.branch ? '<span class="badge badge--plain">Филиал</span>' : "");

  const alerts = [];
  if (changedNote) alerts.push(changedNote);
  if (cp.liquidated) alerts.push(`<div class="alert alert--warn"><div><strong>Ликвидирована ${cp.liquidated}.</strong> Работать можно, но проверьте, точно ли это нужная компания.</div></div>`);
  if (cp.nogoslog) alerts.push('<div class="alert alert--danger"><div><strong>Нет в реестре ГосЛога.</strong> С 01.03.2027 договор с таким перевозчиком заключать нельзя.</div></div>');
  if (cp.foreign) alerts.push('<div class="alert alert--info"><div>Иностранная компания: реестровых данных нет, проверить по ЕГРЮЛ нельзя.</div></div>');
  if (isRomashka) alerts.push('<div class="alert alert--warn"><div>В очереди проверки 3 похожие записи из других систем.</div><a class="btn btn--secondary btn--sm" href="directory.html#dupes">Разобрать</a></div>');
  $(".js-alerts").innerHTML = alerts.join("");

  $(".js-cargos").innerHTML = cargos.length
    ? cargos.map((c) => `<li><a class="mono" href="cargo-card.html?id=${c.id}">${c.id}</a><span class="badge badge--${c.tone}">${c.status}</span></li>`).join("")
    : '<li class="muted">Грузов пока нет</li>';

  $(".js-history").innerHTML = cpHistory.map(([d, t]) => `<li><time>${d}</time><span>${t}</span></li>`).join("");

  const btn = $(".js-edit");
  btn.hidden = readOnly;
  $(".js-readonly").hidden = !readOnly;
}

/* ---------- Редактирование ---------- */

const dialog = document.getElementById("edit-dialog");

$(".js-edit").addEventListener("click", () => {
  $(".edit-fields").innerHTML = fields.map((f) => f.edit
    ? `<label class="field"><span>${f.label}</span><input class="input" name="${f.key}" value="${esc(f.value === "—" ? "" : f.value)}"></label>`
    : `<label class="field"><span>${f.label}</span><input class="input" value="${esc(f.value)}" disabled>
        <span class="field__hint">Из ${f.src.at(-1)} — меняется только в реестре</span></label>`).join("");
  dialog.showModal();
});

$(".edit-save").addEventListener("click", () => {
  const changed = [];
  dialog.querySelectorAll("input[name]").forEach((inp) => {
    const f = fields.find((x) => x.key === inp.name);
    const val = inp.value.trim() || "—";
    if (val !== f.value) {
      changed.push(`${f.label.toLowerCase()}: ${f.value} → ${val}`);
      f.value = val;
      f.src = [`изменено вручную, ${me.name}`];
    }
  });
  dialog.close();
  if (!changed.length) {
    toast("Ничего не изменилось");
    return;
  }
  if (cpHistory[0][0] === "—") cpHistory.length = 0;
  cpHistory.push(["14.11", `${me.name}: ${changed.join("; ")}`]);
  changedNote = `<div class="alert"><div><strong>Реквизиты изменены.</strong> ${cargos.length ? `Грузы (${cargos.length}) подтянут новые реквизиты.` : "Связанных грузов нет."}
    <span class="small muted">Как быть с уже подписанными документами — [TODO: 02-directory/business-logic.md]</span></div></div>`;
  toast("Сохранено. Запись в истории");
  render();
});

render();
