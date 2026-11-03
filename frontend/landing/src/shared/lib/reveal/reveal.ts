/**
 * Появление блоков при прокрутке: ставит `data-inview` элементу с `data-reveal`, когда он хотя бы
 * на 15% на экране, и больше за ним не следит. Как именно блок появляется, решают стили
 * (app/styles/global.css и секции). Без IntersectionObserver показывает всё сразу.
 *
 * Это единственный клиентский скрипт, общий для всей страницы: без него блоки статичны, но видны —
 * прятать их до запуска JS стили не дают (`.js` на <html>).
 */
export function initReveal(
  root: ParentNode = document,
  Observer: typeof IntersectionObserver | undefined = globalThis.IntersectionObserver,
): void {
  const targets = [...root.querySelectorAll<HTMLElement>("[data-reveal]")];
  if (!Observer) {
    for (const el of targets) el.dataset.inview = "";
    return;
  }
  const observer = new Observer(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.inview = "";
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of targets) observer.observe(el);
}
