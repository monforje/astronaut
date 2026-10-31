// Astronaut MVP — кликабельный прототип без бэкенда. Роутинг по hash, состояние в памяти.
(function () {
  const D = window.DATA;
  const $ = (s, el = document) => el.querySelector(s);

  const state = {
    env: 'prod',
    flowMode: 'visual',
    codeLang: 'ts',
    mappingApplied: false,
    fixApplied: false,
    chat: null,
    monFilter: 'all',
    picks: null,
    wizard: { step: 1, type: null, tested: false },
    newFlow: { from: 'c1', to: 'c4', by: 'visual' },
    resolved: {},
    ai: true
  };

  // ---------- Иконки ----------
  const P = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/>',
    flow: '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 12h9"/><path d="M14 9l3 3-3 3"/>',
    pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 12a12 12 0 0 1 10-9 12 12 0 0 1-9 10l-2 1-2-2z"/><circle cx="15" cy="9" r="1.5"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    retry: '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    merge: '<path d="M6 3v6a6 6 0 0 0 6 6h6M18 15l-3-3M18 15l-3 3M6 21v-6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    send: '<path d="M4 12l16-8-6 16-2-7z"/>',
    terraform: '<path d="M4 4l6 3.5v7L4 11zM11 7.5l6 3.5v7l-6-3.5zM18 11v7"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>'
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

  // ---------- Помощники ----------
  const conn = id => D.connections.find(c => c.id === id);
  const ctype = id => D.connectorTypes.find(t => t.id === id);
  const mark = (typeId, lg) => { const t = ctype(typeId); return `<span class="sys-mark${lg ? ' lg' : ''}" style="background:${t.color}" aria-hidden="true">${t.abbr}</span>`; };
  const sysName = id => { const c = conn(id); return `<span class="sys">${mark(c.type)}<span>${c.name}</span></span>`; };
  const fmt = n => n.toLocaleString('ru-RU');
  const statusPill = s => ({
    ok: '<span class="pill ok">Работает</span>', err: '<span class="pill err">Есть ошибки</span>',
    warn: '<span class="pill warn">Предупреждение</span>', idle: '<span class="pill idle">Не запущен</span>'
  })[s];
  const msgPill = s => ({
    ok: '<span class="pill ok">Доставлено</span>', err: '<span class="pill err">Ошибка</span>',
    retry: '<span class="pill warn">Повтор</span>', queued: '<span class="pill idle">В очереди</span>'
  })[s];
  const envName = { dev: 'Разработка', test: 'Тест', prod: 'Продуктив' };

  function toast(text, kind = 'ok') {
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'err' ? ' err' : '');
    el.innerHTML = ico(kind === 'err' ? 'x' : 'check') + `<span>${text}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function modal(title, body, foot) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="panel-head"><h2>${title}</h2><div class="right"><button class="btn quiet sm" data-close aria-label="Закрыть">${ico('x')}</button></div></div>
      <div class="panel-body">${body}</div><div class="modal-foot">${foot}</div></div>`;
    bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) bg.remove(); });
    document.body.appendChild(bg);
    const f = bg.querySelector('.modal-foot .btn.primary') || bg.querySelector('button');
    f && f.focus();
    return bg;
  }

  function audit(what, kind) {
    const d = new Date();
    D.audit.unshift({ t: `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`, who: D.user.name.replace(/(\S)\S+ (\S+)/, '$1. $2').replace(/^(\S+) (\S)\S+$/, '$2. $1'), what, kind });
  }

  // ---------- Подсветка кода ----------
  function hl(src) {
    const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const kw = 'import|from|export|default|const|let|func|package|return|def|resource|terraform|use|new|true|false|True|False|await|async|with|var|required_providers|map|delivery|to|function|php|namespace';
    const re = new RegExp(`(\\/\\/.*$|^\\s*#.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')|\\b(${kw})\\b`, 'gm');
    return esc.replace(re, (m, c, s, k) => c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : `<span class="k">${k}</span>`);
  }

  // ---------- Каркас ----------
  const NAV = [
    { href: '#/overview', key: 'overview', label: 'Обзор', icon: 'home' },
    { href: '#/connections', key: 'connections', label: 'Подключения', icon: 'plug' },
    { href: '#/flows', key: 'flows', label: 'Потоки', icon: 'flow' },
    { href: '#/monitoring', key: 'monitoring', label: 'Мониторинг', icon: 'pulse', count: 17 },
    { group: 'Данные' },
    { href: '#/mdm', key: 'mdm', label: 'Мастер-данные', icon: 'star' },
    { group: 'Платформа' },
    { href: '#/developers', key: 'developers', label: 'Разработчикам', icon: 'code' },
    { href: '#/settings', key: 'settings', label: 'Настройки', icon: 'gear' }
  ];

  function renderShell() {
    $('#app').innerHTML = `
      <div class="shell">
        <aside class="rail" aria-label="Главное меню">
          <a class="brand" href="#/overview" aria-label="Astronaut, на главную">
            <span class="brand-mark" aria-hidden="true"><img class="still" src="assets/mark-inverse.svg" alt=""><img class="orbiting" src="assets/mark-animated-inverse.svg" alt=""></span>
            <span class="brand-name">Astronaut</span>
          </a>
          <nav class="nav" id="nav">${NAV.map(n => n.group ? `<div class="nav-group">${n.group}</div>` :
            `<a href="${n.href}" data-key="${n.key}">${ico(n.icon)}<span class="lbl">${n.label}</span>${n.count ? `<span class="count num">${n.count}</span>` : ''}</a>`).join('')}</nav>
          <div class="rail-foot">
            <div class="usage"><span>Системы</span><span class="num">10 из 20</span></div>
            <div class="meter" aria-hidden="true"><i style="width:50%"></i></div>
            <strong>${D.company}</strong>Тариф «Рост»
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <label class="search">${ico('search')}<input type="search" placeholder="Поток, подключение, ИНН, ID сообщения" aria-label="Поиск"><kbd>Ctrl K</kbd></label>
            <div class="spacer"></div>
            <div class="env" role="group" aria-label="Окружение">
              ${['dev', 'test', 'prod'].map(e => `<button data-env="${e}" aria-pressed="${state.env === e}"><i class="env-dot" aria-hidden="true"></i>${envName[e]}</button>`).join('')}
            </div>
            <button class="btn sm ai-btn" data-action="open-ai" title="Открыть AI-помощника">${ico('spark')}AI-помощник</button>
            <span class="avatar" title="${D.user.name}, ${D.user.role}">${D.user.initials}</span>
          </header>
          <main class="page" id="view" tabindex="-1"></main>
        </div>
      </div>
      <div class="toasts" id="toasts" aria-live="polite"></div>`;
  }

  // ---------- Экраны ----------
  function chart() {
    // Фиксированные пропорции: подписи не растягиваются. Текущий час — последний непустой.
    const W = 720, H = 300, L = 44, B = 26, T = 10, slot = (W - L) / 24, bw = slot * 0.62;
    const now = D.hourly.reduce((a, v, i) => v ? i : a, 0);
    const peak = Math.max(...D.hourly);
    const raw = peak / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
    const top = Math.ceil(peak / step) * step, ph = H - B - T;
    const y = v => T + ph - v / top * ph;
    let grid = '';
    for (let v = 0; v <= top; v += step) {
      grid += `<line class="grid${v ? '' : ' base'}" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text class="ylab" x="${L - 8}" y="${y(v) + 4}">${v >= 1000 ? v / 1000 + ' тыс' : v}</text>`;
    }
    const bars = D.hourly.map((v, i) => {
      const x = L + i * slot + (slot - bw) / 2;
      if (i > now) return `<rect class="bar future" x="${x}" y="${y(0) - 3}" width="${bw}" height="3" rx="1.5"/>`;
      const bh = Math.max(4, y(0) - y(v)), e = D.hourlyErr[i], eh = e ? Math.max(4, e * 4) : 0; // ошибок единицы: отдельный масштаб, иначе их не видно
      return `<g><title>${i}:00 — ${fmt(v)} сообщений${e ? `, ${e} ошибок` : ''}</title>` +
        `<rect class="bar${i === now ? ' now' : ''}" x="${x}" y="${y(0) - bh}" width="${bw}" height="${bh}" rx="3"/>` +
        (eh ? `<rect class="errbar" x="${x}" y="${y(0) - eh}" width="${bw}" height="${eh}" rx="2"/>` : '') + '</g>';
    }).join('');
    const nx = L + now * slot + slot / 2;
    const marker = `<line class="now-line" x1="${nx}" x2="${nx}" y1="${T}" y2="${y(0)}"/><text class="now-lab" x="${nx + 6}" y="${T + 10}">сейчас</text>`;
    const labels = [0, 3, 6, 9, 12, 15, 18, 21].map(i => `<text class="xlab" x="${L + i * slot + slot / 2}" y="${H - 6}">${i}:00</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Сообщения по часам за сегодня">${grid}${marker}${bars}${labels}</svg>`;
  }

  function vOverview() {
    const active = D.flows.filter(f => f.status !== 'idle').length;
    return `
      <div class="page-head"><div><h1>Обзор</h1><p>Что происходит с данными ${D.company} сегодня, 29 октября.</p></div>
        <div class="actions"><a class="btn" href="#/connections/new">${ico('plug')}Подключить систему</a><a class="btn primary" href="#/flows/new">${ico('plus')}Новый поток</a></div></div>
      <div class="kpis">
        <div class="kpi"><div class="l">${ico('flow')}Активные потоки</div><div class="v num">${active} <small>из ${D.flows.length}</small></div><div class="d muted">10 подключённых систем</div></div>
        <div class="kpi"><div class="l">${ico('send')}Сообщений сегодня</div><div class="v num">${fmt(D.hourly.reduce((a, b) => a + b, 0))}</div><div class="d up">↑ 12% к прошлому четвергу</div></div>
        <div class="kpi alert"><div class="l">${ico('pulse')}Ошибки доставки</div><div class="v num">17</div><div class="d down">3 требуют действия</div></div>
        <div class="kpi"><div class="l">${ico('star')}Золотые записи</div><div class="v num">${fmt(9112 + 31877)}</div><div class="d muted">${fmt(1284 + 3602)} пар ждут стюарда</div></div>
      </div>
      <div class="grid g-main g-overview">
        <section class="panel"><div class="panel-head"><h2>Сообщения по часам</h2><span class="meta">Продуктив</span>
          <div class="right legend"><span style="--c:var(--bar)">Доставлено</span><span style="--c:var(--signal)">Ошибки</span></div></div>
          <div class="panel-body chart-body">${chart()}</div></section>
        <section class="panel"><div class="panel-head"><h2>Требует внимания</h2></div>
          <ul class="alerts">
            <li><span class="dot" style="background:var(--signal)"></span><div><div class="t1">Заказы с сайта не доходят до 1С</div><div class="t2">3 заказа с 13:41: пустое поле «Склад»</div></div><a class="btn sm" href="#/monitoring/m-8f31c2">Разобрать</a></li>
            <li><span class="dot" style="background:var(--amber)"></span><div><div class="t1">«Курьер+» ограничивает запросы</div><div class="t2">14 повторов, всё дойдёт автоматически</div></div><a class="btn sm quiet" href="#/flows/f8">Поток</a></li>
            <li><span class="dot" style="background:var(--amber)"></span><div><div class="t1">Токен amoCRM истекает через 3 дня</div><div class="t2">Переподключите, иначе поток встанет</div></div><a class="btn sm quiet" href="#/connections">Открыть</a></li>
            <li><span class="dot" style="background:var(--ink)"></span><div><div class="t1">1 284 пары контрагентов похожи на дубли</div><div class="t2">2 084 объединены автоматически по ИНН+КПП</div></div><a class="btn sm quiet" href="#/mdm">Очередь</a></li>
          </ul></section>
      </div>
      <section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Потоки</h2><div class="right"><a class="btn sm quiet" href="#/flows">Все потоки</a></div></div>
        ${flowTable(D.flows.slice(0, 5))}</section>`;
  }

  function flowTable(list) {
    return `<table class="t"><thead><tr><th>Поток</th><th>Откуда</th><th>Куда</th><th>Как собран</th><th>Запуск</th><th class="r">Сегодня</th><th>Состояние</th></tr></thead><tbody>
      ${list.map(f => `<tr class="clickable" data-go="#/flows/${f.id}" tabindex="0">
        <td><strong>${f.name}</strong><div class="muted" style="font-size:12px">${f.version} · ${f.owner}</div></td>
        <td>${sysName(f.from)}</td><td>${sysName(f.to)}</td><td><span class="tag">${f.by}</span></td>
        <td class="muted">${f.trigger}</td><td class="r num">${fmt(f.msgs)}${f.errs ? ` <span style="color:var(--signal)">· ${f.errs} ош.</span>` : ''}</td><td>${statusPill(f.status)}</td></tr>`).join('')}
      </tbody></table>`;
  }

  function vFlows() {
    return `<div class="page-head"><div><h1>Потоки</h1><p>Поток переносит данные из одной системы в другую. Собирайте его как удобно: мышкой, через AI-чат, в Terraform или кодом. Это один и тот же поток.</p></div>
      <div class="actions"><a class="btn primary" href="#/flows/new">${ico('plus')}Новый поток</a></div></div>
      <section class="panel">${flowTable(D.flows)}</section>`;
  }

  function vNewFlow() {
    const nf = state.newFlow;
    const opts = sel => D.connections.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name} (${ctype(c.type).name})</option>`).join('');
    const byOpts = [
      ['visual', 'layers', 'Low-code', 'Схема и маппинг мышкой'],
      ['ai', 'chat', 'AI-чат', 'Опишите словами, AI соберёт черновик'],
      ['terraform', 'terraform', 'Terraform', 'Ресурс astronaut_flow в вашем репозитории'],
      ['code', 'code', 'Код (SDK)', 'Go, Python, PHP, TypeScript']
    ];
    return `<div class="crumbs"><a href="#/flows">Потоки</a> / Новый поток</div>
      <div class="page-head"><div><h1>Новый поток</h1><p>Выберите, откуда и куда идут данные, и как вы хотите собрать поток. Способ можно поменять в любой момент.</p></div></div>
      <div class="grid g-main">
        <section class="panel"><div class="panel-body">
          <div class="grid g-2">
            <div class="field"><label for="nf-from">Откуда (FROM)</label><select class="input" id="nf-from" data-nf="from">${opts(nf.from)}</select></div>
            <div class="field"><label for="nf-to">Куда (TO)</label><select class="input" id="nf-to" data-nf="to">${opts(nf.to)}</select></div>
          </div>
          <div class="grid g-2">
            <div class="field"><label for="nf-fo">Объект источника</label><input class="input" id="nf-fo" value="Справочник.Контрагенты"><span class="hint">Список подтянут из метаданных 1С: 214 объектов</span></div>
            <div class="field"><label for="nf-to2">Объект получателя</label><input class="input" id="nf-to2" value="crm.company"></div>
          </div>
          <div class="field"><label>Как собираем (BY)</label>
            <div class="catalog">${byOpts.map(([id, ic, n, d]) => `<button class="conn-card" data-nfby="${id}" aria-pressed="${nf.by === id}">${ico(ic)}<span class="n">${n}</span><span class="d">${d}</span></button>`).join('')}</div></div>
          <div class="field"><label for="nf-tr">Когда запускать</label><select class="input" id="nf-tr"><option>При изменении в источнике</option><option>По расписанию</option><option>Вебхук</option><option>Вручную</option></select></div>
          <div class="row"><button class="btn primary" data-action="create-flow">${ico('plus')}Создать черновик</button><span class="muted">Черновик создаётся в окружении «Разработка»</span></div>
        </div></section>
        <aside class="panel"><div class="panel-head"><h2>Готовые сценарии</h2></div><ul class="alerts">
          <li><div><div class="t1">1С ↔ Битрикс24</div><div class="t2">Компании, контакты, сделки → заказы</div></div></li>
          <li><div><div class="t1">Сайт 1С-Битрикс ↔ 1С</div><div class="t2">Каталог, цены, остатки, заказы</div></div></li>
          <li><div><div class="t1">amoCRM → 1С</div><div class="t2">Успешные сделки → заказы клиента</div></div></li>
          <li><div><div class="t1">1С → PostgreSQL</div><div class="t2">Продажи и остатки в хранилище</div></div></li>
          <li><div><div class="t1">MongoDB → S3</div><div class="t2">Архив событий в Parquet</div></div></li>
        </ul></aside>
      </div>`;
  }

  // --- Редактор потока ---
  function mappingRows() {
    let rows = D.mapping.map(r => ({ ...r }));
    if (state.mappingApplied) {
      const add = { 'ОсновнойМенеджер': ['ASSIGNED_BY_ID', 'сотрудник_по_email()'], 'ЮрФизЛицо': ['UF_CRM_LEGAL_FORM', 'значения: ЮрЛицо→«Юр. лицо», ИП→«ИП»'], 'КонтактнаяИнформация.ЮрАдрес': ['requisite.ADDRESS_LEGAL', 'адрес_по_фиас()'] };
      rows = rows.map(r => add[r.from] ? { ...r, to: add[r.from][0], xf: add[r.from][1], st: 'new' } : r);
    }
    return rows;
  }

  function mappingTable(editable) {
    return `<table class="t"><thead><tr><th>Поле 1С:УТ</th><th></th><th>Поле Битрикс24</th><th>Преобразование</th>${editable ? '<th>Тип</th>' : ''}<th></th></tr></thead><tbody>
      ${mappingRows().map(r => `<tr class="map-row ${r.st}"><td>${r.from}</td><td class="arrow">→</td>
        <td>${r.to || 'не сопоставлено'}</td><td class="xform">${r.xf || '—'}</td>${editable ? `<td class="muted">${r.type}</td>` : ''}
        <td class="r">${r.st === 'new' ? '<span class="pill run">AI, принято</span>' : r.st === 'missing' ? (editable ? '<button class="btn sm quiet" data-action="map-manual">Сопоставить</button>' : '') : ''}</td></tr>`).join('')}
      </tbody></table>`;
  }

  function codeFor(lang) {
    const C = {
      ts: `import { flow, check } from '@astronaut/sdk';
import { ut, b24 } from './connections';

// Контрагенты из 1С:УТ в компании Битрикс24
export default flow('Контрагенты: 1С:УТ → Битрикс24')
  .from(ut.catalog('Контрагенты').where({ ПометкаУдаления: false }))
  .onChange()
  .step(check.inn('ИНН'))
  .map({
    TITLE: 'Наименование',
    UF_CRM_INN: 'ИНН',
    UF_CRM_KPP: 'КПП',
    'PHONE[0].VALUE': (r) => r.phoneE164('КонтактнаяИнформация.Телефон'),
    'EMAIL[0].VALUE': (r) => r.lower('КонтактнаяИнформация.Email'),${state.mappingApplied ? `
    ASSIGNED_BY_ID: (r) => b24.users.byEmail(r.get('ОсновнойМенеджер.Email')),` : ''}
  })
  .to(b24.entity('crm.company').upsertBy('UF_CRM_INN'))
  .delivery({ retries: 5, backoff: 'exponential', deadLetter: true });`,
      go: `package flows

import a "github.com/astronaut/sdk-go"

// Контрагенты из 1С:УТ в компании Битрикс24
func Counterparties(c *a.Connections) a.Flow {
	return a.NewFlow("Контрагенты: 1С:УТ → Битрикс24").
		From(c.UT.Catalog("Контрагенты").Where("ПометкаУдаления", false)).
		OnChange().
		Step(a.CheckINN("ИНН")).
		Map(a.Fields{
			"TITLE":      "Наименование",
			"UF_CRM_INN": "ИНН",
			"UF_CRM_KPP": "КПП",
		}).
		To(c.B24.Entity("crm.company").UpsertBy("UF_CRM_INN")).
		Delivery(a.Retries(5), a.DeadLetter())
}`,
      py: `from astronaut import flow, check
from connections import ut, b24

# Контрагенты из 1С:УТ в компании Битрикс24
counterparties = (
    flow("Контрагенты: 1С:УТ → Битрикс24")
    .source(ut.catalog("Контрагенты").where(ПометкаУдаления=False))
    .on_change()
    .step(check.inn("ИНН"))
    .map({
        "TITLE": "Наименование",
        "UF_CRM_INN": "ИНН",
        "UF_CRM_KPP": "КПП",
    })
    .target(b24.entity("crm.company").upsert_by("UF_CRM_INN"))
    .delivery(retries=5, dead_letter=True)
)`,
      php: `<?php
use Astronaut\\Flow;
use Astronaut\\Check;

// Контрагенты из 1С:УТ в компании Битрикс24
return Flow::create('Контрагенты: 1С:УТ → Битрикс24')
    ->from($ut->catalog('Контрагенты')->where(['ПометкаУдаления' => false]))
    ->onChange()
    ->step(Check::inn('ИНН'))
    ->map([
        'TITLE' => 'Наименование',
        'UF_CRM_INN' => 'ИНН',
        'UF_CRM_KPP' => 'КПП',
    ])
    ->to($b24->entity('crm.company')->upsertBy('UF_CRM_INN'))
    ->delivery(retries: 5, deadLetter: true);`
    };
    return C[lang];
  }

  const TF = () => `terraform {
  required_providers {
    astronaut = { source = "astronaut/astronaut", version = "~> 0.4" }
  }
}

resource "astronaut_flow" "counterparties_ut_b24" {
  name        = "Контрагенты: 1С:УТ → Битрикс24"
  environment = "${state.env}"
  trigger     = { on_change = true }

  from {
    connection = astronaut_connection.ut.id
    object     = "Справочник.Контрагенты"
    filter     = "ПометкаУдаления = false"
  }

  step { check = "inn"  field = "ИНН" }

  map { from = "Наименование"  to = "TITLE" }
  map { from = "ИНН"           to = "UF_CRM_INN" }
  map { from = "КПП"           to = "UF_CRM_KPP" }${state.mappingApplied ? `
  map { from = "ОсновнойМенеджер"  to = "ASSIGNED_BY_ID"  transform = "user_by_email" }` : ''}

  to {
    connection = astronaut_connection.b24.id
    object     = "crm.company"
    upsert_key = "UF_CRM_INN"
  }

  delivery {
    retries     = 5
    backoff     = "exponential"
    dead_letter = true
  }
}`;

  function chatInit() {
    if (state.chat) return;
    state.chat = [{ who: 'bot', html: `<p>Я вижу 3 поля 1С без пары в Битрикс24: «ОсновнойМенеджер», «ЮрФизЛицо», «ЮрАдрес». Могу предложить маппинг.</p><p>Я смотрю только на названия и типы полей. Записи контрагентов мне не передаются.</p>` }];
  }

  function chatHtml() {
    return state.chat.map((m, i) => `<div class="msg ${m.who}">${m.html}</div>`).join('');
  }

  function aiPanel() {
    chatInit();
    return `<section class="panel ai-panel" aria-label="AI-помощник">
      <div class="ai-head">${ico('spark')}<h2>AI-помощник</h2><span class="pill idle" style="margin-left:auto">Локальная модель</span></div>
      <div class="ai-note">AI предлагает, вы решаете. Каждое изменение — это диф, который нужно принять. Всё пишется в журнал.</div>
      <div class="ai-log" id="ai-log">${chatHtml()}</div>
      <div class="chips">
        <button class="chip" data-ask="map">Предложи маппинг для пустых полей</button>
        <button class="chip" data-ask="err">Почему падают заказы с сайта?</button>
        <button class="chip" data-ask="test">Сгенерируй тестовые данные</button>
      </div>
      <form class="ai-input" data-form="ai"><input class="input" name="q" placeholder="Спросите про этот поток" aria-label="Вопрос AI-помощнику"><button class="btn primary" aria-label="Отправить">${ico('send')}</button></form>
    </section>`;
  }

  function vFlow(id) {
    const f = D.flows.find(x => x.id === id) || D.flows[0];
    const from = conn(f.from), to = conn(f.to);
    const m = state.flowMode;
    const modes = [['visual', 'layers', 'Low-code'], ['ai', 'chat', 'AI-чат'], ['terraform', 'terraform', 'Terraform'], ['code', 'code', 'Код']];
    let body;
    if (m === 'visual') {
      body = `<div class="editor-grid no-side"><section class="panel"><div class="panel-head"><h2>Маппинг полей</h2><span class="meta">${state.mappingApplied ? '8 из 8 полей' : '5 из 8 полей'}</span>
        <div class="right"><button class="btn sm" data-mode="ai">${ico('spark')}Попросить AI</button></div></div>${mappingTable(true)}</section></div>`;
    } else if (m === 'ai') {
      body = `<div class="editor-grid"><section class="panel"><div class="panel-head"><h2>Маппинг полей</h2><span class="meta">${state.mappingApplied ? '8 из 8 полей' : '5 из 8 полей'}</span></div>${mappingTable(false)}</section>${aiPanel()}</div>`;
    } else if (m === 'terraform') {
      body = `<section class="panel"><div class="panel-head"><h2>flows/counterparties.tf</h2><span class="meta">Провайдер astronaut/astronaut 0.4</span>
        <div class="right"><button class="btn sm" data-copy="tf">Скопировать</button></div></div><div class="panel-body"><pre class="codebox">${hl(TF())}</pre>
        <p class="muted" style="margin:12px 0 0">Изменения из интерфейса и из Terraform сходятся в одну версию потока. <code>terraform plan</code> покажет разницу до выката.</p></div></section>`;
    } else {
      const langs = [['ts', 'TypeScript'], ['go', 'Go'], ['py', 'Python'], ['php', 'PHP']];
      body = `<section class="panel"><div class="panel-head"><h2>Поток как код</h2><span class="meta">SDK Astronaut</span>
        <div class="right"><button class="btn sm" data-copy="code">Скопировать</button></div></div><div class="panel-body">
        <div class="lang" role="group" aria-label="Язык">${langs.map(([k, n]) => `<button data-lang="${k}" aria-pressed="${state.codeLang === k}">${n}</button>`).join('')}</div>
        <pre class="codebox">${hl(codeFor(state.codeLang))}</pre>
        <p class="muted" style="margin:12px 0 0">Выкат из репозитория: <code>astro deploy --env test</code>. Тесты потока запускаются в CI: <code>astro test</code>.</p></div></section>`;
    }
    return `<div class="crumbs"><a href="#/flows">Потоки</a> / ${f.name}</div>
      <div class="page-head"><div class="flow-head"><h1>${f.name}</h1>${statusPill(f.status)}<span class="tag">${f.version}</span></div>
        <div class="actions"><button class="btn" data-action="test-run">${ico('play')}Тестовый запуск</button><button class="btn primary" data-action="deploy" data-flow="${f.id}">${ico('rocket')}Выкатить</button></div></div>
      <div class="trajectory" id="traj">
        <div class="orbit-line" aria-hidden="true"></div><div class="packet" id="packet" aria-hidden="true"></div>
        <div class="station">${mark(from.type, true)}<div><div class="role">Откуда</div><div class="nm">${from.name}</div><div class="obj">${f.fromObj}</div></div></div>
        <div class="by"><div class="by-steps">${f.steps.map(s => `<span class="by-step">${s}</span>`).join('')}${state.fixApplied && f.id === 'f2' ? '<span class="by-step ai">Склад по умолчанию · новый</span>' : ''}</div><div class="by-label">${f.trigger} · повторы 5 раз · очередь недоставленных</div></div>
        <div class="station to">${mark(to.type, true)}<div><div class="role">Куда</div><div class="nm">${to.name}</div><div class="obj">${f.toObj}</div></div></div>
      </div>
      <div class="row wrap" style="margin-bottom:16px"><span class="muted">Как собираем:</span>
        <div class="modes" role="tablist" aria-label="Способ сборки">${modes.map(([k, ic, n]) => `<button role="tab" data-mode="${k}" aria-selected="${m === k}">${ico(ic)}${n}</button>`).join('')}</div>
        <span class="muted" style="margin-left:auto">Сегодня: <strong class="num">${fmt(f.msgs)}</strong> сообщений, ошибок <strong class="num">${f.errs}</strong></span></div>
      ${f.id !== 'f1' ? `<div class="banner info">В прототипе маппинг, Terraform и код заполнены для потока <a href="#/flows/f1">«Контрагенты: 1С:УТ → Битрикс24»</a>. Здесь показан тот же пример.</div>` : ''}
      ${body}`;
  }

  // --- Подключения ---
  function vConnections() {
    return `<div class="page-head"><div><h1>Подключения</h1><p>Системы, с которыми работает Astronaut. Пароли и токены хранятся в зашифрованном хранилище и не показываются после сохранения.</p></div>
      <div class="actions"><a class="btn primary" href="#/connections/new">${ico('plus')}Подключить систему</a></div></div>
      <section class="panel"><table class="t"><thead><tr><th>Система</th><th>Тип</th><th>Адрес</th><th class="r">Объектов</th><th>Последний обмен</th><th>Состояние</th></tr></thead><tbody>
      ${D.connections.map(c => `<tr><td>${sysName(c.id)}</td><td class="muted">${ctype(c.type).name}</td><td class="muted">${c.host}</td><td class="r num">${c.objects}</td><td class="muted">${c.last}</td><td>${statusPill(c.status)}</td></tr>`).join('')}
      </tbody></table></section>
      <h2 style="font-size:16px;margin:28px 0 12px">Доступные коннекторы</h2>
      <div class="catalog">${D.connectorTypes.map(t => `<a class="conn-card" href="#/connections/new" data-pick="${t.id}" style="text-decoration:none">${mark(t.id, true)}<span class="n">${t.name}</span><span class="d">${t.desc}</span></a>`).join('')}</div>`;
  }

  function vWizard() {
    const w = state.wizard;
    const t = w.type ? ctype(w.type) : null;
    const steps = ['Тип системы', 'Параметры', 'Проверка'];
    const head = `<div class="crumbs"><a href="#/connections">Подключения</a> / Новое подключение</div>
      <div class="page-head"><div><h1>Подключить систему</h1></div></div>
      <ol class="steps">${steps.map((s, i) => `<li class="${i + 1 < w.step ? 'done' : i + 1 === w.step ? 'cur' : ''}">${s}</li>`).join('')}</ol>`;
    if (w.step === 1) {
      return head + `<div class="catalog">${D.connectorTypes.map(x => `<button class="conn-card" data-wtype="${x.id}" aria-pressed="${w.type === x.id}">${mark(x.id, true)}<span class="n">${x.name}</span><span class="d">${x.kind}</span></button>`).join('')}</div>
        <div class="row" style="margin-top:20px"><button class="btn primary" data-action="w-next" ${w.type ? '' : 'disabled'}>Дальше</button></div>`;
    }
    if (w.step === 2) {
      const forms = {
        '1c': [['Название', '1С:УТ 11 — филиал Казань'], ['Адрес публикации', 'https://ut-kzn.polus.local/ut11'], ['Способ', 'Расширение Astronaut (рекомендуем)'], ['Пользователь', 'astronaut_svc'], ['Пароль', '••••••••••']],
        rest: [['Название', 'Служба доставки'], ['Базовый URL', 'https://api.example.ru/v2'], ['Описание API', 'openapi.yaml (загрузить файл)'], ['Авторизация', 'Bearer-токен'], ['Токен', '••••••••••••••••']]
      };
      const def = [['Название', `${t.name} — основной`], ['Адрес', t.id === 's3' ? 'https://s3.polus-cloud.ru' : 'host.polus.local'], ['Пользователь / ключ', 'astronaut_svc'], ['Пароль / секрет', '••••••••••']];
      const fs = forms[t.id] || def;
      return head + `<section class="panel" style="max-width:640px"><div class="panel-head">${mark(t.id, true)}<h2>${t.name}</h2></div><div class="panel-body">
        ${fs.map(([l, v], i) => `<div class="field"><label for="wf${i}">${l}</label><input class="input" id="wf${i}" value="${v}" ${/••/.test(v) ? 'type="password"' : ''}></div>`).join('')}
        ${t.id === '1c' ? '<div class="banner info">Расширение ставится в базу один раз. Конфигурацию не меняем, обновления 1С не ломаются.</div>' : ''}
        <div class="field"><label for="wenv">Окружение</label><select class="input" id="wenv"><option>Разработка</option><option>Тест</option><option selected>Продуктив</option></select></div>
        <div class="row"><button class="btn quiet" data-action="w-back">Назад</button><button class="btn primary" data-action="w-test">Проверить подключение</button></div></div></section>`;
    }
    return head + `<section class="panel" style="max-width:640px"><div class="panel-head">${mark(t.id, true)}<h2>Проверяем ${t.name}</h2></div><div class="panel-body">
      <ul class="check-list" id="checks">
        <li data-c="0"><span class="spinner"></span>Сеть и адрес доступны</li>
        <li data-c="1"><span class="spinner"></span>Учётные данные приняты</li>
        <li data-c="2"><span class="spinner"></span>Права на чтение и запись</li>
        <li data-c="3"><span class="spinner"></span>Читаем список объектов</li>
      </ul>
      <div id="w-result"></div></div></section>`;
  }

  function runChecks() {
    const lis = [...document.querySelectorAll('#checks li')];
    lis.forEach((li, i) => setTimeout(() => {
      li.querySelector('.spinner').outerHTML = `<span class="pill ok" style="padding:1px 6px">ок</span>`;
      if (i === lis.length - 1) {
        const t = ctype(state.wizard.type);
        const n = { '1c': 214, pg: 57, mysql: 41, mongo: 9, s3: 6, rest: 12, bitrix: 18, b24: 34, amo: 12 }[t.id];
        $('#w-result').innerHTML = `<div class="banner info" style="margin-top:14px">${ico('check')}Найдено ${n} объектов. ${t.id === '1c' ? 'Справочники, документы и регистры доступны для потоков.' : 'Схема сохранена, изменения будут видны в редакторе потоков.'}</div>
          <div class="row"><a class="btn" href="#/connections" data-action="w-done">К подключениям</a><a class="btn primary" href="#/flows/new">${ico('plus')}Создать поток</a></div>`;
      }
    }, 450 * (i + 1)));
  }

  // --- Мониторинг ---
  function vMonitoring() {
    const f = state.monFilter;
    const list = D.messages.filter(m => f === 'all' || m.status === f);
    const fl = [['all', 'Все'], ['err', 'Ошибки'], ['retry', 'Повторы'], ['queued', 'В очереди'], ['ok', 'Доставлено']];
    return `<div class="page-head"><div><h1>Мониторинг</h1><p>Каждое сообщение можно проследить от источника до получателя. Недоставленные не теряются: они ждут в очереди, пока вы их не повторите.</p></div>
      <div class="actions"><button class="btn" data-action="replay-all">${ico('retry')}Повторить все ошибки</button></div></div>
      <div class="kpis">
        <div class="kpi"><div class="l">Доставлено за час</div><div class="v num">13 010</div></div>
        <div class="kpi"><div class="l">Средняя задержка</div><div class="v num">340 мс</div></div>
        <div class="kpi"><div class="l">Очередь недоставленных</div><div class="v num">${state.resolved.all ? 0 : 3}</div></div>
        <div class="kpi"><div class="l">Кластер</div><div class="v num">3 из 3</div><div class="d up">узлы в строю, журнал реплицирован</div></div>
      </div>
      <section class="panel"><div class="panel-head"><div class="filters" role="group" aria-label="Фильтр">${fl.map(([k, n]) => `<button data-mf="${k}" aria-pressed="${f === k}">${n}</button>`).join('')}</div>
        <div class="right"><input class="input" style="width:240px" placeholder="ID сообщения или ключ" aria-label="Поиск сообщения"></div></div>
        <table class="t"><thead><tr><th>Сообщение</th><th>Поток</th><th>Ключ</th><th>Время</th><th class="r">Длительность</th><th>Статус</th></tr></thead><tbody>
        ${list.map(m => { const st = state.resolved[m.id] || state.resolved.all && m.status === 'err' ? 'ok' : m.status; return `<tr class="clickable" data-go="#/monitoring/${m.id}" tabindex="0"><td class="num"><strong>${m.id}</strong></td><td>${D.flows.find(x => x.id === m.flow).name}</td><td>${m.key}${m.err && st !== 'ok' ? `<div style="font-size:12px;color:var(--signal)">${m.err}</div>` : ''}</td><td class="muted num">${m.time}</td><td class="r num">${m.dur}</td><td>${msgPill(st)}</td></tr>`; }).join('') || `<tr><td colspan="6"><div class="empty">Нет сообщений с таким статусом</div></td></tr>`}
        </tbody></table></section>`;
  }

  function vMessage(id) {
    const m = D.messages.find(x => x.id === id) || D.messages[0];
    const f = D.flows.find(x => x.id === m.flow);
    const fixed = state.resolved[m.id];
    const failed = m.status === 'err' && !fixed;
    const before = `{
  "id": ${m.key.replace(/\D/g, '') || 48211},
  "date": "2026-10-29T14:02:11+03:00",
  "buyer": { "inn": "7718234561", "name": "Северсталь-Логистик" },
  "items": [
    { "sku": "PL-10442", "qty": 12, "price": 1840.00 },
    { "sku": "PL-20017", "qty": 3, "price": 9200.00 }
  ],
  "delivery": { "type": "courier", "warehouse_id": null }
}`;
    return `<div class="crumbs"><a href="#/monitoring">Мониторинг</a> / ${m.id}</div>
      <div class="page-head"><div class="flow-head"><h1>${m.key}</h1>${msgPill(fixed ? 'ok' : m.status)}</div>
        <div class="actions"><a class="btn" href="#/flows/${f.id}">Открыть поток</a>${failed ? `<button class="btn primary" data-action="replay" data-id="${m.id}">${ico('retry')}Повторить отправку</button>` : ''}</div></div>
      <div class="grid g-2">
        <section class="panel"><div class="panel-head"><h2>Путь сообщения</h2><span class="meta">${f.name}</span></div><div class="panel-body">
          <ol class="trace">
            <li><span class="node">1</span><div><div class="what">Получено из «${conn(f.from).name}»</div><div class="sub">Вебхук sale.order.saved</div></div><span class="when num">${m.time}.004</span></li>
            <li><span class="node">2</span><div><div class="what">Записано в журнал</div><div class="sub">Реплики на узлах 1 и 3, сообщение не потеряется</div></div><span class="when num">${m.time}.011</span></li>
            <li><span class="node">3</span><div><div class="what">Маппинг: sale.order → ЗаказКлиента</div><div class="sub">14 полей сопоставлено</div></div><span class="when num">${m.time}.019</span></li>
            <li><span class="node">4</span><div><div class="what">Поиск контрагента по ИНН</div><div class="sub">Найден в 1С:УТ, золотая запись GR-000412</div></div><span class="when num">${m.time}.142</span></li>
            <li class="${failed ? 'fail' : ''}"><span class="node">${failed ? '!' : '5'}</span><div><div class="what">${failed ? 'Проверка контракта не пройдена' : 'Проверка контракта'}</div><div class="sub">${failed ? 'Обязательное поле «Склад» пустое' : 'Склад подставлен по правилу «Склад по умолчанию»'}</div></div><span class="when num">${m.time}.150</span></li>
            <li class="${failed ? 'wait' : ''}"><span class="node">6</span><div><div class="what">Запись в «${conn(f.to).name}»</div><div class="sub">${failed ? 'Не выполнялась. Сообщение ждёт в очереди недоставленных' : 'Документ создан'}</div></div><span class="when num">${failed ? '—' : m.time + '.412'}</span></li>
          </ol>
          ${failed ? `<div class="errbox"><div class="t1">Почему не доставлено</div><p style="margin:6px 0 10px">В заказе нет склада. С 27.10 сайт перестал передавать <code>warehouse_id</code> для курьерской доставки. В 1С поле «Склад» в заказе клиента обязательное.</p>
            <div class="row wrap"><button class="btn sm" data-action="explain">${ico('spark')}Предложить исправление (AI)</button><span class="muted" style="font-size:12px">Объяснение собрано по журналу и контракту, без AI</span></div><div id="explain"></div></div>` : ''}
        </div></section>
        <section class="panel"><div class="panel-head"><h2>Данные сообщения</h2><span class="meta">${m.size}</span><div class="right"><span class="tag">как пришло</span></div></div>
          <div class="panel-body"><pre class="codebox">${hl(before)}</pre>
          <p class="muted" style="margin:10px 0 0;font-size:12px">Доступ к содержимому сообщений есть у ролей «Администратор» и «Разработчик интеграций». Просмотр пишется в журнал.</p></div></section>
      </div>`;
  }

  // --- MDM ---
  function vMdm() {
    const e = D.mdm.entities;
    return `<div class="page-head"><div><h1>Мастер-данные</h1><p>Золотая запись — одна правильная карточка контрагента или товара, собранная из всех систем. Astronaut находит дубли, собирает лучшие значения по правилам и раздаёт результат обратно.</p></div>
      <div class="actions"><a class="btn" href="#/mdm/rules">Правила</a></div></div>
      <div class="grid g-2" style="margin-bottom:16px">${e.map(x => `<section class="panel"><div class="panel-head"><h2>${x.name}</h2><div class="right lineage">${x.sources.map(s => mark(conn(s).type)).join('')}</div></div>
        <div class="panel-body"><div class="grid g-3">
          <div><div class="muted">Записей в системах</div><div style="font-size:22px;font-weight:600" class="num">${fmt(x.records)}</div></div>
          <div><div class="muted">Золотых записей</div><div style="font-size:22px;font-weight:600" class="num">${fmt(x.golden)}</div></div>
          <div><div class="muted">Качество</div><div style="font-size:22px;font-weight:600" class="num">${x.quality}%</div></div>
        </div><p class="muted" style="margin:12px 0 0">Объединено автоматически: ${fmt(x.auto)}. Ждут решения стюарда: <strong style="color:var(--ink)">${fmt(x.queue)}</strong>.</p></div></section>`).join('')}</div>
      <section class="panel"><div class="panel-head"><h2>Очередь стюарда: контрагенты</h2><span class="meta">Пары с похожестью ниже порога автообъединения (0,98)</span></div>
        <table class="t"><thead><tr><th>Кандидат</th><th>ИНН</th><th>Записей</th><th>Системы</th><th>Похожесть</th><th>Почему</th><th></th></tr></thead><tbody>
        ${D.mdm.queue.map(q => { const done = state.resolved[q.id]; const cls = q.score >= .9 ? 'hi' : q.score >= .75 ? 'mid' : ''; return `<tr class="clickable" data-go="#/mdm/match/${q.id}" tabindex="0"><td><strong>${q.name}</strong></td><td class="num">${q.inn}</td><td class="num">${q.n}</td><td><span class="lineage">${q.sources.map(s => mark(conn(s).type)).join('')}</span></td>
          <td><span class="score ${cls}"><span class="bar"><i style="width:${q.score * 100}%"></i></span><span class="num">${q.score.toFixed(2).replace('.', ',')}</span></span></td><td class="muted" style="font-size:13px">${q.reason}</td><td>${done ? `<span class="pill ok">${done}</span>` : ''}</td></tr>`; }).join('')}
        </tbody></table></section>
      <section class="panel" style="margin-top:16px"><div class="panel-head"><h2>Золотые записи</h2><span class="meta">последние изменения</span></div>
        <table class="t"><thead><tr><th>ID</th><th>Наименование</th><th>ИНН</th><th>КПП</th><th>Собрано из</th><th class="r">Полнота</th><th>Обновлено</th></tr></thead><tbody>
        ${D.mdm.golden.map(g => `<tr><td class="num"><strong>${g.id}</strong></td><td>${g.name}</td><td class="num">${g.inn}</td><td class="num">${g.kpp}</td><td><span class="lineage">${g.sources.map(s => mark(conn(s).type)).join('')}</span></td><td class="r num">${g.quality}%</td><td class="muted">${g.updated}</td></tr>`).join('')}
        </tbody></table></section>`;
  }

  function vMatch(id) {
    const q = D.mdm.queue.find(x => x.id === id) || D.mdm.queue[0];
    const c = D.mdm.compare;
    if (!state.picks) state.picks = [...c.pick];
    const rows = c.fields.map((fname, fi) => {
      const vals = c.records.map(r => r.vals[fi]);
      const distinct = new Set(vals.filter(Boolean)).size > 1;
      const gold = c.records[state.picks[fi]].vals[fi];
      return `<tr><td class="f">${fname}</td>${c.records.map((r, ri) => `<td class="v${state.picks[fi] === ri ? ' pick' : ''}${distinct && r.vals[fi] && state.picks[fi] !== ri ? ' diffv' : ''}" data-pick-f="${fi}" data-pick-r="${ri}" tabindex="0" title="Взять это значение">${r.vals[fi] || '<span class="muted">пусто</span>'}</td>`).join('')}
        <td class="gold">${gold || '—'}<span class="src-badge">${state.picks[fi] !== c.pick[fi] ? 'выбрано вручную' : c.rules[fi]}</span></td></tr>`;
    }).join('');
    return `<div class="crumbs"><a href="#/mdm">Мастер-данные</a> / Сравнение</div>
      <div class="page-head"><div class="flow-head"><h1>${q.name}</h1><span class="score hi"><span class="bar"><i style="width:${q.score * 100}%"></i></span><span class="num">${q.score.toFixed(2).replace('.', ',')}</span></span></div>
        <p>${q.reason}. Нажмите на значение в любой системе, чтобы взять его в золотую запись.</p>
        <div class="actions"><button class="btn quiet" data-action="not-dup" data-id="${q.id}">Это разные компании</button><button class="btn primary" data-action="merge" data-id="${q.id}">${ico('merge')}Объединить в золотую запись</button></div></div>
      <section class="panel"><div style="overflow-x:auto"><table class="compare"><thead><tr><th>Поле</th>${c.records.map(r => `<th>${sysName(r.src)}</th>`).join('')}<th class="gold">Золотая запись</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <div class="grid g-2" style="margin-top:16px">
        <section class="panel"><div class="panel-head"><h2>Проверки</h2></div><div class="panel-body"><ul class="check-list">
          <li><span class="pill ok">ок</span>ИНН 7718234561: контрольная сумма верна</li>
          <li><span class="pill ok">ок</span>КПП 771801001: формат верный, код региона 77 совпадает с адресом</li>
          <li><span class="pill ok">ок</span>Адрес приведён к ФИАС, во всех трёх системах это один дом</li>
          <li><span class="pill warn">проверьте</span>Два разных email: info@ и zakaz@. В запись берём самый свежий, второй сохраняем в истории</li>
        </ul></div></section>
        <section class="panel"><div class="panel-head"><h2>Что произойдёт после объединения</h2></div><div class="panel-body"><ul class="check-list">
          <li>Создаётся золотая запись GR-000412 со ссылками на 3 исходные записи</li>
          <li>Исправленные значения уйдут обратно в 1С:ERP и Битрикс24 потоком «Раздача мастер-данных»</li>
          <li>Объединение можно отменить в течение 30 дней: исходные записи не удаляются</li>
        </ul></div></section>
      </div>`;
  }

  function vRules() {
    const rule = (t1, t2, on) => `<div class="rule"><div><div class="t1">${t1}</div><div class="t2">${t2}</div></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''} aria-label="${t1}"><span></span></label></div>`;
    return `<div class="crumbs"><a href="#/mdm">Мастер-данные</a> / Правила</div>
      <div class="page-head"><div><h1>Правила: контрагенты</h1><p>Сначала очищаем и проверяем данные, потом ищем совпадения, потом решаем, какое значение выживает. Все правила детерминированные и объяснимые.</p></div>
        <div class="actions"><button class="btn primary" data-action="save-rules">Сохранить правила</button></div></div>
      <div class="grid g-3">
        <section class="panel"><div class="panel-head"><h2>1. Очистка и проверка</h2></div><div class="panel-body">
          ${rule('Проверка ИНН', 'Длина 10/12 и контрольная сумма', true)}
          ${rule('Проверка КПП', 'Формат и код налоговой', true)}
          ${rule('Телефоны к формату +7', 'Убрать пробелы, скобки, 8 в начале', true)}
          ${rule('Адреса к ФИАС', 'Через подключённый сервис нормализации', true)}
          ${rule('Организационная форма', '«ООО» в начале, кавычки-ёлочки', true)}
          ${rule('Обогащение по ЕГРЮЛ', 'Полное наименование, ОГРН, статус. Нужен внешний сервис', false)}
        </div></section>
        <section class="panel"><div class="panel-head"><h2>2. Поиск дублей</h2></div><div class="panel-body">
          ${rule('ИНН + КПП совпадают', 'Объединять автоматически', true)}
          ${rule('ИНН совпадает, КПП разные', 'В очередь: может быть филиал', true)}
          ${rule('Название ≥ 0,90 и адрес совпадает', 'В очередь стюарда', true)}
          ${rule('Телефон или email совпадает', 'Повышает похожесть на 0,05', true)}
          ${rule('Подсказка AI для записей без ИНН', 'Только предложение в очередь, никогда не объединяет сам', false)}
          <div class="field" style="margin-top:12px"><label for="thr">Порог автообъединения</label><input class="input" id="thr" value="0,98"><span class="hint">Ниже порога — только через стюарда</span></div>
        </div></section>
        <section class="panel"><div class="panel-head"><h2>3. Выживание значений</h2></div><div class="panel-body">
          <table class="t"><thead><tr><th>Поле</th><th>Правило</th></tr></thead><tbody>
            <tr><td>Наименование</td><td class="muted">Доверенный источник: 1С:УТ</td></tr>
            <tr><td>Полное наименование</td><td class="muted">Самое полное</td></tr>
            <tr><td>Юр. адрес</td><td class="muted">Нормализованный по ФИАС</td></tr>
            <tr><td>Телефон</td><td class="muted">Чаще всего встречается</td></tr>
            <tr><td>Email</td><td class="muted">Самое свежее</td></tr>
            <tr><td>Менеджер</td><td class="muted">Доверенный источник: Битрикс24</td></tr>
          </tbody></table>
          <p class="muted" style="font-size:13px;margin:12px 0 0">Приоритет источников: 1С:УТ → 1С:ERP → Битрикс24 → amoCRM</p>
        </div></section>
      </div>`;
  }

  // --- Разработчикам ---
  function vDevelopers() {
    return `<div class="page-head"><div><h1>Разработчикам</h1><p>Всё, что можно сделать в интерфейсе, можно сделать кодом: SDK, Terraform-провайдер, CLI и REST API. Потоки хранятся в вашем git и проходят ревью как обычный код.</p></div></div>
      <div class="grid g-2">
        <section class="panel"><div class="panel-head"><h2>SDK</h2></div><div class="panel-body"><pre class="codebox">${hl(`// TypeScript
npm i @astronaut/sdk

// Go
go get github.com/astronaut/sdk-go

// Python
uv add astronaut-sdk

// PHP
composer require astronaut/sdk`)}</pre></div></section>
        <section class="panel"><div class="panel-head"><h2>CLI</h2></div><div class="panel-body"><pre class="codebox">${hl(`astro login --org polus
astro init flows/              // шаблон проекта
astro test                     // тесты потоков на синтетике
astro diff --env prod          // что изменится
astro deploy --env test        // выкат
astro replay --flow f2 --failed  // повтор ошибок`)}</pre></div></section>
        <section class="panel"><div class="panel-head"><h2>Terraform</h2></div><div class="panel-body"><pre class="codebox">${hl(`resource "astronaut_connection" "ut" {
  type     = "1c"
  name     = "1С:УТ 11 — центральная"
  url      = "https://ut.polus.local/ut11"
  secret   = var.ut_password
}`)}</pre></div></section>
        <section class="panel"><div class="panel-head"><h2>Ключи API</h2><div class="right"><button class="btn sm" data-action="new-key">${ico('plus')}Новый ключ</button></div></div>
          <table class="t"><thead><tr><th>Название</th><th>Права</th><th>Окружение</th><th>Создан</th></tr></thead><tbody>
          <tr><td>CI GitLab</td><td class="muted">deploy, test</td><td>Тест, Продуктив</td><td class="muted">12.09.2026</td></tr>
          <tr><td>Terraform</td><td class="muted">flows:write</td><td>Все</td><td class="muted">03.08.2026</td></tr>
          <tr><td>BI только чтение</td><td class="muted">golden:read</td><td>Продуктив</td><td class="muted">21.10.2026</td></tr>
          </tbody></table></section>
      </div>`;
  }

  // --- Настройки ---
  function vSettings() {
    return `<div class="page-head"><div><h1>Настройки</h1><p>Окружения, доступы, AI и журнал действий.</p></div></div>
      <div class="grid g-2">
        <section class="panel"><div class="panel-head"><h2>Окружения</h2></div><table class="t"><thead><tr><th>Окружение</th><th class="r">Потоков</th><th>Выкат</th></tr></thead><tbody>
          <tr><td>Разработка</td><td class="r num">11</td><td class="muted">Сразу, без согласования</td></tr>
          <tr><td>Тест</td><td class="r num">9</td><td class="muted">После прохождения astro test</td></tr>
          <tr><td>Продуктив</td><td class="r num">8</td><td class="muted">Согласование администратора</td></tr></tbody></table></section>
        <section class="panel"><div class="panel-head"><h2>Роли</h2></div><table class="t"><thead><tr><th>Роль</th><th>Что может</th><th class="r">Людей</th></tr></thead><tbody>
          <tr><td>Администратор</td><td class="muted">Всё, включая выкат в Продуктив</td><td class="r num">2</td></tr>
          <tr><td>Разработчик интеграций</td><td class="muted">Потоки и подключения в Разработке и Тесте</td><td class="r num">4</td></tr>
          <tr><td>Стюард данных</td><td class="muted">Очередь дублей, золотые записи</td><td class="r num">3</td></tr>
          <tr><td>Наблюдатель</td><td class="muted">Мониторинг без содержимого сообщений</td><td class="r num">6</td></tr></tbody></table></section>
        <section class="panel"><div class="panel-head"><h2>AI-помощник</h2>${ico('shield')}</div><div class="panel-body">
          <div class="rule"><div><div class="t1">AI-помощник включён</div><div class="t2">Без него платформа работает полностью</div></div><label class="switch"><input type="checkbox" data-action="toggle-ai" ${state.ai ? 'checked' : ''} aria-label="AI-помощник включён"><span></span></label></div>
          <div class="field" style="margin-top:12px"><label for="model">Модель</label><select class="input" id="model"><option>Локальная модель в вашем контуре</option><option>Облачная модель (российское облако)</option></select></div>
          <div class="rule"><div><div class="t1">Передавать модели содержимое сообщений</div><div class="t2">Заблокировано политикой. Модель видит только схемы, названия полей и синтетические примеры</div></div><label class="switch"><input type="checkbox" disabled aria-label="Передавать содержимое сообщений"><span></span></label></div>
          <div class="rule"><div><div class="t1">AI может применять изменения сам</div><div class="t2">Недоступно. Любое предложение применяет человек</div></div><label class="switch"><input type="checkbox" disabled aria-label="Автоприменение"><span></span></label></div>
        </div></section>
        <section class="panel"><div class="panel-head"><h2>Журнал действий</h2><span class="meta">сегодня</span></div><ul class="alerts">
          ${D.audit.map(a => `<li><span class="dot" style="background:${a.kind === 'ai' ? 'var(--suit)' : a.kind === 'mdm' ? 'var(--orbit)' : 'var(--ink)'}"></span><div><div class="t1">${a.what}</div><div class="t2">${a.who}, ${a.t}${a.kind === 'ai' ? ' · предложение AI' : ''}</div></div></li>`).join('')}
        </ul></section>
      </div>`;
  }

  // ---------- Роутер ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'overview';
    const [a, b, c] = h.split('/');
    let html, key = a;
    if (a === 'overview') html = vOverview();
    else if (a === 'flows' && b === 'new') html = vNewFlow();
    else if (a === 'flows' && b) { html = vFlow(b); }
    else if (a === 'flows') html = vFlows();
    else if (a === 'connections' && b === 'new') html = vWizard();
    else if (a === 'connections') html = vConnections();
    else if (a === 'monitoring' && b) html = vMessage(b);
    else if (a === 'monitoring') html = vMonitoring();
    else if (a === 'mdm' && b === 'match') html = vMatch(c);
    else if (a === 'mdm' && b === 'rules') html = vRules();
    else if (a === 'mdm') html = vMdm();
    else if (a === 'developers') html = vDevelopers();
    else if (a === 'settings') html = vSettings();
    else { html = vOverview(); key = 'overview'; }
    $('#view').innerHTML = html;
    document.querySelectorAll('#nav a').forEach(n => n.setAttribute('aria-current', n.dataset.key === key ? 'page' : 'false'));
    if (a === 'connections' && b === 'new' && state.wizard.step === 3) runChecks();
    const log = $('#ai-log'); if (log) log.scrollTop = log.scrollHeight;
  }

  // ---------- AI-сценарии ----------
  function botReply(kind) {
    const add = (who, html) => { state.chat.push({ who, html }); };
    const ask = { map: 'Предложи маппинг для пустых полей', err: 'Почему падают заказы с сайта?', test: 'Сгенерируй тестовые данные' }[kind] || kind;
    add('me', ask);
    add('bot', '<span class="typing"><i></i><i></i><i></i></span>');
    route();
    setTimeout(() => {
      state.chat.pop();
      if (kind === 'map') {
        add('bot', `<p>Предлагаю три сопоставления. Уверенность указана для каждого.</p>
          <div class="proposal" id="prop-map"><div class="proposal-head">Предложение AI · изменения маппинга</div>
          <pre class="diff"><span class="add">+ ОсновнойМенеджер → ASSIGNED_BY_ID</span><span class="meta">через email сотрудника, уверенность 0,92</span><span class="add">+ ЮрФизЛицо → UF_CRM_LEGAL_FORM</span><span class="meta">значения по таблице, уверенность 0,88</span><span class="add">+ ЮрАдрес → requisite.ADDRESS_LEGAL</span><span class="meta">адрес по ФИАС, уверенность 0,74</span></pre>
          <div class="row"><button class="btn sm primary" data-action="apply-map">${ico('check')}Применить</button><button class="btn sm quiet" data-action="reject" data-target="prop-map">Отклонить</button></div></div>`);
      } else if (kind === 'err') {
        add('bot', `<p>С 13:41 упали 3 заказа. Во всех трёх пустой <code>warehouse_id</code>, а в 1С поле «Склад» обязательное. Пустое значение приходит с 27.10, после обновления модуля доставки на сайте.</p>
          <div class="proposal" id="prop-fix"><div class="proposal-head">Предложение AI · новый шаг потока «Заказы: сайт → 1С:УТ»</div>
          <pre class="diff"><span class="add">+ шаг «Склад по умолчанию»</span><span class="add">+   если delivery.warehouse_id пусто → «Основной склад (Москва)»</span></pre>
          <div class="row"><button class="btn sm primary" data-action="apply-fix">${ico('check')}Применить в черновик</button><button class="btn sm quiet" data-action="reject" data-target="prop-fix">Отклонить</button></div></div>`);
      } else if (kind === 'test') {
        add('bot', `<p>Сгенерировал 5 синтетических контрагентов: ИНН с правильной контрольной суммой, один без КПП (ИП), один с пустым email. Реальных данных в наборе нет.</p>
          <div class="proposal"><div class="proposal-head">Тестовый набор · 5 записей</div><pre class="diff">ООО «Тест-Альфа»    7701000014  770101001
