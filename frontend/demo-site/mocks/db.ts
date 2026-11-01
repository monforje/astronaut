/**
 * Хранилище мок-бэкенда: таблицы в памяти, копия — в localStorage, чтобы демо переживало
 * перезагрузку страницы. Новая таблица — поле в `seed()` (seed.ts), тип `Tables` выводится из него.
 * Сбросить к начальным данным — `db.reset()` (в браузере: `mockDb.reset()` в консоли).
 */
import { seed } from "./seed";

/** Таблицы мок-бэкенда; форма задаётся сидом. */
export type Tables = ReturnType<typeof seed>;

/** Версия схемы хранилища: поменяли форму таблиц — увеличьте, старые данные заменятся сидом. */
const KEY = "astronaut:mock-db:v1";

function storage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // приватный режим или запрет хранилища: живём в памяти
  }
}

function load(): Tables {
  const raw = storage()?.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Tables;
    } catch {
      // битая запись — начинаем с сида
    }
  }
  return seed();
}

let tables = load();

function save() {
  try {
    storage()?.setItem(KEY, JSON.stringify(tables));
  } catch {
    // переполнение или запрет хранилища: данные останутся до перезагрузки
  }
}

export const db = {
  /** Чтение: возвращает копию, чтобы обработчик не мог случайно изменить таблицу мимо `update`. */
  read<K extends keyof Tables>(table: K): Tables[K] {
    return structuredClone(tables[table]);
  },
  /** Запись: функция получает таблицу и возвращает новую; результат сразу сохраняется. */
  update<K extends keyof Tables>(table: K, fn: (rows: Tables[K]) => Tables[K]) {
    tables = { ...tables, [table]: fn(structuredClone(tables[table])) };
    save();
  },
  reset() {
    tables = seed();
    save();
  },
};
