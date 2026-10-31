// Демо-данные прототипа. Всё вымышленное: компания «ТД Полюс» — дистрибьютор с 1С, сайтом, CRM и хранилищем.
window.DATA = {
  company: 'ТД «Полюс»',
  user: { name: 'Ирина Котова', role: 'Разработчик интеграций', initials: 'ИК' },

  // Типы подключений MVP: FROM / TO
  connectorTypes: [
    { id: '1c', name: '1С:Предприятие', abbr: '1С', color: '#B5322E', desc: 'УТ, ERP, КА, БП, ЗУП. Через расширение или HTTP-сервисы. Метаданные читаются автоматически.', kind: 'Учётная система' },
    { id: 'bitrix', name: '1С-Битрикс', abbr: 'БУ', color: '#2F6FB5', desc: 'Сайт и интернет-магазин: каталог, цены, остатки, заказы. REST и модуль обмена.', kind: 'Сайт' },
    { id: 'b24', name: 'Битрикс24', abbr: 'Б24', color: '#1E8FC8', desc: 'Компании, контакты, сделки, задачи. Входящие вебхуки и REST.', kind: 'CRM' },
    { id: 'amo', name: 'amoCRM', abbr: 'amo', color: '#2A4BD1', desc: 'Сделки, контакты, воронки. OAuth 2.0 и вебхуки.', kind: 'CRM' },
    { id: 'pg', name: 'PostgreSQL', abbr: 'PG', color: '#336791', desc: 'Таблицы и представления. Пакетная выгрузка и отслеживание изменений (CDC).', kind: 'База данных' },
    { id: 'mysql', name: 'MySQL', abbr: 'My', color: '#3E7A8C', desc: 'Таблицы, пакетная выгрузка по метке времени или ключу, binlog-CDC.', kind: 'База данных' },
    { id: 'mongo', name: 'MongoDB', abbr: 'Mo', color: '#3D7A3A', desc: 'Коллекции, change streams, вложенные документы.', kind: 'База данных' },
    { id: 's3', name: 'S3-хранилище', abbr: 'S3', color: '#7A5A2E', desc: 'Любое S3-совместимое: файлы CSV, JSON, Parquet, XML. Чтение и запись по маске.', kind: 'Файлы' },
    { id: 'rest', name: 'REST API', abbr: 'API', color: '#4A5568', desc: 'Любой HTTP-сервис. Импорт OpenAPI, авторизация, пагинация, повторы.', kind: 'Сервис' }
  ],

  connections: [
    { id: 'c1', type: '1c', name: '1С:УТ 11 — центральная', host: 'ut.polus.local', env: 'prod', status: 'ok', objects: 214, last: '12 сек назад' },
    { id: 'c2', type: '1c', name: '1С:ERP — производство', host: 'erp.polus.local', env: 'prod', status: 'ok', objects: 486, last: '40 сек назад' },
    { id: 'c3', type: 'bitrix', name: 'Сайт polus-shop.ru', host: 'polus-shop.ru', env: 'prod', status: 'ok', objects: 18, last: '1 мин назад' },
    { id: 'c4', type: 'b24', name: 'Битрикс24 — оптовый отдел', host: 'polus.bitrix24.ru', env: 'prod', status: 'ok', objects: 34, last: '8 сек назад' },
    { id: 'c5', type: 'amo', name: 'amoCRM — розница', host: 'polusretail.amocrm.ru', env: 'prod', status: 'warn', objects: 12, last: 'токен истекает через 3 дня' },
    { id: 'c6', type: 'pg', name: 'DWH аналитики', host: 'dwh.polus.local:5432', env: 'prod', status: 'ok', objects: 57, last: '3 мин назад' },
    { id: 'c7', type: 'mysql', name: 'Старый B2B-портал', host: 'b2b-old.polus.local:3306', env: 'prod', status: 'ok', objects: 41, last: '1 ч назад' },
    { id: 'c8', type: 'mongo', name: 'События мобильного приложения', host: 'mongo.polus.local', env: 'prod', status: 'ok', objects: 9, last: '2 сек назад' },
    { id: 'c9', type: 's3', name: 'Архив и отчёты', host: 's3.polus-cloud.ru/archive', env: 'prod', status: 'ok', objects: 6, last: '15 мин назад' },
    { id: 'c10', type: 'rest', name: 'Служба доставки «Курьер+»', host: 'api.kurierplus.ru/v2', env: 'prod', status: 'err', objects: 7, last: '429: превышен лимит запросов' }
  ],

  flows: [
    { id: 'f1', name: 'Контрагенты: 1С:УТ → Битрикс24', from: 'c1', fromObj: 'Справочник.Контрагенты', to: 'c4', toObj: 'crm.company', by: 'Low-code', trigger: 'При изменении', status: 'ok', msgs: 4120, errs: 0, owner: 'И. Котова', version: 'v14',
      steps: ['Фильтр', 'Маппинг', 'Проверка ИНН'], case: 'b1' },
    { id: 'f2', name: 'Заказы: сайт → 1С:УТ', from: 'c3', fromObj: 'sale.order', to: 'c1', toObj: 'Документ.ЗаказКлиента', by: 'Low-code', trigger: 'Вебхук', status: 'err', msgs: 1874, errs: 3, owner: 'И. Котова', version: 'v9',
      steps: ['Маппинг', 'Поиск контрагента', 'Склад по умолчанию'], case: 'b2' },
    { id: 'f3', name: 'Остатки и цены: 1С:УТ → сайт', from: 'c1', fromObj: 'РегистрНакопления.ТоварыНаСкладах', to: 'c3', toObj: 'catalog.product', by: 'Код (TypeScript)', trigger: 'Каждые 10 мин', status: 'ok', msgs: 96400, errs: 0, owner: 'А. Седов', version: 'v22',
      steps: ['Агрегация', 'Маппинг', 'Только изменения'], case: 'b2' },
    { id: 'f4', name: 'Сделки amoCRM → заказы 1С:УТ', from: 'c5', fromObj: 'leads (успешно)', to: 'c1', toObj: 'Документ.ЗаказКлиента', by: 'AI-чат + low-code', trigger: 'Вебхук', status: 'idle', msgs: 0, errs: 0, owner: 'И. Котова', version: 'черновик',
      steps: ['Маппинг', 'Поиск контрагента'], case: 'b1' },
    { id: 'f5', name: 'Продажи: 1С:ERP → DWH', from: 'c2', fromObj: 'РегистрНакопления.Продажи', to: 'c6', toObj: 'sales.fact_sales', by: 'Terraform', trigger: 'Ежедневно 02:00', status: 'ok', msgs: 61200, errs: 0, owner: 'Д. Ларин', version: 'v6',
      steps: ['Пакетная выгрузка', 'Типизация'], case: 'b4' },
    { id: 'f6', name: 'События приложения → архив S3', from: 'c8', fromObj: 'events', to: 'c9', toObj: 'events/{date}/*.parquet', by: 'Код (Go)', trigger: 'Поток изменений', status: 'ok', msgs: 18350, errs: 0, owner: 'Д. Ларин', version: 'v3',
      steps: ['Пакеты по 5 000', 'Parquet'], case: 'b4' },
    { id: 'f7', name: 'Миграция клиентов: B2B-портал → DWH', from: 'c7', fromObj: 'customers', to: 'c6', toObj: 'crm.customers', by: 'Код (Python)', trigger: 'Вручную', status: 'idle', msgs: 0, errs: 0, owner: 'А. Седов', version: 'v1',
      steps: ['Маппинг', 'Дедупликация через MDM'], case: 'b5' },
    { id: 'f8', name: 'Статусы доставки → 1С:УТ', from: 'c10', fromObj: 'GET /shipments', to: 'c1', toObj: 'РегистрСведений.СтатусыДоставки', by: 'Low-code', trigger: 'Каждые 5 мин', status: 'warn', msgs: 2210, errs: 14, owner: 'И. Котова', version: 'v4',
      steps: ['Пагинация', 'Маппинг статусов'], case: 'b6' }
  ],

  // Маппинг для потока f1
  mapping: [
    { from: 'Наименование', type: 'Строка(150)', to: 'TITLE', xf: '' , st: 'ok' },
    { from: 'ИНН', type: 'Строка(12)', to: 'UF_CRM_INN', xf: 'проверить_инн()', st: 'ok' },
    { from: 'КПП', type: 'Строка(9)', to: 'UF_CRM_KPP', xf: '', st: 'ok' },
    { from: 'КонтактнаяИнформация.Телефон', type: 'Строка', to: 'PHONE[0].VALUE', xf: 'телефон_e164()', st: 'ok' },
    { from: 'КонтактнаяИнформация.Email', type: 'Строка', to: 'EMAIL[0].VALUE', xf: 'нижний_регистр()', st: 'ok' },
    { from: 'ОсновнойМенеджер', type: 'Справочник.Пользователи', to: '', xf: '', st: 'missing' },
    { from: 'ЮрФизЛицо', type: 'Перечисление', to: '', xf: '', st: 'missing' },
    { from: 'КонтактнаяИнформация.ЮрАдрес', type: 'Строка', to: '', xf: '', st: 'missing' }
  ],

  messages: [
    { id: 'm-8f31c2', flow: 'f2', status: 'err', time: '14:02:11', dur: '—', size: '3,1 КБ', key: 'Заказ №48211', err: 'Поле «Склад» пустое' },
    { id: 'm-8f31a9', flow: 'f2', status: 'err', time: '13:57:40', dur: '—', size: '2,8 КБ', key: 'Заказ №48207', err: 'Поле «Склад» пустое' },
    { id: 'm-8f3177', flow: 'f2', status: 'err', time: '13:41:02', dur: '—', size: '4,0 КБ', key: 'Заказ №48199', err: 'Поле «Склад» пустое' },
    { id: 'm-8f3160', flow: 'f2', status: 'ok', time: '13:40:55', dur: '420 мс', size: '2,2 КБ', key: 'Заказ №48198', err: '' },
    { id: 'm-8f314e', flow: 'f1', status: 'ok', time: '13:40:51', dur: '180 мс', size: '1,4 КБ', key: 'ООО «Вектор-Трейд»', err: '' },
    { id: 'm-8f3140', flow: 'f8', status: 'retry', time: '13:40:30', dur: '—', size: '0,6 КБ', key: 'Отправление KP-77120', err: '429: лимит запросов, повтор через 60 с' },
    { id: 'm-8f312d', flow: 'f3', status: 'ok', time: '13:40:00', dur: '2,1 с', size: '88 КБ', key: 'Пакет 1 240 позиций', err: '' },
    { id: 'm-8f3119', flow: 'f1', status: 'ok', time: '13:39:12', dur: '160 мс', size: '1,3 КБ', key: 'ИП Громов А. В.', err: '' },
    { id: 'm-8f3104', flow: 'f6', status: 'ok', time: '13:39:00', dur: '1,4 с', size: '5,2 МБ', key: 'Пакет 5 000 событий', err: '' },
    { id: 'm-8f30f1', flow: 'f8', status: 'queued', time: '13:38:44', dur: '—', size: '0,6 КБ', key: 'Отправление KP-77118', err: '' }
  ],

  // MDM: Контрагенты
  mdm: {
    entities: [
      { id: 'cp', name: 'Контрагенты', sources: ['c1', 'c2', 'c4', 'c5'], records: 12480, golden: 9112, queue: 1284, auto: 2084, quality: 91 },
      { id: 'nom', name: 'Номенклатура', sources: ['c1', 'c2', 'c3'], records: 48210, golden: 31877, queue: 3602, auto: 12731, quality: 84 }
    ],
    queue: [
      { id: 'q1', name: 'ООО «Северсталь-Логистик»', inn: '7718234561', n: 3, score: 0.97, reason: 'ИНН и КПП совпадают, название похоже на 96%', sources: ['c1', 'c2', 'c4'] },
      { id: 'q2', name: 'ИП Громов Алексей Викторович', inn: '503812345670', n: 2, score: 0.93, reason: 'ИНН совпадает, телефон совпадает', sources: ['c1', 'c5'] },
      { id: 'q3', name: 'АО «ТехноПром»', inn: '—', n: 2, score: 0.81, reason: 'Нет ИНН в amoCRM, название и адрес похожи', sources: ['c4', 'c5'] },
      { id: 'q4', name: 'ООО «Вектор-Трейд»', inn: '7702556610', n: 2, score: 0.78, reason: 'ИНН совпадает, КПП разные — возможно, филиал', sources: ['c1', 'c2'] },
      { id: 'q5', name: 'ООО «Альфа Снаб»', inn: '5009112233', n: 4, score: 0.95, reason: 'ИНН совпадает в 4 системах', sources: ['c1', 'c2', 'c4', 'c5'] },
      { id: 'q6', name: 'ООО «Ромашка»', inn: '7707083893', n: 2, score: 0.62, reason: 'Совпадает только название, ИНН разные', sources: ['c4', 'c5'] }
    ],
    // Пара для экрана сравнения (q1)
    compare: {
      fields: ['Наименование', 'Полное наименование', 'ИНН', 'КПП', 'ОГРН', 'Юр. адрес', 'Телефон', 'Email', 'Менеджер', 'Изменено'],
      records: [
        { src: 'c1', vals: ['Северсталь-Логистик ООО', 'Общество с ограниченной ответственностью «Северсталь-Логистик»', '7718234561', '771801001', '1157746123456', 'г. Москва, ул. Электрозаводская, д. 27, стр. 8', '+7 495 120-44-10', 'info@ssl-log.ru', 'Петров Д.', '24.10.2026'] },
        { src: 'c2', vals: ['ООО Северсталь Логистик', '', '7718234561', '771801001', '', 'Москва, Электрозаводская 27 с8', '84951204410', '', '', '02.06.2025'] },
        { src: 'c4', vals: ['Северсталь-Логистик', '', '7718234561', '', '', 'Москва г, Электрозаводская ул, 27/8', '+74951204410', 'zakaz@ssl-log.ru', 'Петров Дмитрий', '28.10.2026'] }
      ],
      // какой источник берётся по правилам выживания
      pick: [0, 0, 0, 0, 0, 0, 0, 2, 0, 2],
      rules: ['Доверенный источник: 1С:УТ', 'Самое полное', 'Совпадает', 'Совпадает', 'Только в 1С:УТ', 'Нормализовано по ФИАС', 'Приведено к +7', 'Самое свежее', 'Доверенный источник', 'Самое свежее']
    },
    golden: [
      { id: 'GR-000412', name: 'ООО «Северсталь-Логистик»', inn: '7718234561', kpp: '771801001', sources: ['c1', 'c2', 'c4'], quality: 98, updated: 'сегодня, 13:20' },
      { id: 'GR-000388', name: 'ООО «Альфа Снаб»', inn: '5009112233', kpp: '500901001', sources: ['c1', 'c2', 'c4', 'c5'], quality: 95, updated: 'вчера' },
      { id: 'GR-000377', name: 'ИП Громов А. В.', inn: '503812345670', kpp: '—', sources: ['c1', 'c5'], quality: 88, updated: 'вчера' },
      { id: 'GR-000301', name: 'ООО «Вектор-Трейд»', inn: '7702556610', kpp: '770201001', sources: ['c1', 'c4'], quality: 92, updated: '27.10.2026' },
      { id: 'GR-000254', name: 'АО «ТехноПром»', inn: '6658123400', kpp: '665801001', sources: ['c2'], quality: 71, updated: '25.10.2026' }
    ]
  },

  audit: [
    { t: '13:44', who: 'И. Котова', what: 'Применила предложение AI: маппинг поля «ОсновнойМенеджер» в потоке «Контрагенты: 1С:УТ → Битрикс24»', kind: 'ai' },
    { t: '13:20', who: 'С. Белова', what: 'Объединила 3 записи в золотую запись GR-000412', kind: 'mdm' },
    { t: '12:58', who: 'Д. Ларин', what: 'terraform apply: поток «Продажи: 1С:ERP → DWH» v6 выкачен в Продуктив', kind: 'deploy' },
    { t: '12:10', who: 'А. Седов', what: 'astro deploy: поток «Остатки и цены» v22 из ветки main', kind: 'deploy' },
    { t: '11:32', who: 'И. Котова', what: 'Отклонила предложение AI: тип поля «КПП» в потоке «Заказы: сайт → 1С:УТ»', kind: 'ai' },
    { t: '10:05', who: 'Система', what: 'Повторная отправка 12 сообщений потока «Статусы доставки» после восстановления API', kind: 'sys' }
  ],

  hourly: [820, 610, 540, 480, 455, 470, 690, 1840, 5120, 8910, 10240, 11870, 12650, 13010, 9120, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hourlyErr: [0, 0, 0, 0, 0, 0, 0, 2, 4, 1, 0, 3, 2, 8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};
