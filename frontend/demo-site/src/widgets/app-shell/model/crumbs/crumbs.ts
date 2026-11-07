/** Что страница сообщает оболочке через `handle` маршрута (`app/routes`): её название для крошек. */
export interface RouteHandle {
  crumb?: string;
}

export interface Crumb {
  label: string;
  href?: string;
}

interface RouteMatch {
  pathname: string;
  handle: unknown;
}

export const HOME_CRUMB = "Главная";

/**
 * Крошки вместо заголовка страницы (DESIGN.md): первая всегда «Главная», дальше названия из `handle.crumb`
 * совпавших маршрутов. Последняя — текущая страница, без ссылки.
 */
export function buildCrumbs(matches: RouteMatch[]): Crumb[] {
  const pages = matches.flatMap(({ pathname, handle }) => {
    const label = (handle as RouteHandle | undefined)?.crumb;
    return label ? [{ label, href: pathname }] : [];
  });
  const all: Crumb[] = [{ label: HOME_CRUMB, href: "/" }, ...pages];
  return all.map((crumb, index) => (index === all.length - 1 ? { label: crumb.label } : crumb));
}
