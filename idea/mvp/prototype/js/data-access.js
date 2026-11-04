// Доступ к данным (юзкейс 11): витрина в PostgreSQL, Data API с ключами, автодокументация, подписки на события.
// Таблицы называем, как их знает бизнес. Данные — fake-data.md, «Доступ к данным».

const $ = (s) => document.querySelector(s);
const V = DATA.vitrina;
const keys = V.keys.map((k) => ({ ...k, revoked: false }));
const hooks = V.hooks.map((h) => ({ ...h }));
let on = { vitrina: true, api: true };
let screenState = "on";

function render() {
  const stale = screenState === "stale";
  const error = screenState === "error";
  const updated = stale ? "14.11 в 03:40, 6 часов назад" : V.updated;

  const a = [];
  if (stale) a.push('<div class="alert alert--warn"><div><strong>Последнее обновление 6 часов назад.</strong> Проверьте обмен с 1С.</div><a class="btn btn--secondary btn--sm" href="exchanges.html">К обменам</a></div>');
  if (error) a.push('<div class="alert alert--danger"><div><strong>Не удалось обновить витрину.</strong> Сервис базы данных не ответил. Повторим сами через 5 минут [TODO: текст ошибки]</div></div>');
  if (!on.vitrina && !on.api) a.push('<div class="alert alert--info"><div>Пока ничего не включено. Включите витрину для отчётов или Data API для сайта.</div></div>');
  $(".js-alerts").innerHTML = a.join("");

  $(".sw-vitrina").checked = on.vitrina;
  $(".js-vitrina-label").textContent = on.vitrina ? "Включена" : "Выключена";
  $(".js-vitrina").innerHTML = on.vitrina
    ? `<div class="creds"><div><span>Адрес</span><span class="mono">${V.host}</span></div>
        <div><span>Логин</span><span class="mono">${V.login}</span></div>
        <div><span>Пароль</span><button class="btn btn--ghost btn--sm" data-toast="Пароль показан один раз и скопирован">Показать и скопировать</button></div></div>`
    : "";

  $(".sw-api").checked = on.api;
  $(".js-api-label").textContent = on.api ? "Включён" : "Выключен";
  $(".js-api").innerHTML = on.api
    ? `<div class="row"><span class="badge badge--ok">Ключей: ${keys.filter((k) => !k.revoked).length}</span>
        <button class="btn btn--secondary btn--sm" data-open="docs-dialog">Документация API</button></div>`
    : "";
  $(".js-keys-card").hidden = !on.api;

  $(".js-updated").textContent = on.vitrina || on.api ? `обновлено ${updated}` : "";
  $(".tables-rows").innerHTML = V.tables.map((t) => `<tr>
    <td><strong>${t.title}</strong></td><td class="mono">${t.name}</td><td class="num">${t.rows}</td>
    <td>${!on.vitrina && !on.api ? '<span class="muted">не включено</span>' : stale ? `<span class="badge badge--warn">${updated}</span>` : error ? '<span class="badge badge--danger">ошибка</span>' : updated}</td></tr>`).join("");

  $(".keys-rows").innerHTML = keys.map((k, i) => `<tr>
    <td><strong>${esc(k.name)}</strong></td><td>${k.rights}</td><td>${k.limit}</td>
    <td>${k.revoked ? '<span class="badge badge--plain">отозван</span>' : `<button class="btn btn--ghost btn--sm" data-revoke="${i}">Отозвать</button>`}</td></tr>`).join("");

  $(".hooks").innerHTML = hooks.length
    ? hooks.map((h) => `<li><span class="badge badge--plain">${h.event}</span><span>→</span><span class="mono small">${esc(h.url)}</span>
        <button class="btn btn--ghost btn--sm" data-toast="Тестовое событие отправлено, адрес ответил 200">Проверить</button></li>`).join("")
    : '<li class="muted">Подписок пока нет</li>';
}

$(".sw-vitrina").addEventListener("change", (e) => {
  on.vitrina = e.target.checked;
  toast(on.vitrina ? "Витрина включена. Первые данные появятся через пару минут" : "Витрина выключена");
  render();
});
$(".sw-api").addEventListener("change", (e) => {
  on.api = e.target.checked;
  toast(on.api ? "Data API включён" : "Data API выключен, ключи перестали работать");
  render();
});

$(".keys-rows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-revoke]");
  if (!b) return;
  keys[b.dataset.revoke].revoked = true;
  toast("Ключ отозван. Сервисы с этим ключом больше не получат данные");
  render();
});

$(".key-ok").addEventListener("click", () => {
  const name = $(".key-name").value.trim() || "Новый ключ";
  keys.push({ name, rights: $(".key-rights").value, limit: $(".key-limit").value, revoked: false });
  $(".key-created").innerHTML = `<div class="alert"><div>Ключ создан. Скопируйте сейчас — больше не покажем.</div></div>
    <div class="key-secret">astr_live_0000000000000000000000000000</div>`;
  $(".key-ok").hidden = true;
  render();
});
document.getElementById("key-dialog").addEventListener("close", () => {
  $(".key-created").innerHTML = "";
  $(".key-ok").hidden = false;
  $(".key-name").value = "";
});

$(".hook-ok").addEventListener("click", () => {
  hooks.push({ event: $(".hook-event").value, url: $(".hook-url").value });
  document.getElementById("hook-dialog").close();
  toast("Подписка добавлена");
  render();
});

stateSwitch({ on: "Включено", empty: "Ничего не включено", stale: "Данные устарели", error: "Ошибка" }, (s) => {
  screenState = s;
  on = s === "empty" ? { vitrina: false, api: false } : { vitrina: true, api: true };
  render();
});