ИП Тестов И. И.     500100000098
АО «Тест-Гамма»     6601000030  660101001
ООО «Тест-Дельта»   7801000046  780101001
ООО «Тест-Эпсилон»  5401000050  540101001</pre>
          <div class="row"><button class="btn sm primary" data-action="test-run">${ico('play')}Прогнать тест</button></div></div>`);
      } else {
        add('bot', '<p>В прототипе работают подсказки под чатом. В продукте здесь можно спросить про любой поток, поле или ошибку.</p>');
      }
      route();
    }, 900);
  }

  // ---------- События ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a, tr[data-go], td[data-pick-f]');
    if (!t) return;
    if (t.dataset.env) { state.env = t.dataset.env; renderShell(); route(); toast(`Окружение: ${envName[state.env]}`); return; }
    if (t.dataset.go) { location.hash = t.dataset.go; return; }
    if (t.dataset.mode) { state.flowMode = t.dataset.mode; route(); return; }
    if (t.dataset.lang) { state.codeLang = t.dataset.lang; route(); return; }
    if (t.dataset.ask) { botReply(t.dataset.ask); return; }
    if (t.dataset.mf) { state.monFilter = t.dataset.mf; route(); return; }
    if (t.dataset.wtype) { state.wizard.type = t.dataset.wtype; route(); return; }
    if (t.dataset.pick) { state.wizard = { step: 2, type: t.dataset.pick }; return; }
    if (t.dataset.nfby) { state.newFlow.by = t.dataset.nfby; route(); return; }
    if (t.dataset.pickF !== undefined) { state.picks[+t.dataset.pickF] = +t.dataset.pickR; route(); return; }
    if (t.dataset.copy) { toast('Скопировано в буфер обмена'); return; }

    switch (t.dataset.action) {
      case 'open-ai': state.flowMode = 'ai'; location.hash = '#/flows/f1'; route(); break;
      case 'test-run': {
        const p = $('#packet');
        if (!p) { toast('Тест прогнан на 5 синтетических записях: 5 из 5 доставлены'); break; }
        p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
        setTimeout(() => toast('Тестовый запуск: 5 из 5 записей доставлены в Разработку за 0,8 с'), 1800);
        break;
      }
      case 'deploy': {
        const target = state.env === 'prod' ? 'Продуктив' : envName[state.env];
        const m = modal('Выкатить поток', `<p style="margin-top:0">Новая версия <strong>v15</strong> уйдёт в окружение <strong>${target}</strong>.</p>
          <pre class="diff" style="background:var(--tint);border-radius:8px">${state.mappingApplied ? '<span class="add">+ map ОсновнойМенеджер → ASSIGNED_BY_ID</span><span class="add">+ map ЮрФизЛицо → UF_CRM_LEGAL_FORM</span><span class="add">+ map ЮрАдрес → requisite.ADDRESS_LEGAL</span>' : state.fixApplied ? '<span class="add">+ step «Склад по умолчанию»</span>' : '  изменений относительно v14 нет'}</pre>
          <ul class="check-list"><li><span class="pill ok">ок</span>astro test: 24 из 24 тестов пройдены</li><li><span class="pill ok">ок</span>Контракт получателя не сломан</li><li><span class="pill idle">нужно</span>Согласование администратора для Продуктива</li></ul>`,
          `<button class="btn quiet" data-close>Отмена</button><button class="btn primary" data-confirm>${ico('rocket')}Отправить на согласование</button>`);
        m.querySelector('[data-confirm]').addEventListener('click', () => { m.remove(); audit('Отправила на согласование выкат v15 в ' + target, 'deploy'); toast('Запрос на выкат отправлен администратору'); });
        break;
      }
      case 'apply-map':
        state.mappingApplied = true; audit('Применила предложение AI: 3 поля маппинга в потоке «Контрагенты: 1С:УТ → Битрикс24»', 'ai');
        state.chat.push({ who: 'bot', html: '<p>Готово: три поля добавлены в черновик v15. Проверьте и выкатите, когда будете готовы.</p>' });
        route(); toast('Маппинг обновлён. Изменение записано в журнал'); break;
      case 'apply-fix':
        state.fixApplied = true; audit('Применила предложение AI: шаг «Склад по умолчанию» в потоке «Заказы: сайт → 1С:УТ»', 'ai');
        if (location.hash.startsWith('#/monitoring/')) { $('#explain').innerHTML = `<div class="banner info" style="margin:10px 0 0">${ico('check')}Шаг добавлен в черновик v10 потока. После выката повторите сообщение.</div>`; }
        else { state.chat.push({ who: 'bot', html: '<p>Шаг добавлен в черновик v10. После выката повторите 3 упавших заказа в мониторинге.</p>' }); route(); }
        toast('Шаг добавлен в черновик. Изменение записано в журнал'); break;
      case 'reject': { const p = document.getElementById(t.dataset.target); if (p) p.classList.add('rejected'); audit('Отклонила предложение AI', 'ai'); toast('Предложение отклонено'); break; }
      case 'explain':
        $('#explain').innerHTML = `<div class="proposal" style="margin-top:12px"><div class="proposal-head">Предложение AI · новый шаг потока</div>
          <pre class="diff"><span class="add">+ шаг «Склад по умолчанию»</span><span class="add">+   если delivery.warehouse_id пусто → «Основной склад (Москва)»</span></pre>
          <div class="row"><button class="btn sm primary" data-action="apply-fix">${ico('check')}Применить в черновик</button><button class="btn sm quiet" data-action="reject" data-target="explain">Отклонить</button></div></div>`;
        break;
      case 'replay': state.resolved[t.dataset.id] = 'ok'; route(); toast('Сообщение повторено и доставлено в 1С:УТ'); break;
      case 'replay-all': state.resolved.all = true; ['m-8f31c2', 'm-8f31a9', 'm-8f3177'].forEach(i => state.resolved[i] = 'ok'); route(); toast('3 сообщения повторены и доставлены'); break;
      case 'merge': state.resolved[t.dataset.id] = 'Объединено'; audit('Объединила записи в золотую запись GR-000412', 'mdm'); state.picks = null; location.hash = '#/mdm'; toast('Золотая запись GR-000412 создана. Исправления уйдут в 1С:ERP и Битрикс24'); break;
      case 'not-dup': state.resolved[t.dataset.id] = 'Не дубль'; state.picks = null; location.hash = '#/mdm'; toast('Пара помечена как разные компании и больше не появится'); break;
      case 'save-rules': toast('Правила сохранены. Пересчёт кандидатов займёт около 2 минут'); break;
      case 'w-next': state.wizard.step = 2; route(); break;
      case 'w-back': state.wizard.step = 1; route(); break;
      case 'w-test': state.wizard.step = 3; route(); break;
      case 'w-done': state.wizard = { step: 1, type: null }; break;
      case 'create-flow': state.flowMode = state.newFlow.by; location.hash = '#/flows/f4'; toast('Черновик создан в окружении «Разработка»'); break;
      case 'map-manual': toast('В продукте здесь откроется выбор поля получателя'); break;
      case 'new-key': modal('Новый ключ API', '<div class="field"><label for="kn">Название</label><input class="input" id="kn" value="Скрипт выгрузки"></div><div class="field"><label for="kp">Права</label><select class="input" id="kp"><option>golden:read</option><option>flows:write</option><option>deploy</option></select></div>', '<button class="btn quiet" data-close>Отмена</button><button class="btn primary" data-close>Создать ключ</button>'); break;
      case 'toggle-ai': state.ai = t.checked; toast(state.ai ? 'AI-помощник включён' : 'AI-помощник выключен. Всё остальное работает как прежде'); break;
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-go], td[data-pick-f]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Escape') { const m = document.querySelector('.modal-bg'); if (m) m.remove(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('.search input').focus(); }
  });
  document.addEventListener('change', e => {
    if (e.target.dataset.nf) state.newFlow[e.target.dataset.nf] = e.target.value;
    if (e.target.dataset.action === 'toggle-ai') { state.ai = e.target.checked; toast(state.ai ? 'AI-помощник включён' : 'AI-помощник выключен. Всё остальное работает как прежде'); }
  });
  document.addEventListener('submit', e => {
    if (e.target.dataset.form === 'ai') { e.preventDefault(); const q = e.target.q.value.trim(); if (q) botReply(q); }
  });

  // Пресеты состояния для скриншотов презентации: index.html?shot=ai-map#/flows/f1
  const shot = new URLSearchParams(location.search).get('shot');
  const instant = (fn) => { const st = window.setTimeout; window.setTimeout = (f) => st(f, 0); fn(); window.setTimeout = st; };
  if (shot) {
    const mode = { ai: 'ai', 'ai-map': 'ai', 'ai-applied': 'ai', tf: 'terraform', code: 'code', visual: 'visual' }[shot];
    if (mode) state.flowMode = mode;
    if (shot === 'ai-applied') state.mappingApplied = true;
    if (shot === 'wizard3') state.wizard = { step: 3, type: '1c' };
    if (shot === 'wizard2') state.wizard = { step: 2, type: '1c' };
  }

  window.addEventListener('hashchange', () => { route(); $('#view').focus({ preventScroll: true }); window.scrollTo(0, 0); });
  renderShell();
  route();
  if (shot === 'ai-map') instant(() => botReply('map'));
  if (shot === 'ai-applied') { chatInit(); state.chat.push({ who: 'me', html: 'Предложи маппинг для пустых полей' }, { who: 'bot', html: '<p>Готово: три поля добавлены в черновик v15. Проверьте и выкатите, когда будете готовы.</p>' }); route(); }
  if (shot === 'explain') { const b = document.querySelector('[data-action="explain"]'); b && b.click(); }
})();
