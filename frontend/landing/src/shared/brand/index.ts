import type { ImageMetadata } from "astro";

/**
 * Растровые картинки бренда для `astro:assets` (`<Image />` сожмёт и отдаст webp). Файлы рядом —
 * симлинки на idea/skelet/brand; векторные лого лежат в `public/brand`.
 */
export { default as astronautConsole } from "./astronaut-console.png";
export { default as astronautPort } from "./astronaut-port.png";
export { default as astronautPlug } from "./illustration.png";

/**
 * Документы сквозного примера для веера «Один контейнер» — листы с закрытыми реквизитами
 * (idea/skelet/brand/documents, исходник — documents.html).
 */
export { default as docBillOfLading } from "./doc-bill-of-lading.jpg";
export { default as docDeclaration } from "./doc-declaration.jpg";
export { default as docInvoice } from "./doc-invoice.jpg";
export { default as docPackingList } from "./doc-packing-list.jpg";
export { default as docPreInfo } from "./doc-pre-info.jpg";
export { default as docWaybill } from "./doc-waybill.jpg";

/**
 * Места под фото в блоках: имя файла без расширения → что снять (строка на заглушке). Для людей тот
 * же список — idea/skelet/brand/photos/README.md.
 */
const PHOTO_SLOTS = {
  trucks: "Фуры с контейнерами ждут у ворот терминала.",
  office: "Рабочее место экспедитора: 1С на мониторе, рядом папки с документами.",
  ceo: "Портрет того, кто отвечает в Telegram.",
} as const;

export type PhotoName = keyof typeof PHOTO_SLOTS;

export interface Photo {
  /** Файл, который ждёт место, — в idea/skelet/brand/photos/. */
  file: string;
  /** Что должно быть в кадре. */
  todo: string;
  /** Снимок, если файл уже лежит в папке. */
  src?: ImageMetadata;
}

/**
 * `photos/` — ссылка на папку idea/skelet/brand/photos: положенный туда снимок попадает на сайт сам,
 * без правки кода. Расширение любое из списка.
 */
const FILES = import.meta.glob<ImageMetadata>("./photos/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
});

/** Фото для места `name`: снимок из папки или пустое место — тогда `PhotoSlot` рисует заглушку. */
export function photo(name: PhotoName): Photo {
  const file = `${name}.jpg`;
  const todo = PHOTO_SLOTS[name];
  const found = Object.entries(FILES).find(([path]) => path.replace(/^.*\/|\.\w+$/g, "") === name);
  return found ? { file, todo, src: found[1] } : { file, todo };
}
