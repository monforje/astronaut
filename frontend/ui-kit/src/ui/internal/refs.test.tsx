/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render } from "@testing-library/react";
import { createRef, useRef, type Ref } from "react";
import { describe, expect, it, vi } from "vitest";
import { assignRef, mergeRefs, useMergedRefs } from "./refs";

describe("assignRef", () => {
  it("записывает узел в объектную ссылку", () => {
    const ref = createRef<HTMLDivElement>();
    const node = document.createElement("div");
    assignRef(ref, node);
    expect(ref.current).toBe(node);
  });

  it("вызывает функцию-ссылку и отдаёт её результат", () => {
    const cleanup = vi.fn();
    const ref = vi.fn(() => cleanup);
    const node = document.createElement("div");
    expect(assignRef(ref, node)).toBe(cleanup);
    expect(ref).toHaveBeenCalledWith(node);
  });

  it("пустую ссылку молча пропускает", () => {
    expect(() => assignRef(undefined, document.createElement("div"))).not.toThrow();
  });
});

describe("mergeRefs", () => {
  it("ставит узел во все ссылки и обнуляет при размонтировании", () => {
    const object = createRef<HTMLDivElement>();
    const fn = vi.fn();
    function Example() {
      return <div ref={mergeRefs(object, fn, undefined)} />;
    }
    const { container, unmount } = render(<Example />);
    expect(object.current).toBe(container.firstElementChild);
    expect(fn).toHaveBeenCalledWith(container.firstElementChild);
    unmount();
    expect(object.current).toBeNull();
    expect(fn).toHaveBeenLastCalledWith(null);
  });

  it("вызывает очистку функции-ссылки вместо null", () => {
    const cleanup = vi.fn();
    const ref: Ref<HTMLDivElement> = () => cleanup;
    function Example() {
      return <div ref={mergeRefs(ref)} />;
    }
    const { unmount } = render(<Example />);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe("useMergedRefs", () => {
  it("держит одну функцию, пока ссылки не меняются", () => {
    const seen: unknown[] = [];
    const outer = createRef<HTMLDivElement>();
    function Example({ tick }: { tick: number }) {
      const inner = useRef<HTMLDivElement>(null);
      const merged = useMergedRefs(inner, outer);
      seen.push(merged);
      return <div ref={merged} data-tick={tick} />;
    }
    const { rerender, container } = render(<Example tick={1} />);
    rerender(<Example tick={2} />);
    expect(seen[0]).toBe(seen[seen.length - 1]);
    expect(outer.current).toBe(container.firstElementChild);
  });
});
