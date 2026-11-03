# Astronaut: продукт простым языком

Эта папка описывает проект без технических подробностей. По ней мы учим продукт сами, пишем компаниям, передаём задачи лидгенераторам и объясняем идею команде. Технические детали лежат в `idea/skelet/`.

**Статус на 3 ноября 2026:** вся картина собрана по открытым источникам, разговоров с клиентами ещё не было. Утверждения о боли клиентов и о том, что у конкурентов нет сверки документов, пока гипотезы. Цены в [05-stoimost.md](05-stoimost.md) — стартовая рабочая гипотеза, клиентам их ещё не называли.

## С чего начать

Читать по порядку. Самое главное на одной странице: [10-shpargalka.md](10-shpargalka.md).

| Файл | Что внутри |
|---|---|
| [01-chto-eto.md](01-chto-eto.md) | Что такое Astronaut: фраза, версии на 10 и 30 секунд, из чего состоит проект |
| [02-produkt.md](02-produkt.md) | Конечный продукт: что получает клиент, как пользуется, день экспедитора, два пакета |
| [03-cennost.md](03-cennost.md) | Какую проблему решаем, почему именно сейчас, какая польза и чем отличаемся |
| [04-auditoriya.md](04-auditoriya.md) | Кому нужен продукт и кому он облегчает работу, кому не нужен |
| [05-stoimost.md](05-stoimost.md) | За что платит клиент, с чем сравнивает, как считается выгода |
| [06-kompanii.md](06-kompanii.md) | Потенциальные клиенты и список компаний с очередями |
| [07-arina.md](07-arina.md) | Название и бизнес-описание для Арины, фиксация смены идеи |
| [08-intervyu.md](08-intervyu.md) | Как выйти на логистов, сценарий проблемного интервью, проверка готовности купить |
| [09-pisma.md](09-pisma.md) | Письма компаниям и бриф для лидгенераторов |
| [10-shpargalka.md](10-shpargalka.md) | Шпаргалка для заучивания: фразы, вопросы и ответы, даты |
| [product.pdf](product.pdf) | Все файлы папки одним PDF (обложка, оглавление). Собирает [utils/scripts/product-pdf.py](utils/scripts/product-pdf.py): `uv run idea/product/utils/scripts/product-pdf.py` |

## Откуда что взято

Здесь простым языком, там подробно и с источниками. Все ссылки ведут в `idea/skelet/`.

| Наш файл | Подробности и источники |
|---|---|
| [01-chto-eto.md](01-chto-eto.md) | [fit.md](../skelet/audience/fit.md), [building-blocks.md](../skelet/product/building-blocks.md), [layers.md](../skelet/product/layers.md) |
| [02-produkt.md](02-produkt.md) | [building-blocks.md](../skelet/product/building-blocks.md), [layers.md](../skelet/product/layers.md) (в том числе [AI-агент](../skelet/product/layers.md#4-ai-агент-сквозной-слой)), [logistics-flow.md](../skelet/product/logistics-flow.md) |
| [03-cennost.md](03-cennost.md) | [pains.md](../skelet/audience/pains.md), [fit.md](../skelet/audience/fit.md), [differentiators.md](../skelet/product/differentiators.md) |
| [04-auditoriya.md](04-auditoriya.md) | [fit.md](../skelet/audience/fit.md), [companies.md](../skelet/audience/companies.md), [tech-contacts.md](../skelet/audience/tech-contacts.md) |
| [05-stoimost.md](05-stoimost.md) | [competitors.md](../skelet/market/competitors.md), [decisions.md, раздел «Цена»](../skelet/decisions.md#цена), [questions.md](../questions.md) |
| [06-kompanii.md](06-kompanii.md) | [companies.md](../skelet/audience/companies.md), [tech-contacts.md](../skelet/audience/tech-contacts.md) |
| [07-arina.md](07-arina.md) | [README проработки](../skelet/README.md), [decisions.md](../skelet/decisions.md) |
| [08-intervyu.md](08-intervyu.md) | [questions.md](../questions.md), [logistics-flow.md](../skelet/product/logistics-flow.md) |
| [09-pisma.md](09-pisma.md) | [brand/messaging](../skelet/brand/messaging/README.md): голос, фразы, девизы, призывы |
| [10-shpargalka.md](10-shpargalka.md) | [terms.md](../skelet/glossary/terms.md), [layers.md](../skelet/product/layers.md), [competitors.md](../skelet/market/competitors.md) |

Решения ведём в [decisions.md](../skelet/decisions.md). Единый список открытых вопросов — в [idea/questions.md](../questions.md).

## Что ещё нужно закрыть

Это то, что нельзя закрыть без людей или реальных разговоров:

- подпись отправителя в письмах: имя, должность, телефон, Telegram ([09-pisma.md](09-pisma.md));
- размер оплаты лидгенераторам за один состоявшийся разговор ([09-pisma.md](09-pisma.md));
- ответы юриста: реестр российского ПО, схема по персональным данным, исключение для сделок с иностранцами;
- реальные цифры из интервью: часы, ошибки, стоимость ошибок, готовность платить. По ним меняем цены в [05-stoimost.md](05-stoimost.md).

## Правила текста

Пишем языком клиента: груз, декларация, накладная, 1С. Не пишем «интеграционная шина», «мастер-данные», «коннектор» (кроме разговора с ИТ-специалистами). Не пишем «революционный», «инновационный», «под ключ», «бесшовно». Не обещаем быструю доставку. Цифры подставляем только проверенные.
