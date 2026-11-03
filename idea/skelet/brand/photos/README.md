# photos/

Связано: [../README.md](../README.md) · `frontend/landing/src/shared/brand/index.ts` (`photo()`) ·
`frontend/landing/DESIGN.md` («Фото»)

Фото для блоков лендинга. Пока файла нет, на его месте на сайте заглушка: мятная рамка с уголками
видоискателя, мелко «[TODO] фото», что снять и имя файла.

**Как добавить фото:** положите снимок в эту папку под именем из таблицы — он появится на сайте сам,
код трогать не нужно (`frontend/landing/src/shared/brand/photos` — ссылка на эту папку). Если
dev-сервер не подхватил файл, перезапустите его: `task stop && task start -- -d` в
`frontend/landing`. Не забудьте добавить файл в git.

| Файл | Блок | Что в кадре | Откуда | Кадр на сайте |
|---|---|---|---|---|
| `trucks.jpg` | «Почему сейчас» (`#why-now`), справа над датами | фуры с контейнерами ждут у ворот терминала | есть: сгенерировано по промпту ниже, 03.11.2026; выдуманный номер прицепа размыт | полоса от 2:1 (телефон) до 5:1 (ноутбук); генерировать 3:1, от 1600 px в ширину |
| `office.jpg` | «Работает с тем, что у вас уже есть» (`#systems`) | рабочее место экспедитора: 1С на мониторе, рядом папки с документами | есть: сгенерировано по промпту ниже, 03.11.2026 | полоса от 2:1 до 3,5:1 справа от заголовка; генерировать 3:1, от 1600 px |
| `ceo.jpg` | «Вопросы» (`#faq`), карточка «Не нашли свой вопрос?» | портрет того, кто отвечает в Telegram | только настоящее фото | круг 56 px, лицо по центру; квадрат от 400 px |

- Формат — JPEG (подойдут и PNG, WebP, AVIF). Сайт сам сожмёт снимок и отдаст webp нужной ширины.
- Снимок режется по центру под форму блока: главное держите в средней полосе кадра по высоте и в
  центре по ширине.
- Без надписей и логотипов поверх фото: текст блока стоит рядом.
- Свои снимки — с согласия людей в кадре; лица посторонних, номера машин и контейнеров чужих
  компаний размыть.
- Новое место под фото: имя и строка «что снять» — в `PHOTO_SLOTS` (`src/shared/brand/index.ts`
  лендинга), строка в эту таблицу, `<PhotoSlot photo={photo("<имя>")} … />` в секции.

## Промпты для генерации

Промпты по-английски: так их лучше понимают Midjourney, Flux, DALL·E и Kandinsky. Стиль общий для
обоих кадров и для сайта: документальное фото, пасмурный рассеянный свет, приглушённые светлые цвета
(белый, тёплый off-white, navy, чуть teal), без людей, надписей и логотипов. Генератор не умеет 3:1 —
берите 16:9 или 21:9 и держите главное в средней полосе кадра: сайт обрежет лишнее.

### `trucks.jpg`

```text
Documentary photo, wide panoramic shot: a queue of container trucks waiting at the entry gate of a
seaport container terminal in Vladivostok, Russia. Semi-trucks with 40-foot shipping containers in
muted blue, rust red and grey, plain, no logos, standing one after another along the road. In the
center, a red-and-white boom barrier and a small checkpoint booth. Behind them, gantry cranes and
stacks of containers, soft hills in the haze. Overcast late-autumn morning, light sea fog, soft
diffused daylight. Eye-level, shot from the roadside, 35 mm lens, the line of trucks runs across the
middle band of the frame, calm sky above, empty asphalt below. Muted natural colors, low contrast,
slightly cool and airy, warm off-white highlights. Realistic editorial photography. No people, no
text, no logos, no license plates.
```

### `office.jpg`

```text
Realistic photo of a freight forwarder's desk in a small logistics office in Vladivostok, Russia. In
the center: a desktop monitor with a typical Russian accounting program open, white and pale yellow
interface with tables, slightly out of focus, nothing readable. Next to it, neat stacks of paper
shipping documents and ring binders with colored tabs, a rubber stamp, a desk phone, a mug of tea, a
pen lying on a printed invoice. Behind, a window with soft daylight and blurred port cranes in the
distance. Shallow depth of field, focus on the paper stack and the edge of the monitor. Wide
horizontal composition, all key objects in the central third, calm uncluttered edges. Muted airy
colors: white, warm off-white paper, navy blue binders, a small touch of teal. Soft natural light,
low contrast. Editorial documentary photography, 35 mm. No people, no readable text, no logos.
```

**Негативный промпт** (где есть отдельное поле): `text, letters, readable text on screen or paper,
logos, brand names, license plates, watermark, people, faces, hands, sunset, golden hour, HDR, neon,
oversaturated, cinematic color grading, illustration, 3D render`.

**Midjourney:** в конец промпта `--ar 3:1 --style raw --no text, logos, people, license plates`.

**Проверить глазами перед тем, как класть:** генератор путает колёса и кабины фур, конструкции кранов,
клавиатуры; текст на бумагах и экране должен быть размыт, а не кашей из букв; логотипов, похожих на
настоящие компании (линии, терминалы, 1С), быть не должно.

### `ceo.jpg` — не генерировать

Посетитель решит, что на фото тот, кто ответит ему в Telegram, поэтому случайное сгенерированное лицо
здесь — обман. Нужен настоящий снимок; годится фото с телефона: по плечи, взгляд в камеру, ровный свет
из окна, светлый однотонный фон, телефон на уровне глаз, квадрат. Нейрофотосессия по своим селфи —
можно: лицо на ней своё. Фото так и не появится — на это место встанет маскот.
