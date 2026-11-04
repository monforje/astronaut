// Помощник (юзкейс 09): один движок для боковой панели на любом экране и для экрана-чата.
// Ответы заготовлены (fake-data.md, «Помощник: заготовленные диалоги»). Всё, что меняет данные, — только после «Подтвердить».

const CHAT_DOWN_KEY = "proto-assistant-down";

function assistantDown() {
  if (window.ASSISTANT_DOWN !== undefined) return window.ASSISTANT_DOWN;
  try {
    return localStorage.getItem(CHAT_DOWN_KEY) === "1";
  } catch {
    return false;
  }
}

// Подсказки «что можно сделать» по текущему экрану
function chatSuggestions() {
  const page = document.body.dataset.page;
  const id = new URLSearchParams(location.search).get("id") || "MSKU1234567";
  const byPage = {
    "cargo-card": [`Сверь документы по контейнеру ${id}`, `Где контейнер ${id}?`, "Почему упал обмен с Контуром?"],
    cargo: ["Где мой контейнер?", "Какие грузы зависли?"],
    exchanges: ["Почему упал обмен с Контуром?", "Собери обмен заявок из 1С в Контур"],
    exchange: ["Почему упал обмен с Контуром?"],
    "exchange-builder": ["Собери обмен заявок из 1С в Контур"],
    connections: ["Почему упал обмен с Контуром?", "Собери обмен заявок из 1С в Контур"],
    directory: ["Найди дубли Ромашки"],
    counterparty: ["Найди дубли Ромашки"],
    "data-access": ["Сделай ключ API для кабинета клиента"],
  };
  return byPage[page] || ["Сверь документы по контейнеру MSKU1234567", "Почему упал обмен с Контуром?", "Где мой контейнер?"];
}

