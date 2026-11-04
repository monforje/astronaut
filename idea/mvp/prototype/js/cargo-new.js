// Новый груз: чек-лист обязательных сведений вживую, проверка номера контейнера и дубля,
// клиент из Справочника или завести тут же. Состав чек-листа — 03-cargo-card/business-logic.md.

const form = document.querySelector(".new-cargo__form");
const clientSel = form.elements.client;
const containerInput = form.elements.container;
const containerMsg = document.querySelector(".container-msg");
const uploadBtn = document.querySelector(".upload-docs");
const saveError = document.querySelector(".save-error");

let screenState = "form";

const CHECKS = [
  { field: "client", label: "Клиент", why: "выберите из Справочника" },
  { field: "container", label: "Номер контейнера", why: "4 буквы и 7 цифр" },
  { field: "from", label: "Откуда", why: "порт или город отправки" },
  { field: "to", label: "Куда", why: "порт или город назначения" },
  { field: "goods", label: "Наименование товара", why: "как в инвойсе" },
  { field: "places", label: "Число мест", why: "сверим с упаковочным листом" },
  { field: "gross", label: "Вес брутто", why: "сверим с коносаментом" },
  { field: "supplier", label: "Поставщик", why: "нужен для пакета брокеру" },
];

const CONTAINER_RE = /^[A-Z]{4}\d{7}$/;

for (const key of ["romashka", "primer"]) {
  clientSel.add(new Option(DATA.counterparties[key].name, key));
}
document.getElementById("suppliers").innerHTML = `<option value="${DATA.counterparties.supplier.name}">`;

function containerState() {
  const v = containerInput.value.trim().toUpperCase();
  if (!v) return { ok: false };
  if (!CONTAINER_RE.test(v)) return { ok: false, error: "Проверьте номер: должно быть 4 буквы и 7 цифр" };
  if (DATA.cargos.some((c) => c.id === v)) return { ok: false, duplicate: v };
  return { ok: true };
}

function updateContainerMsg() {
  const s = containerState();
  containerInput.classList.toggle("is-invalid", Boolean(s.error || s.duplicate));
  if (s.error) {
    containerMsg.className = "container-msg field__error";
    containerMsg.textContent = s.error;
  } else if (s.duplicate) {
    containerMsg.className = "container-msg field__error";
    containerMsg.innerHTML = `Такой груз уже есть: <a href="cargo-card.html?id=${s.duplicate}">открыть ${s.duplicate}</a>`;
  } else {
    containerMsg.className = "container-msg field__hint";
    containerMsg.textContent = "4 буквы и 7 цифр";
  }
}

function filled(field) {
  if (field === "container") return containerState().ok;
  return form.elements[field].value.trim() !== "";
}

function renderChecklist() {
  const done = CHECKS.filter((c) => filled(c.field)).length;
  document.querySelector(".checklist__count").textContent = `заполнено ${done} из ${CHECKS.length}`;
  document.querySelector(".checklist__bar").style.width = `${(done / CHECKS.length) * 100}%`;
  // Жёлтое — заполнено, но стоит проверить: поставщика нет в Справочнике
  const supplier = form.elements.supplier.value.trim();
  const supplierUnknown = supplier && supplier !== DATA.counterparties.supplier.name;
  document.querySelector(".checklist__items").innerHTML = CHECKS.map((c) => {
    const ok = filled(c.field);
    if (c.field === "supplier" && ok && supplierUnknown) {
      return '<li class="is-warn"><div>Поставщик<small>нет в Справочнике — заведите, чтобы документы ссылались на запись</small></div></li>';
    }
    return `<li class="${ok ? "is-done" : ""}"><div>${c.label}${ok ? "" : `<small>${c.why}</small>`}</div></li>`;
  }).join("");
  const complete = done === CHECKS.length;
  uploadBtn.disabled = !complete;
  uploadBtn.title = complete ? "" : "Сначала заполните обязательные сведения";
}

form.addEventListener("input", (e) => {
  if (e.target === containerInput) {
    containerInput.value = containerInput.value.toUpperCase();
    updateContainerMsg();
  }
  renderChecklist();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  saveError.hidden = true;
  const s = containerState();
  if (s.duplicate || s.error) {
    containerInput.focus();
    return;
  }
  if (screenState === "error") {
    saveError.hidden = false;
    return;
  }
  toast("Груз сохранён");
  const id = containerInput.value.trim() || "НОВЫЙ";
  setTimeout(() => (location.href = `cargo-card.html?id=${id}&state=new`), 700);
});

uploadBtn.addEventListener("click", () => {
  location.href = `cargo-card.html?id=${containerInput.value.trim()}&state=new#documents`;
});

document.querySelector(".demo-fill").addEventListener("click", () => {
  const v = { client: "romashka", supplier: DATA.counterparties.supplier.name, container: "MSKU2223334",
    from: "Шэньчжэнь", to: "Владивосток", goods: "Светотехника и кабель", places: "120", gross: "18 420" };
  for (const [k, val] of Object.entries(v)) form.elements[k].value = val;
  updateContainerMsg();
  renderChecklist();
});

// Завести клиента, не выходя из формы
const innInput = document.querySelector(".client-inn");
const result = document.querySelector(".client-result");
document.querySelector(".client-find").addEventListener("click", () => {
  const inn = innInput.value.trim();
  const known = Object.entries(DATA.counterparties).find(([, c]) => c.inn === inn);
  if (known && ["romashka", "primer"].includes(known[0])) {
    result.innerHTML = `<div class="alert"><div>Уже есть в Справочнике: <strong>${esc(known[1].name)}</strong>. Новую запись создавать не нужно.</div>
      <button type="button" class="btn btn--primary btn--sm" data-pick="${known[0]}">Выбрать</button></div>`;
  } else if (inn === "0000000004") {
    result.innerHTML = `<div class="alert alert--warn"><div><strong>ООО «Старт-Тест»</strong> ликвидирована. Точно заводить?</div></div>`;
  } else if (/^\d{10}(\d{2})?$/.test(inn)) {
    result.innerHTML = `<div class="alert alert--danger"><div>Такого ИНН нет в реестре. Проверьте цифры</div></div>`;
  } else {
    result.innerHTML = `<p class="field__error">ИНН — 10 цифр для компании или 12 для ИП</p>`;
  }
});
result.addEventListener("click", (e) => {
  const pick = e.target.closest("[data-pick]");
  if (!pick) return;
  clientSel.value = pick.dataset.pick;
  document.getElementById("client-dialog").close();
  renderChecklist();
});

// Руководитель смотрит, грузы не заводит (03-cargo-card/business-logic.md)
if (getRole() === "head") {
  form.querySelectorAll("input, select, button").forEach((el) => (el.disabled = true));
  form.insertAdjacentHTML("afterbegin", '<div class="alert alert--info"><div>Заводить грузы может менеджер ВЭД. Руководитель видит форму, но не сохраняет.</div></div>');
}

stateSwitch({ form: "Форма", error: "Ошибка сохранения" }, (s) => {
  screenState = s;
  saveError.hidden = true;
});

renderChecklist();
