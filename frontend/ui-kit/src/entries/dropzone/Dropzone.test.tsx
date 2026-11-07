/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropzone, type DropzoneProps } from "./index";

const ACCEPT = ["pdf", "xlsx", "jpg", "png"];
const zone = () => screen.getByRole("button", { name: "Загрузка файлов" });
const picker = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;
const file = (name: string, size = 100) =>
  new File([new Uint8Array(size)], name, { type: "application/octet-stream" });
const pick = (container: HTMLElement, ...files: File[]) =>
  fireEvent.change(picker(container), { target: { files } });
const items = (...types: string[]) => types.map((type) => ({ kind: "file", type }));

function renderZone(props: Partial<DropzoneProps> = {}) {
  return render(<Dropzone accept={ACCEPT} maxSizeMb={1} maxFiles={3} {...props} />);
}

afterEach(() => vi.useRealTimers());

describe("Dropzone", () => {
  it("в покое: зона-кнопка с подсказкой по форматам, размеру и лимиту", () => {
    renderZone();
    expect(zone().getAttribute("tabindex")).toBe("0");
    expect(zone().hasAttribute("data-state")).toBe(false);
    expect(screen.getByText("Перетащите файлы сюда или нажмите")).toBeTruthy();
    expect(screen.getByText("PDF, XLSX, JPG, PNG · до 1 МБ · не более 3")).toBeTruthy();
  });

  it("compact меняет заголовок и добавляет класс", () => {
    renderZone({ compact: true });
    expect(screen.getByText("Перетащите или выберите файлы")).toBeTruthy();
    expect(zone().classList.contains("ds-dropzone--compact")).toBe(true);
  });

  it("скрытый input принимает нужные расширения и несколько файлов", () => {
    const { container } = renderZone();
    expect(picker(container).accept).toBe(".pdf,.xlsx,.jpg,.png");
    expect(picker(container).multiple).toBe(true);
  });

  it("при maxFiles=1 выбор одиночный", () => {
    const { container } = renderZone({ maxFiles: 1 });
    expect(picker(container).multiple).toBe(false);
  });

  it("клик, Enter и Space открывают окно выбора файлов", () => {
    const { container } = renderZone();
    const click = vi.spyOn(picker(container), "click");
    fireEvent.click(zone());
    fireEvent.keyDown(zone(), { key: "Enter" });
    fireEvent.keyDown(zone(), { key: " " });
    expect(click).toHaveBeenCalledTimes(3);
  });

  it("выбор подходящего файла: onFiles и строка «Готово» в списке", () => {
    const onFiles = vi.fn();
    const { container } = renderZone({ onFiles });
    const invoice = file("invoice.pdf");
    pick(container, invoice);
    expect(onFiles).toHaveBeenCalledWith([invoice]);
    expect(screen.getByText("invoice.pdf")).toBeTruthy();
    expect(screen.getByText("Готово")).toBeTruthy();
  });

  it("неверный формат: onReject с причиной, зона в состоянии reject, объявление в aria-live", () => {
    const onReject = vi.fn();
    const onFiles = vi.fn();
    const { container } = renderZone({ onReject, onFiles });
    pick(container, file("virus.exe"));
    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject.mock.calls[0][0][0]).toMatchObject({ reason: "type" });
    expect(zone().getAttribute("data-state")).toBe("reject");
    expect(screen.getByText("Не удалось добавить")).toBeTruthy();
    expect(screen.getAllByText(/virus\.exe/).length).toBeGreaterThan(0);
    const note = document.querySelector(".ds-dropzone__note") as HTMLElement;
    expect(note.getAttribute("aria-live")).toBe("polite");
    expect(note.textContent).toBe("Файлы не добавлены: «virus.exe» — формат .exe");
    expect(screen.queryByText("virus.exe")).toBeNull();
  });

  it("слишком большой файл отклоняется по размеру", () => {
    const onReject = vi.fn();
    const { container } = renderZone({ onReject });
    pick(container, file("big.pdf", 2 * 1048576));
    expect(onReject.mock.calls[0][0][0]).toMatchObject({ reason: "size" });
    expect(document.querySelector(".ds-dropzone__note")?.textContent).toContain("больше 1 МБ");
  });

  it("сверх лимита: лишние отклоняются, подходящие добавляются", () => {
    const onReject = vi.fn();
    const onFiles = vi.fn();
    const { container } = renderZone({ maxFiles: 2, onReject, onFiles });
    pick(container, file("a.pdf"), file("b.pdf"), file("c.pdf"));
    expect(onFiles.mock.calls[0][0]).toHaveLength(2);
    expect(onReject.mock.calls[0][0][0]).toMatchObject({ reason: "count" });
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
  });

  it("зона сама возвращается в ожидание через 1,8 с после отказа, текст ошибки остаётся в строке", () => {
    vi.useFakeTimers();
    const { container } = renderZone();
    pick(container, file("virus.exe"));
    expect(zone().getAttribute("data-state")).toBe("reject");
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(zone().hasAttribute("data-state")).toBe(false);
    expect(document.querySelector(".ds-dropzone__note")?.textContent).toContain("virus.exe");
  });

  it("лимит заполнен: состояние full, вне Tab, aria-disabled, окно выбора не открывается", () => {
    const { container } = renderZone({
      maxFiles: 2,
      defaultFiles: [{ name: "a.pdf" }, { name: "b.pdf" }],
    });
    expect(zone().getAttribute("data-state")).toBe("full");
    expect(zone().getAttribute("tabindex")).toBe("-1");
    expect(zone().getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Загружено 2 из 2")).toBeTruthy();
    const click = vi.spyOn(picker(container), "click");
    fireEvent.click(zone());
    expect(click).not.toHaveBeenCalled();
  });

  it("disabled: состояние disabled, вне Tab, выбор и drop не работают", () => {
    const onFiles = vi.fn();
    const { container } = renderZone({ disabled: true, onFiles });
    expect(zone().getAttribute("data-state")).toBe("disabled");
    expect(zone().getAttribute("tabindex")).toBe("-1");
    expect(screen.getByText("Нет прав на загрузку")).toBeTruthy();
    const click = vi.spyOn(picker(container), "click");
    fireEvent.click(zone());
    fireEvent.drop(zone(), { dataTransfer: { files: [file("a.pdf")] } });
    expect(click).not.toHaveBeenCalled();
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("drag с подходящими файлами: состояние drag и число файлов, dragleave снимает его", () => {
    renderZone();
    fireEvent.dragEnter(zone(), { dataTransfer: { items: items("application/pdf", "image/png") } });
    expect(zone().getAttribute("data-state")).toBe("drag");
    expect(screen.getByText("Отпустите, чтобы загрузить")).toBeTruthy();
    expect(screen.getByText("Файлов: 2")).toBeTruthy();
    fireEvent.dragLeave(zone(), { relatedTarget: document.body });
    expect(zone().hasAttribute("data-state")).toBe(false);
  });

  it("drag с неподходящим типом: состояние reject и «Такой формат не подходит»", () => {
    renderZone();
    fireEvent.dragOver(zone(), { dataTransfer: { items: items("application/zip") } });
    expect(zone().getAttribute("data-state")).toBe("reject");
    expect(screen.getByText("Такой формат не подходит")).toBeTruthy();
    expect(screen.getByText("Нужны PDF, XLSX, JPG, PNG")).toBeTruthy();
  });

  it("неизвестный тип при drag считается подходящим", () => {
    renderZone();
    fireEvent.dragOver(zone(), { dataTransfer: { items: items("") } });
    expect(zone().getAttribute("data-state")).toBe("drag");
  });

  it("drop добавляет файлы той же проверкой и снимает подсветку", () => {
    const onFiles = vi.fn();
    renderZone({ onFiles });
    fireEvent.dragEnter(zone(), { dataTransfer: { items: items("application/pdf") } });
    fireEvent.drop(zone(), { dataTransfer: { files: [file("a.pdf")] } });
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(zone().hasAttribute("data-state")).toBe(false);
    expect(screen.getByText("a.pdf")).toBeTruthy();
  });

  it("drop по умолчанию отменяется, чтобы браузер не открывал файл", () => {
    renderZone();
    const notPrevented = fireEvent.drop(zone(), { dataTransfer: { files: [file("a.pdf")] } });
    expect(notPrevented).toBe(false);
  });

  it("строка файла: прогресс, имя, расширение, кнопка удаления с именем", () => {
    renderZone({ files: [{ name: "invoice.pdf", progress: 45 }] });
    const bar = screen.getByRole("progressbar", { name: "Загрузка invoice.pdf" });
    expect(bar.getAttribute("aria-valuenow")).toBe("45");
    expect(screen.getByText("45%")).toBeTruthy();
    expect(screen.getByText("PDF").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("button", { name: "Удалить файл invoice.pdf" })).toBeTruthy();
  });

  it("управляемый список: компонент сам файлы не добавляет", () => {
    const onFiles = vi.fn();
    const { container } = renderZone({ files: [], onFiles });
    pick(container, file("a.pdf"));
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("a.pdf")).toBeNull();
  });

  it("list=false не рисует список", () => {
    renderZone({ list: false, defaultFiles: [{ name: "a.pdf" }] });
    expect(screen.queryByText("a.pdf")).toBeNull();
  });

  it("удаление: onRemove, строка исчезает, объявляется «Файл удалён», фокус на следующем ×", () => {
    const onRemove = vi.fn();
    renderZone({ defaultFiles: [{ name: "a.pdf" }, { name: "b.pdf" }], onRemove });
    fireEvent.click(screen.getByRole("button", { name: "Удалить файл a.pdf" }));
    expect(onRemove).toHaveBeenCalledWith({ name: "a.pdf" }, 0);
    expect(screen.queryByText("a.pdf")).toBeNull();
    expect(document.querySelector(".ds-dropzone__note")?.textContent).toContain(
      "Файл удалён: a.pdf",
    );
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Удалить файл b.pdf" }));
  });

  it("удаление последнего файла переносит фокус на зону", () => {
    renderZone({ defaultFiles: [{ name: "a.pdf" }] });
    fireEvent.click(screen.getByRole("button", { name: "Удалить файл a.pdf" }));
    expect(document.activeElement).toBe(zone());
  });

  it("«Отменить» возвращает файл на прежнее место", () => {
    renderZone({ defaultFiles: [{ name: "a.pdf" }, { name: "b.pdf" }] });
    fireEvent.click(screen.getByRole("button", { name: "Удалить файл a.pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "Отменить" }));
    const names = [...document.querySelectorAll(".ds-dropzone__name")].map((n) => n.textContent);
    expect(names).toEqual(["a.pdf", "b.pdf"]);
  });

  it("после удаления из заполненного списка зона снова принимает файлы", () => {
    renderZone({ maxFiles: 1, defaultFiles: [{ name: "a.pdf" }] });
    expect(zone().getAttribute("data-state")).toBe("full");
    fireEvent.click(screen.getByRole("button", { name: "Удалить файл a.pdf" }));
    expect(zone().hasAttribute("data-state")).toBe(false);
  });

  it("label меняет имя зоны, className и ref относятся к обёртке", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Dropzone ref={ref} label="Вложения" className="custom" data-testid="d" />);
    expect(screen.getByRole("button", { name: "Вложения" })).toBeTruthy();
    expect(ref.current).toBe(screen.getByTestId("d"));
    expect(ref.current?.classList.contains("ds-dropzone__wrap")).toBe(true);
    expect(ref.current?.classList.contains("custom")).toBe(true);
  });

  it("сам по себе не ставит data-force", () => {
    renderZone({ defaultFiles: [{ name: "a.pdf" }] });
    expect(document.querySelector("[data-force]")).toBeNull();
  });
});
