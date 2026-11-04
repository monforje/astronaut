// Фейк-данные прототипа. Источник правды — idea/mvp/usecases/fake-data.md:
// новое сначала дописываем туда, потом сюда. Все названия, номера и ИНН вымышленные.

const DATA = {
  people: {
    manager: { name: "Анна К.", role: "менеджер ВЭД" },
    head: { name: "Сергей М.", role: "руководитель" },
    admin: { name: "Игорь П.", role: "админ" },
  },

  counterparties: {
    romashka: { name: "ООО «Ромашка»", inn: "0000000001", kpp: "000000001", city: "Владивосток" },
    primer: { name: "ООО «Пример-Импорт»", inn: "0000000005", city: "Владивосток" },
    supplier: { name: "Shenzhen Example Trading Co., Ltd", uscc: "000000000000000000" },
    dalavto: { name: "ООО «Дальавто»", inn: "0000000002", goslog: true },
    ivanov: { name: "ИП Иванов", inn: "000000000003", goslog: false },
    broker: { name: "ООО «Брокер-Пример»", inn: "0000000006" },
  },

  // Статус: tone = ok | warn | danger | plain
  cargos: [
    {
      id: "MSKU1234567",
      client: "romashka",
      type: "40HC",
      from: "Шэньчжэнь",
      to: "Владивосток",
      status: "Вывезен",
      updated: "13.11",
      tone: "ok",
      problems: ["2 расхождения", "ЭТрН не подписана"],
      filled: 8,
    },
    {
      id: "MSKU7654321",
      client: "romashka",
      type: "40HC",
      from: "Нинбо",
      to: "Владивосток",
      status: "Судно вышло",
      updated: "03.11",
      tone: "plain",
      problems: [],
      filled: 8,
    },
    {
      id: "TGHU1112223",
      client: "primer",
      type: "20DC",
      from: "Шанхай",
      to: "Владивосток",
      status: "Выгружен на терминале",
      updated: "08.11",
      tone: "warn",
      stuck: "нет новых событий 5 дней",
      problems: ["ЭТрН отклонена"],
      filled: 8,
    },
    {
      id: "CAIU4445556",
      client: "romashka",
      type: "40HC",
      from: "Циндао",
      to: "Владивосток",
      status: "Ждём драфт",
      updated: "02.11",
      tone: "plain",
      problems: ["заполнено 5 из 8"],
      filled: 5,
    },
    {
      id: "OOLU7778889",
      client: "primer",
      type: "40HC",
      from: "Шэньчжэнь",
      to: "Владивосток",
      status: "Вывезен",
      updated: "06.11",
      tone: "ok",
      problems: [],
      filled: 8,
    },
  ],

  // Сквозной пример: карточка MSKU1234567
  example: {
    order: "518",
    goods: "Светотехника и кабель",
    places: 120,
    gross: 18420,
    net: 16900,

    // Места и цена — из инвойса, вес — из упаковочного листа. en — как написано в документе
    lines: [
      { n: 1, name: "Светильник светодиодный", en: "LED light fixture", places: 50, gross: 7600, price: 180 },
      { n: 2, name: "Кабель силовой, бухта", en: "Power cable, coil", places: 40, gross: 8120, price: 240 },
      { n: 3, name: "Блок питания", en: "Power supply unit", places: 30, gross: 2700, price: 95, check: true },
    ],

    documents: [
      { type: "Заявка", number: "№ 518", source: "1С", status: "готов" },
      { type: "Инвойс", number: "INV-0418", source: "загружен вручную", status: "готов", lang: "англ." },
      { type: "Упаковочный лист", number: "PL-0418", source: "почта", status: "готов", lang: "англ., кит." },
      { type: "Драфт коносамента", number: "драфт", source: "почта", status: "готов", draft: true },
    ],

    discrepancies: [
      {
        id: "places",
        text: "Мест в упаковочном листе 120, в драфте коносамента 118",
        a: { doc: "Упаковочный лист PL-0418", where: "стр. 1, итог", value: "120 мест" },
        b: { doc: "Драфт коносамента", where: "стр. 1, графа «Number of packages»", value: "118 мест" },
        draft: true,
      },
      {
        id: "gross",
        text: "Вес брутто в упаковочном листе 18 420 кг, в драфте коносамента 18 920 кг",
        hint: "Разница 500 кг, больше допуска",
        a: { doc: "Упаковочный лист PL-0418", where: "стр. 1, итог", value: "18 420 кг" },
        b: { doc: "Драфт коносамента", where: "стр. 1, графа «Gross weight»", value: "18 920 кг" },
        draft: true,
      },
    ],

    normal: [
      {
        text: "Получатель в драфте записан латиницей: «Romashka Co»",
        hint: "Транслитерация названия ООО «Ромашка», это не ошибка",
      },
    ],

    events: [
      { date: "01.11", text: "Погружен на судно", source: "agg" },
      { date: "03.11", text: "Судно вышло", source: "agg" },
      { date: "10.11", text: "Прибыл во Владивосток", source: "agg" },
      { date: "11.11", text: "Выгружен на терминале", source: "manager" },
      { date: "12.11", text: "Выпущен таможней", source: "broker" },
      { date: "13.11", text: "Вывезен", source: "manager" },
    ],

    transport: {
      carrier: "dalavto",
      route: "Владивосток → Хабаровск",
      titles: [
        { who: "Грузоотправитель", state: "signed", note: "подписан 13.11 в 10:05" },
        { who: "Перевозчик", state: "waiting", note: "не подписан 2 часа" },
        { who: "Грузополучатель", state: "pending", note: "ждёт, пока подпишет перевозчик" },
      ],
    },
  },

  // Справочник (юзкейс 02). flags: liquidated, nogoslog, foreign, branch, dupes
  directory: [
    { id: "romashka", name: "ООО «Ромашка»", kind: "Клиент", inn: "0000000001", kpp: "000000001", city: "Владивосток", dupes: 3, cargos: 3 },
    { id: "romashka-branch", name: "ООО «Ромашка» (филиал)", kind: "Клиент", inn: "0000000001", kpp: "000000002", city: "Владивосток", branch: true, cargos: 0 },
    { id: "primer", name: "ООО «Пример-Импорт»", kind: "Клиент", inn: "0000000005", city: "Владивосток", cargos: 2 },
    { id: "supplier", name: "Shenzhen Example Trading Co., Ltd", nameCn: "深圳示例贸易有限公司", kind: "Поставщик", uscc: "000000000000000000", city: "Шэньчжэнь", foreign: true, cargos: 3 },
    { id: "dalavto", name: "ООО «Дальавто»", kind: "Перевозчик", inn: "0000000002", city: "Владивосток", goslog: true, cargos: 2 },
    { id: "ivanov", name: "ИП Иванов", kind: "Перевозчик", inn: "000000000003", city: "Владивосток", nogoslog: true, cargos: 0 },
    { id: "start", name: "ООО «Старт-Тест»", kind: "Клиент", inn: "0000000004", city: "Владивосток", liquidated: "15.03.2025", cargos: 0 },
    { id: "broker", name: "ООО «Брокер-Пример»", kind: "Брокер", inn: "0000000006", city: "Владивосток", cargos: 2 },
  ],

  // Очередь проверки дублей: запись Справочника против похожей
  dupes: [
    {
      id: "crm",
      a: { source: "Справочник", name: "ООО «Ромашка»", inn: "0000000001", kpp: "000000001", city: "Владивосток" },
      b: { source: "Битрикс24", name: "Ромашка ООО", inn: "0000000001", kpp: "—", city: "Владивосток" },
      hint: "Тот же ИНН, другое написание названия",
    },
    {
      id: "terminal",
      a: { source: "Справочник", name: "ООО «Ромашка»", inn: "0000000001", kpp: "000000001", city: "Владивосток" },
      b: { source: "Кабинет терминала", name: "Romashka", inn: "—", kpp: "—", city: "Владивосток" },
      hint: "Название латиницей совпадает с учётом транслитерации, ИНН нет",
    },
    {
      id: "branch",
      a: { source: "Справочник", name: "ООО «Ромашка»", inn: "0000000001", kpp: "000000001", city: "Владивосток" },
      b: { source: "1С", name: "ООО «Ромашка»", inn: "0000000001", kpp: "000000002", city: "Владивосток" },
      hint: "Тот же ИНН, другой КПП — скорее всего филиал, это не дубль",
    },
  ],

  // Подключения (юзкейс 01). state: ok | warn | danger
  connections: [
    { id: "1c", name: "1С", type: "1С", env: "Продуктив", state: "ok", text: "Работает", objects: "Клиенты, Заказы, Номенклатура", last: "2 минуты назад" },
    { id: "b24", name: "Битрикс24", type: "Битрикс24", env: "Продуктив", state: "ok", text: "Работает", objects: "Компании, Сделки", last: "5 минут назад" },
    { id: "mail", name: "Почта (документы)", type: "Почта", env: "Продуктив", state: "ok", text: "Работает", objects: "Письма с вложениями", last: "1 минуту назад" },
    { id: "kontur", name: "Контур (ЭПД)", type: "Оператор ЭПД", env: "Продуктив", state: "danger", text: "Токен истёк 10 минут назад", objects: "ЭТрН, титулы", last: "10 минут назад" },
  ],

  // Обмены (юзкейсы 08, 13)
  exchanges: [
    { id: "1c-kontur", name: "1С → Контур (ЭТрН)", state: "danger", text: "Не работает 10 минут. Истёк токен Контура", today: 14, failed: 2, env: "Продуктив" },
    { id: "mail-docs", name: "Почта → Документы", state: "warn", text: "Работает. На последнем запуске 2 письма пропущены: нет вложений", today: 23, failed: 0, env: "Продуктив" },
    { id: "b24-dir", name: "Битрикс24 → Справочник", state: "ok", text: "Работает", today: 8, failed: 0, env: "Продуктив" },
  ],

  undelivered: [
    { what: "ЭТрН по заявке № 518", cargo: "MSKU1234567", reason: "Истёк токен Контура" },
    { what: "ЭТрН по заявке № 519", cargo: "TGHU1112223", reason: "Истёк токен Контура" },
  ],

  journal: [
    { when: "14.11 09:50", who: "система", what: "обмен «1С → Контур (ЭТрН)» упал: истёк токен Контура" },
    { when: "13.11 10:05", who: "Анна К.", what: "подготовила ЭТрН по заявке № 518" },
    { when: "12.11 16:40", who: "Игорь П.", what: "выкатил обмен «Почта → Документы» в Продуктив" },
    { when: "07.11 09:00", who: "система", what: "предупреждение: токен Контура истекает через 7 дней" },
    { when: "05.11 11:20", who: "помощник по просьбе Игоря П.", what: "собрал черновик обмена из шаблона «Заявки из 1С в Контур для ЭТрН»" },
    { when: "03.11 14:00", who: "Игорь П.", what: "добавил подключение «Контур (ЭПД)»" },
  ],

  // Доступ к данным (юзкейс 11)
  vitrina: {
    host: "vitrina.example.ru:5432",
    login: "bi_reader",
    updated: "14.11 в 09:40",
    tables: [
      { title: "Клиенты", name: "clients", rows: 2 },
      { title: "Грузы", name: "shipments", rows: 5 },
      { title: "Контейнеры", name: "containers", rows: 5 },
      { title: "Документы", name: "documents", rows: 12 },
    ],
    keys: [
      { name: "Кабинет клиента на сайте", rights: "клиент видит только свои грузы", limit: "60 запросов в минуту" },
      { name: "Отчёты BI", rights: "чтение всех таблиц", limit: "600 запросов в минуту" },
    ],
    hooks: [{ event: "Груз выпущен", url: "https://example.ru/hooks/released" }],
  },

  eventSources: {
    agg: "агрегатор",
    terminal: "терминал",
    manager: "отмечено менеджером",
    broker: "брокер",
  },
};

// Для подписей: «18 420»
function fmt(n) {
  return n.toLocaleString("ru-RU");
}
