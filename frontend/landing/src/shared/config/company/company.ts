/**
 * Кто мы и как с нами связаться — одно место для шапки, первого экрана, блока «Демо», подвала и
 * разметки Organization, чтобы ссылки не разошлись (PLAN.md, «Как устроена заявка»).
 *
 * Формы нет: «Записаться на демо» открывает чат с CEO в Telegram, сообщение уже набрано, человеку
 * остаётся дописать название компании и отправить. Поэтому персональные данные посетителей сайт
 * не собирает и не хранит. Почта — запасной путь, обычной ссылкой `mailto:`.
 */
export const COMPANY_NAME = "Astronaut";
/** Описание одной строкой — phrases.md, «О компании». */
export const COMPANY_LINE =
  "Astronaut — платформа данных для логистических и транспортных компаний.";
export const COMPANY_CITY = "Владивосток";

export const TELEGRAM_USERNAME = "monforje";
export const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME}`;

/** Текст, который Telegram подставит в поле сообщения. Пробел в конце — под название компании. */
export const DEMO_MESSAGE = "Здравствуйте! Хочу посмотреть демо Astronaut. Компания: ";
/** Ссылка всех кнопок «Записаться на демо»: сразу чат, без промежуточных страниц и редиректов. */
export const DEMO_URL = `${TELEGRAM_URL}?text=${encodeURIComponent(DEMO_MESSAGE)}`;

export const EMAIL = "komarov.di@dvfu.ru";
export const MAILTO_URL = `mailto:${EMAIL}`;