// Ответ на просьбу: список блоков. Блок — { text } | { chips } | { plan, items, done, undone } | { link, href }
function chatReply(q) {
  const t = q.toLowerCase();
  const role = getRole();
  const id = (q.match(/[A-Za-z]{4}\d{7}/) || [])[0]?.toUpperCase();

  if (/удал/.test(t)) {
    return [{ text: "У вас нет прав на это. Попросите руководителя." }];
  }
  if (/свер/.test(t)) {
    const c = id || "MSKU1234567";
    return [
      { text: `Сверяю инвойс INV-0418, упаковочный лист PL-0418 и драфт коносамента по ${c}. Это только чтение, ничего не меняю.` },
      { text: "Готово. <b>2 расхождения</b>: мест в упаковочном листе 120, в драфте 118; вес брутто 18 420 и 18 920 кг. <b>1 нормальное различие</b>: получатель в драфте латиницей." },
      { link: "Открыть расхождения", href: `cargo-card.html?id=${c}#discrepancies` },
      {
        plan: "Могу назначить расхождение по местам и отправить задачу в MAX. Вот что изменится:",
        items: ["у расхождения «мест 120 и 118» появится ответственный: Анна К.", "Анне К. придёт задача в MAX"],
        done: "Расхождение назначено, задача ушла в MAX.",
        undone: "Хорошо, ничего не меняю.",
        apply: "assign-places",
      },
    ];
  }
  if (/обмен|контур|упал/.test(t) && !/собер|собери/.test(t)) {
    const base = [
      { text: "Обмен «1С → Контур (ЭТрН)» не работает 10 минут: <b>истёк токен Контура</b>. Не доставлены 2 ЭТрН — по заявкам № 518 и № 519. За 7 дней приходило предупреждение." },
      { link: "Открыть обмен", href: "exchange.html?id=1c-kontur" },
    ];
    if (role !== "admin") {
      return [...base, { text: "Токен обновляет админ в «Подключениях». У вас нет прав на это — попросите Игоря П." }];
    }
    return [
      ...base,
      { text: "Обновите токен в «Подключениях», потом я повторю отправку." },
      {
        plan: "Повторю отправку недоставленных. Повторная отправка ЭТрН — только с подтверждением:",
        items: ["ЭТрН по заявке № 518 уйдёт в Контур", "ЭТрН по заявке № 519 уйдёт в Контур", "дубля не будет: у сообщений есть ключ"],
        done: "Отправил 2 ЭТрН заново. Обе дошли до Контура.",
        undone: "Хорошо, не отправляю.",
      },
    ];
  }
  if (/собер|собери|шаблон/.test(t)) {
    if (role !== "admin") return [{ text: "Собирать обмены может админ. Попросите Игоря П." }];
    return [
      { text: "Подходит шаблон «Заявки из 1С в Контур для ЭТрН»." },
      {
        plan: "Вот что сделаю:",
        items: ["создам черновик обмена в среде «Разработка»", "сопоставлю 6 полей 1С с полями Контура", "в Продуктив не выкатываю — это решаете вы"],
        done: "Черновик готов.",
        doneLink: { link: "Открыть в конструкторе", href: "exchange-builder.html" },
        undone: "Хорошо, ничего не создаю.",
      },
    ];
  }
  if (/дубл/.test(t)) {
    return [
      { text: "На ООО «Ромашка» в очереди 3 похожих записи: «Ромашка ООО» из Битрикс24, «Romashka» из кабинета терминала и запись с другим КПП (это, скорее всего, филиал)." },
      { link: "Открыть очередь дублей", href: "directory.html#dupes" },
    ];
  }
  if (/ключ|api/.test(t)) {
    if (role !== "admin") return [{ text: "Ключи API создаёт админ. Попросите Игоря П." }];
    return [{
      plan: "Создам ключ API:",
      items: ["название: «Кабинет клиента на сайте (2)»", "права: клиент видит только свои грузы", "лимит: 60 запросов в минуту"],
      done: "Ключ создан. Покажу его один раз в «Доступе к данным».",
      undone: "Хорошо, ключ не создаю.",
    }];
  }
  if (/завис/.test(t)) {
    return [{ text: "Зависает один груз: <b>TGHU1112223</b>, выгружен на терминале, нет новых событий 5 дней." }, { link: "Открыть груз", href: "cargo-card.html?id=TGHU1112223#events" }];
  }
  if (id) {
    const c = DATA.cargos.find((x) => x.id === id);
    if (!c) return [{ text: `Данных по контейнеру ${id} пока нет. Проверьте номер.` }];
    const extra = id === "MSKU1234567" ? " ЭТрН до Хабаровска ждёт подписи перевозчика 2 часа." : c.stuck ? ` Внимание: ${c.stuck}.` : "";
    return [{ text: `<b>${id}</b>: ${c.status.toLowerCase()}, обновлено ${c.updated}.${extra}` }, { link: "Открыть груз", href: `cargo-card.html?id=${id}#events` }];
  }
  if (/где|контейнер|груз/.test(t)) {
    return [{ text: "Какой контейнер? У вас в работе:" }, { chips: DATA.cargos.map((c) => c.id) }];
  }
  return [{ text: "Не понял просьбу. Уточните, что сделать:" }, { chips: ["Сверить документы", "Где мой контейнер?", "Почему упал обмен с Контуром?"] }];
}

