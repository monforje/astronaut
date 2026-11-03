# brand/

Связано: [design/](design/README.md) · [messaging/](messaging/README.md) · [../README.md](../README.md) · `frontend/*/docs/codestyle/README.md` («Бренд»)

Бренд Astronaut: логотипы, иконки, иллюстрации, палитра, шрифты, слова. Это единственный источник
правды. Фронты (`frontend/landing`, `frontend/demo-site`) ничего отсюда не копируют, они подключают
файлы **относительными симлинками**.

| Папка / файл | Что |
| --- | --- |
| `*.svg`, `*.png`, `*.ico` в корне | логотипы, маскот, иллюстрации (астронавт на контейнере, с разъёмом, у пульта), иконка приложения, favicon. `astronaut-console.png` сгенерирован по образцу `illustration.png` и `astronaut-port.png` и перекрашен в палитру `design/recolor.py` |
| [icons/](icons/) | иконки ценностей лендинга; шоукейс `preview.html` |
| [animated/](animated/) | анимированные версии логотипов и лоадер; шоукейс `preview.html` |
| [documents/](documents/) | листы сквозного примера для лендинга (инвойс, упаковочный лист, коносамент, предварительная информация, декларация, ЭТрН), JPEG с размытыми реквизитами; исходник и как пересобрать — `documents.html` |
| [photos/](photos/README.md) | фото для блоков лендинга (фуры у терминала, рабочее место, портрет) и промпты для генерации; пока пусто — на сайте заглушки. Положенный файл встаёт на сайт сам |
| [design/](design/README.md) | палитра (`tokens.css`), тема Mantine (`theme.ts`), шрифты Onest и Fira Code, картинка-образец (`specimen.html` → `specimen.png`) |
| [messaging/](messaging/README.md) | голос, девизы, фразы, CTA |
| `public/` | **общий `public/` обоих фронтов**: внутри только ссылки на файлы выше |

## Как файл бренда попадает на фронт

1. **Исходник кладём сюда**, в корень или в подпапку (`icons/`, `animated/`…). Больше нигде копий нет.
2. **Фронту нужен файл по URL** (`<img src>`, favicon): делаем ссылку в `public/` по тому же пути,
   что и URL. `/brand/icons/status.svg` → `public/brand/icons/status.svg` → `../../../icons/status.svg`.
   Флаг `-r` сам считает относительный путь (команды из корня репо):

   ```bash
   mkdir -p idea/skelet/brand/public/brand/icons
   ln -sr idea/skelet/brand/icons/status.svg idea/skelet/brand/public/brand/icons/
   ```

   Файлы корня сайта (`favicon.ico`, `apple-touch-icon.png`) — ссылкой прямо в `public/`.
3. **Во фронтах ничего делать не нужно.** `frontend/<фронт>/public` — это ссылка на всю
   `brand/public` целиком, оба фронта видят одно и то же. Своих файлов в `public/` фронта нет.
4. Не в `public/`, а отдельной ссылкой во фронт:
   - растр, который лендинг оптимизирует через `astro:assets`, → `frontend/landing/src/shared/brand/`;
   - фото блоков — ссылки не нужны: `photos/` подключена к лендингу целой папкой, файл под именем
     места из `photos/README.md` встаёт на сайт сам;
   - палитра, шрифты, тема → `src/app/styles/{brand.css,fonts}`, `src/shared/ui/theme/theme.ts`.
   Полный список — `frontend/<фронт>/docs/codestyle/README.md`, раздел «Бренд».
5. **В git — исходник и ссылка вместе**: `git add idea/skelet/brand/<файл> idea/skelet/brand/public/<путь>`.
   Без ссылки в коммите на чужой машине файла на сайте не будет.
6. Переименовали или удалили файл — поправьте ссылку: `ln -sfn <путь> <ссылка>` (или `ln -sfr`).

## Проверки

`codestyle.test.ts` в каждом фронте (`task lint` из корня гоняет оба):

- «ссылки на бренд целы» — ни одна ссылка не битая;
- «public/ — ссылка на idea/skelet/brand/public, внутри только ссылки на файлы бренда» — копия
  или чужой файл в `public/` роняет тест;
- «картинка /brand/… из кода есть в public/» — код просит `/brand/…`, а ссылки нет: тест падает.
  Для `` `/brand/icons/${icon}.svg` `` проверяется только папка `/brand/icons/`.
