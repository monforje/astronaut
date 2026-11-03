import { Window } from "happy-dom";
import { initReveal } from "./reveal";

function page(html: string) {
  const doc = new Window().document;
  doc.body.innerHTML = html;
  return doc as unknown as Document;
}

/** Наблюдатель-заглушка: запоминает цели и даёт вручную «показать» их на экране. */
class FakeObserver {
  static last: FakeObserver;
  targets: Element[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    FakeObserver.last = this;
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve(el: Element) {
    this.targets = this.targets.filter((t) => t !== el);
  }
  show(el: Element) {
    this.callback(
      [{ target: el, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("initReveal", () => {
  it("помечает блок data-inview, когда он показался, и перестаёт за ним следить", () => {
    const doc = page(
      '<section data-reveal id="a"></section><section data-reveal id="b"></section>',
    );
    initReveal(doc, FakeObserver as unknown as typeof IntersectionObserver);
    const a = doc.getElementById("a")!;
    expect(FakeObserver.last.targets).toHaveLength(2);
    FakeObserver.last.show(a);
    expect(a.hasAttribute("data-inview")).toBe(true);
    expect(doc.getElementById("b")!.hasAttribute("data-inview")).toBe(false);
    expect(FakeObserver.last.targets).toHaveLength(1);
  });

  it("без IntersectionObserver показывает всё сразу", () => {
    const doc = page("<div data-reveal></div><div data-reveal></div>");
    initReveal(doc, undefined);
    expect(doc.querySelectorAll("[data-inview]")).toHaveLength(2);
  });
});
