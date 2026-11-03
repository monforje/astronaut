import { docInvoice } from "@/shared/brand";
import { renderAstro } from "@/shared/lib/test-utils";
import PhotoSlot from "./PhotoSlot.astro";

const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();

describe("PhotoSlot", () => {
  it("файла ещё нет — заглушка: что снять и какой файл положить, читалке не мешает", async () => {
    const photo = { file: "trucks.jpg", todo: "Фуры с контейнерами ждут у ворот терминала." };
    const doc = await renderAstro(PhotoSlot, { props: { photo, alt: "Фуры", sizes: "20rem" } });
    const stub = doc.body.firstElementChild;
    expect(stub?.getAttribute("aria-hidden")).toBe("true");
    expect(text(stub)).toBe(
      "[TODO] фото Фуры с контейнерами ждут у ворот терминала. photos/trucks.jpg",
    );
    expect(doc.querySelector("img")).toBeNull();
  });

  it("файл на месте — фото с подписью для читалки, заглушки нет", async () => {
    const photo = { file: "trucks.jpg", todo: "Фуры у ворот терминала.", src: docInvoice };
    const doc = await renderAstro(PhotoSlot, { props: { photo, alt: "Фуры", sizes: "20rem" } });
    const img = doc.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("Фуры");
    expect(img?.getAttribute("loading")).toBe("lazy");
    expect(doc.body.textContent).not.toContain("[TODO]");
  });
});
