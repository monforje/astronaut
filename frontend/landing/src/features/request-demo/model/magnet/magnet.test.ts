import { Window } from "happy-dom";
import { initMagnet, magnetOffset } from "./magnet";

const box = { left: 100, top: 100, width: 200, height: 60 };

/** Страница с одной магнитной ссылкой; `media` — какие медиазапросы «совпадают» в этом окне. */
function setup(media: Record<string, boolean>) {
  const win = new Window();
  win.document.body.innerHTML = '<a data-magnet href="#">Записаться на демо</a>';
  // `Window` здесь — класс happy-dom, поэтому тип окна берём из сигнатуры initMagnet.
  const fake = {
    matchMedia: (query: string) => ({ matches: media[query] ?? false }),
  } as unknown as Parameters<typeof initMagnet>[1];
  initMagnet(win.document as unknown as Document, fake);
  const link = win.document.querySelector("a")!;
  const move = () =>
    link.dispatchEvent(new win.PointerEvent("pointermove", { clientX: 50, clientY: 0 }));
  return { link, move };
}

describe("magnetOffset", () => {
  it("тянет кнопку к курсору на долю расстояния от центра", () => {
    expect(magnetOffset({ x: 220, y: 130 }, box)).toEqual({ x: 6, y: 0 });
  });

  it("не уводит кнопку дальше max пикселей", () => {
    expect(magnetOffset({ x: 900, y: -500 }, box)).toEqual({ x: 10, y: -10 });
  });
});

describe("initMagnet", () => {
  it("с мышью кнопка сдвигается под курсором", () => {
    const { link, move } = setup({ "(hover: hover) and (pointer: fine)": true });
    move();
    expect(link.style.translate).not.toBe("");
  });

  it("на телефоне и с prefers-reduced-motion кнопка стоит", () => {
    const touch = setup({});
    touch.move();
    expect(touch.link.style.translate).toBe("");
    const reduced = setup({
      "(hover: hover) and (pointer: fine)": true,
      "(prefers-reduced-motion: reduce)": true,
    });
    reduced.move();
    expect(reduced.link.style.translate).toBe("");
  });
});
