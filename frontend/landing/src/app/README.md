# app

Слой приложения: запускается один раз на весь сайт. Не слайсится.

- `styles/` — `index.css` (Tailwind → бренд → токены), `brand.css` и `fonts/` — симлинки на `idea/skelet/brand/design`, `tokens.css` — роли поверх бренда и тема Tailwind.
- `pages/` — маршруты Astro (тонкие файлы): `index.astro` — главная.
- `layout/` — `Layout`: `<head>` через `SeoHead`, ссылка «К содержимому», шапка, `<main>`. Наружу — `@/app`.
