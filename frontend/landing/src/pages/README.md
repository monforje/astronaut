# pages

Содержимое экранов (слой FSD, **не** папка маршрутов Astro: маршруты — в `app/pages`, `srcDir` — `src/app`).

`home/` — главная. `HomePage` собирает секции в порядке тактов рассказа (`PLAN.md`, «Карта страницы»):
`Hero` (`#top`) → `Features` (`#features`) → `Pain` (`#pain`) → `WhyNow` (`#why-now`) → `How` (`#how`) →
`Agent` (`#agent`) → `Systems` (`#systems`) → `Honest` (`#honest`) → `Start` (`#start`) → `Faq` (`#faq`) →
`Contact` (`#contact`). Секции — полосы `Band` из `@/shared/ui`, тон чередуется (DESIGN.md, «Полосы,
пятна, карточки»). Внутри слайса, для секций: `DocsStack` (веер документов «Один контейнер»), `PathStep`
(шаг пути контейнера) и `SystemMessage` (сообщение системы).
