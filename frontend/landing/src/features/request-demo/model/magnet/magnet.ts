/**
 * «Магнитная» кнопка (реф Magnet из reactbits): под курсором кнопка тянется к нему на долю
 * расстояния от центра, не дальше `max` пикселей, и мягко возвращается, когда курсор ушёл. Только
 * для мыши и только без prefers-reduced-motion: на телефоне и с отключённым движением кнопка стоит.
 */
interface Point {
  x: number;
  y: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Сдвиг кнопки к курсору. */
export function magnetOffset(pointer: Point, box: Box, strength = 0.3, max = 10): Point {
  const clamp = (v: number) => Math.max(-max, Math.min(max, v * strength));
  return {
    x: clamp(pointer.x - (box.left + box.width / 2)),
    y: clamp(pointer.y - (box.top + box.height / 2)),
  };
}

/** Вешает магнит на все `[data-magnet]` внутри `root`. */
export function initMagnet(root: ParentNode = document, win: Window = window): void {
  const fine = win.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;
  for (const el of root.querySelectorAll<HTMLElement>("[data-magnet]")) {
    el.addEventListener("pointermove", (event) => {
      const { x, y } = magnetOffset(
        { x: event.clientX, y: event.clientY },
        el.getBoundingClientRect(),
      );
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.translate = "";
    });
  }
}
