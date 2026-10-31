# Документация DATAREON Platform и практика золотой записи

Собрано 29.10.2026 по docs-platform.datareon.ru (версия 3.2.1) и статьям о MDM. Всё, чего нет в источниках, помечено как «не описано».

## Часть 1. DATAREON Platform по документации

### Модули интерфейса
- **Центр настройки** (`https://server:7200`): кластер, серверы, сервисы, типы данных, внешние системы, обработка, доступ. Конфигурацию меняет только master-сервер. https://docs-platform.datareon.ru/administrator/index.html
- **Центр мониторинга** (`https://server:7201`): только чтение, служба мониторинга на каждом сервере. https://docs-platform.datareon.ru/monitoring/index.html
- **Центр разработки:** конструкторы портала и форм, типы данных, бизнес-процессы. https://docs-platform.datareon.ru/dev_center/index.html
- **Портал MDM** (Blazor): рабочее место пользователя мастер-данных. https://docs-platform.datareon.ru/administrator/services/mdm_portal/mdm_portal.html
- **Credential:** пользователи, группы, права, отчёты. https://docs-platform.datareon.ru/terms_rules_platform/glossary.html

### Сущности
- **Система-подписчик:** внешняя ИС. **Коннектор:** готовое решение под приложение.
- **Маршрут**, **бизнес-процесс** (графический), **конвейер** (тип → тип), **трансформация**, **алгоритм** (C#), **программный модуль**.
- **Хранилище сообщений**, **банк данных**, **шаблон конфигурации**.
- Типы данных четырёх видов: тип данных, перечисление, базовая модель, категория. https://docs-platform.datareon.ru/administrator/data_types/index.html
- Обработчики бывают 1С и СУБД; направление задаётся в обработчике. https://docs-platform.datareon.ru/developer/handlers/index.html
- Своя очередь у каждой внешней системы и сервиса; правила размещения и приоритета на C#. Retry и DLQ в доках не описаны. https://docs-platform.datareon.ru/administrator/data_processing/queue_processing_rules.html

### Коннекторы (по документации)
- **1С:** подсистема и расширение, TCP через внешнюю компоненту или REST, до 30 потоков на направление, работает без БСП. https://docs-platform.datareon.ru/administrator/external/1c_system.html
- **СУБД:** MSSQL 2017+, PostgreSQL 15.1+, Oracle 11gR2+. Чтение и запись через обработчик; CDC не описан. https://docs-platform.datareon.ru/administrator/external/dbms_system.html
- **Расширенное REST API:** свой веб-сервер, Swagger, Basic/Bearer, rate limit. https://docs-platform.datareon.ru/administrator/external/restapi_system.html
- **Datareon ESB**, файловый каталог, FTP, веб-сервис, e-mail, программируемая система.
- **Важно:** Kafka, RabbitMQ и SAP в списке внешних систем документации нет. В прайсе есть «программируемые коннекторы» (Kafka, RabbitMQ, IBM MQ и др.) за 216 000 ₽ каждый — расхождение между доками и прайсом. MySQL, MongoDB, S3, Битрикс24, amoCRM готовыми коннекторами не заявлены.

### Как строится поток
1. Установка → Центр настройки → конфигурация → кластер → применение. https://docs-platform.datareon.ru/quickstart.html
2. Внешняя система → тип данных → обработчик → бизнес-процесс.
3. Схема выбирается C#-скриптом или автоматически по типу сообщения. https://docs-platform.datareon.ru/administrator/data_processing/scheme_selection_algorithm.html
4. В маршруте обязателен шаг «Отправка», иначе сообщение уходит в архив с ошибкой.

### Мониторинг
- Графики CPU, памяти, дисков, сообщений, процессов, очередей; плитки ошибок. https://docs-platform.datareon.ru/monitoring/monitoring_homepage.html
- Хранилище сообщений: полнотекстовый поиск, «Цепочка событий» (трассировка), повторная отправка, REST. https://docs-platform.datareon.ru/monitoring/monitoring_tools/monitroing_ms.html
- Архив: «Вернуть в обработку» и «Вернуть все». https://docs-platform.datareon.ru/monitoring/monitoring_tools/monitoring_archive.html

### MDM и хранение
- Банк данных на MSSQL или PostgreSQL, журнал действий, проверка версии при записи. https://docs-platform.datareon.ru/administrator/services/module_databank.html
- Тип данных: история изменений, обязательность, функция проверки, fuzzy-индексы, импорт структуры из swagger/wsdl/xml/json, автогенерация форм. https://docs-platform.datareon.ru/administrator/data_types/datatype.html
- Нечёткий поиск `SEARCH(field,'text',errors 0–3)`. https://docs-platform.datareon.ru/developer/data_proc.html
- **Не описано:** золотые записи, правила выживания, правила матчинга, интерфейс стюарда.

### Безопасность и окружения
- Роли по модулям, суперпользователь, журналы безопасности. LDAP не описан. https://docs-platform.datareon.ru/administrator/access_management_cn.html
- Конфигурация: проверка, применение, откат, экспорт и импорт (это и есть перенос dev → test → prod). Git не упоминается. https://docs-platform.datareon.ru/administrator/admin_maintenance/config_setup.html

## Часть 2. Практика золотой записи

### Конвейер
Очистка → стандартизация (адреса по ГАР/ФИАС, наименования по словарям) → поиск совпадений → слияние → золотая запись → раздача обратно подписчикам. Мастер пересчитывается при merge и split. https://habr.com/ru/companies/datasapience/articles/920306/
Три режима: автоматический, через предложения стюарду, ручной. https://docs.ataccama.com/mdm/latest/matching/matching.html

### Поиск совпадений
- Жёсткий признак контрагента — ИНН (+ КПП). Название, адрес и телефон — только для поиска кандидатов, не для автосклейки. https://habr.com/ru/articles/993368/
- Вероятностная модель с двумя порогами: «не совпадает» / «на проверку» / «автосовпадение». https://arxiv.org/html/2410.17279v1
- Arenadata Harmony: нечёткий поиск на OpenSearch, AI-классификатор, коннекторы к 1С, SAP, DaData, Контур.Фокус. https://arenadata.tech/products/arenadata-harmony-mdm/

### Правила выживания
- Приоритет источника по атрибуту, самое свежее, самое полное, оценка качества, условные правила, каскад. Задавать на уровне поля, а не записи. https://profisee.com/blog/mdm-survivorship/
- Semarchy: Preferred Publisher, Most Frequent, Longest и др.; ручные правки держатся «до следующего изменения» или «до следующей правки». https://semarchy.com/doc/semarchy-xdm/xdm/2024.4/Design/matching/survivorship.html
- Дубли не удалять: старые ID как псевдонимы, журнал слияний, кросс-таблица ID по системам. https://habr.com/ru/articles/993368/

### Стюардинг
- Коды качества на поле или запись, инциденты с исполнителем и автозакрытием. https://habr.com/ru/companies/datasapience/articles/920306/
- Заявки: черновик → подана → в работе → на уточнении → у куратора → выполнена или отклонена. https://habr.com/ru/articles/542976/
- Метрики: доля дублей, полнота, валидность, время обработки заявок.

### Российская специфика
- Контрольная сумма ИНН: 10 знаков — веса 2,4,10,3,5,9,4,6,8, mod 11 mod 10; 12 знаков — две контрольные цифры. https://ru.wikipedia.org/wiki/Идентификационный_номер_налогоплательщика
- ДаДата party: поиск по ИНН/КПП/ОГРН, статус, ОКВЭД, филиалы; около 25% филиалов без КПП. https://dadata.ru/api/find-party/
- ДаДата address: `fias_id`, коды качества `qc`. Хранить ФИАС-ID как ключ адреса. https://dadata.ru/api/clean/address/ , https://habr.com/ru/companies/hflabs/articles/267997/
- ЕГРЮЛ/ЕГРИП открыты, у ФНС есть сервис проверки. https://www.nalog.gov.ru/rn68/news/activities_fts/4683468/
- Номенклатура: ОКПД2, ТН ВЭД, ОКЕИ, шаблоны наименований. Юрлицо, ИП, филиал и грузополучатель — разные сущности, не склеивать. https://habr.com/ru/articles/993368/

### Не удалось прочитать
Informatica (403), Aidbox (404), PDF Loginom, тексты разделов 1С ITS (только оглавление).
