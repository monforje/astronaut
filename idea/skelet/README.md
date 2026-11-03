# Astronaut — проработка идеи

**Astronaut** — платформа интеграции данных для логистических и транспортных компаний: связывает 1С, CRM, кабинеты линий и терминалов, операторов ЭПД, таможенное ПО и другие системы, наводит порядок в справочниках (MDM/НСИ), открывает данные другим сервисам и даёт AI-агента, который делает всё это по просьбе. Отраслевые функции: карточка груза, сверка документов (инвойс, коносамент, ДТ, ЭТрН), электронные перевозочные документы, статус груза. Начинаем с **Владивостока**. Размер клиента определяет пакет: «Старт» для экспедиторов на 20–200 человек, «Корпоративный» для крупных компаний и терминалов ([fit.md](audience/fit.md#пакеты-старт-и-корпоративный)).

Статус на 2026-11-01: всё собрано по открытым источникам, **разговоров с клиентами ещё не было**. Многие решения — гипотезы, они помечены в [decisions.md](decisions.md).

Это подробная проработка. Описание продукта простым языком лежит рядом: [../product/](../product/README.md). Единый список открытых вопросов по всему проекту лежит в [../questions.md](../questions.md).

Старые материалы (папка `begining/`) лежат в ветке [`old`](https://github.com/monforje/astronaut/tree/old/begining) и служат только справкой.

## С чего начать

Читать в таком порядке:

1. [audience/fit.md](audience/fit.md) — **вся картина на одной странице**: что продаём, кому, почему.
2. [product/building-blocks.md](product/building-blocks.md) — из каких блоков собран продукт и что входит в MVP.
3. [product/differentiators.md](product/differentiators.md) — чем отличаемся и почему это надо проверить.
4. [product/logistics-flow.md](product/logistics-flow.md) — сценарий экспедитора по шагам и документам, матрица сверки.
5. [product/layers.md](product/layers.md) — подробно, что делает каждый слой продукта, включая AI-агента.
6. [market/competitors.md](market/competitors.md) — конкуренты в логистике.
7. [audience/pains.md](audience/pains.md) и [audience/companies.md](audience/companies.md) — боли рынка и база компаний.
8. [decisions.md](decisions.md) и [questions.md](../questions.md) — что решили и что ещё проверяем.

Непонятный термин — в [словарь](glossary/terms.md).

## Карта

| Где | Что |
|---|---|
| [decisions.md](decisions.md) | журнал решений со статусом «решено / гипотеза» |
| [questions.md](../questions.md) | что проверить на разговорах, письмами, у юриста; что решить нам |
| **audience/** | |
| [audience/fit.md](audience/fit.md) | как решение ложится на боли, кому идём первыми |
| [audience/pains.md](audience/pains.md) | боли логистов Владивостока и ДФО по открытым источникам |
| [audience/companies.md](audience/companies.md) | 26 компаний с публичными контактами |
| [audience/tech-contacts.md](audience/tech-contacts.md) | ЛПР и технари в приоритетных компаниях: кто нашёлся, контакты, как заходить |
| **product/** | |
| [product/building-blocks.md](product/building-blocks.md) | блоки продукта, видение и срез MVP |
| [product/layers.md](product/layers.md) | что делает каждый слой: надёжность, движение данных, MDM, логистика, AI-агент, услуги |
| [product/logistics-flow.md](product/logistics-flow.md) | импорт контейнера по шагам, документы, матрица сверки |
| [product/differentiators.md](product/differentiators.md) | чем отличаемся от рынка |
| **market/** | |
| [market/competitors.md](market/competitors.md) | конкуренты в логистике, карта пересечений, риски |
| **glossary/** | |
| [glossary/terms.md](glossary/terms.md) | словарь терминов с примерами из логистики |
| [glossary/README.md](glossary/README.md) | как ведём словарь |
| **brand/** | |
| [brand/messaging/](brand/messaging/README.md) | слова бренда: голос, девизы, фразы, CTA |
| [brand/](brand/) | логотипы, иконки, иллюстрации |
| **utils/** | |
| [utils/scripts/idea-pdf.py](utils/scripts/idea-pdf.py) | собирает всю папку в [astronaut-idea.pdf](astronaut-idea.pdf): `uv run idea/skelet/utils/scripts/idea-pdf.py` |

## Как ведём

- Каждое решение из разговора — строка в [decisions.md](decisions.md) со статусом.
- Всё нерешённое — в [questions.md](../questions.md); закрытый вопрос переезжает в решения.
- Новый термин — сразу в [словарь](glossary/terms.md).
- Файлы и папки заводим по ходу разговора; каждый новый сразу добавляем в карту выше.
- В начале каждого файла — строка ссылок на связанные файлы.
