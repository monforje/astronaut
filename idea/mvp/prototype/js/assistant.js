// Экран-чат помощника (юзкейс 09): история слева, заготовленные диалоги из fake-data.md.
// Состояние «помощник недоступен» запоминается и действует и на боковую панель других экранов.

const chatRoot = document.querySelector(".assistant-chat");
const chat = mountChat(chatRoot);

const HISTORY = [
  { title: "Сверка MSKU1234567", when: "сегодня", prompt: "Сверь документы по контейнеру MSKU1234567" },
  { title: "Почему упал обмен с Контуром", when: "сегодня", prompt: "Почему упал обмен с Контуром?" },
  { title: "Где мой контейнер", when: "вчера", prompt: "Где мой контейнер?" },
];

const list = document.querySelector(".history__list");
list.innerHTML = HISTORY.map((h, i) =>
  `<li><button data-h="${i}">${h.title}<small>${h.when}</small></button></li>`).join("");

list.addEventListener("click", (e) => {
  const b = e.target.closest("[data-h]");
  if (!b) return;
  list.querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", x === b));
  chat.reset();
  chat.say(HISTORY[b.dataset.h].prompt);
});

document.querySelector(".history__new").addEventListener("click", () => {
  list.querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", false));
  chat.reset();
});

// Enter — отправить, Shift+Enter — новая строка
chatRoot.querySelector(".chat__input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatRoot.querySelector(".chat__form").requestSubmit();
  }
});

stateSwitch({ ok: "Работает", fail: "Подтверждённое действие не выполнится", down: "Помощник недоступен" }, (s) => {
  window.ASSISTANT_DOWN = s === "down";
  window.ASSISTANT_FAIL = s === "fail";
  try {
    localStorage.setItem(CHAT_DOWN_KEY, s === "down" ? "1" : "0");
  } catch {
    /* без памяти — только на этом экране */
  }
  chat.reset();
});