// Рисует чат в root. root должен содержать .chat__log, .chat__form, .chat__input
function mountChat(root) {
  const log = root.querySelector(".chat__log");
  const form = root.querySelector(".chat__form");
  const input = root.querySelector(".chat__input");

  function scroll() {
    log.scrollTop = log.scrollHeight;
  }

  function add(html, cls) {
    const el = document.createElement("div");
    el.className = `chat__msg ${cls}`;
    el.innerHTML = html;
    log.append(el);
    scroll();
    return el;
  }

  function block(b) {
    if (b.text) return add(b.text, "chat__msg--bot");
    if (b.link) return add(`<a class="btn btn--secondary btn--sm" href="${b.href}">${b.link}</a>`, "chat__msg--action");
    if (b.chips) return add(b.chips.map((c) => `<button class="chip" data-say="${esc(c)}">${esc(c)}</button>`).join(""), "chat__msg--action");
    if (b.plan) {
      const el = add(`<div class="plan"><p class="plan__title">План действий</p><p>${b.plan}</p>
        <ul>${b.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        <div class="row" style="--gap:0.5rem"><button class="btn btn--primary btn--sm" data-plan="yes">Подтвердить</button>
        <button class="btn btn--secondary btn--sm" data-plan="no">Не подтверждать</button></div></div>`, "chat__msg--bot");
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-plan]");
        if (!btn) return;
        el.querySelector(".row").innerHTML = btn.dataset.plan === "yes"
          ? '<span class="badge badge--ok">Подтверждено</span>'
          : '<span class="badge badge--plain">Не подтверждено</span>';
        if (btn.dataset.plan === "yes" && window.ASSISTANT_FAIL) {
          add("Не получилось: система, куда я пишу, не ответила. Ничего не изменилось — попробуйте позже.", "chat__msg--error");
        } else if (btn.dataset.plan === "yes") {
          add(`<span class="badge badge--ok badge--plain">применено</span> ${b.done}`, "chat__msg--bot");
          // Экран под панелью может показать изменение (например, карточка груза)
          if (b.apply) window.onAssistantApply?.(b.apply);
          if (b.doneLink) block(b.doneLink);
        } else add(b.undone, "chat__msg--bot");
      });
      return el;
    }
  }

  async function say(text) {
    if (!text.trim()) return;
    add(esc(text), "chat__msg--me");
    input.value = "";
    root.querySelector(".chat__hints")?.remove();
    if (assistantDown()) {
      add("Помощник сейчас недоступен. Остальное работает как обычно.", "chat__msg--error");
      return;
    }
    const my = gen;
    for (const b of chatReply(text)) {
      const typing = add('<span class="typing"><i></i><i></i><i></i></span>', "chat__msg--bot");
      await new Promise((r) => setTimeout(r, 650));
      typing.remove();
      if (my !== gen) return; // чат сбросили, пока помощник «печатал»
      block(b);
    }
  }

  // Номер разговора: растёт при сбросе, старые ответы не попадают в новый чат
  let gen = 0;

  function reset() {
    gen++;
    log.innerHTML = `<div class="chat__hints">
      <p class="small muted">Попросите своими словами. Что меняет данные — сделаю только после вашего «Подтвердить».</p>
      ${chatSuggestions().map((s) => `<button class="chip" data-say="${esc(s)}">${esc(s)}</button>`).join("")}
    </div>`;
    if (assistantDown()) {
      log.insertAdjacentHTML("afterbegin", '<div class="alert alert--warn"><div>Помощник сейчас недоступен. Остальное работает как обычно.</div></div>');
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    say(input.value);
  });
  root.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-say]");
    if (chip) say(chip.dataset.say);
  });

  reset();
  return { say, reset };
}

// Боковая панель: на любом экране, кроме экрана-чата. Открывается кнопкой или Ctrl+/
function mountAssistantPanel() {
  if (document.body.dataset.page === "assistant") return null;
  document.body.insertAdjacentHTML("beforeend", `
    <button class="assistant-fab btn btn--primary" aria-controls="assistant-panel" title="Помощник (Ctrl+/)">Помощник</button>
    <aside class="assistant-panel" id="assistant-panel" hidden aria-label="Помощник">
      <header class="assistant-panel__head">
        <strong>Помощник</strong>
        <span class="spacer"></span>
        <a class="btn btn--ghost btn--sm" href="assistant.html">Во весь экран</a>
        <button class="btn btn--ghost btn--sm assistant-panel__close" aria-label="Закрыть">✕</button>
      </header>
      <div class="chat__log"></div>
      <form class="chat__form">
        <input class="input chat__input" placeholder="Спросите или попросите…" aria-label="Сообщение помощнику">
        <button class="btn btn--primary btn--sm">Отправить</button>
      </form>
    </aside>`);
  const panel = document.getElementById("assistant-panel");
  const chat = mountChat(panel);
  const toggle = (open = panel.hidden) => {
    panel.hidden = !open;
    document.body.classList.toggle("has-assistant", open);
    if (open) panel.querySelector(".chat__input").focus();
  };
  document.querySelector(".assistant-fab").addEventListener("click", () => toggle());
  panel.querySelector(".assistant-panel__close").addEventListener("click", () => toggle(false));
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "/") toggle();
    if (e.key === "Escape" && !panel.hidden && !document.querySelector("dialog[open]")) toggle(false);
  });
  return { open: (text) => { toggle(true); if (text) chat.say(text); } };
}

const assistantPanel = mountAssistantPanel();
