import { renderAstro } from "@/shared/lib/test-utils";
import JsonLd from "./JsonLd.astro";

describe("JsonLd", () => {
  it("кладёт объект в script application/ld+json, и он разбирается обратно", async () => {
    const data = { "@context": "https://schema.org", "@type": "Thing", name: "Груз" };
    const doc = await renderAstro(JsonLd, { props: { data } });
    const script = doc.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "")).toEqual(data);
  });

  it("строка с </script> не закрывает тег раньше времени", async () => {
    const data = { name: "</script><b>x</b>" };
    const doc = await renderAstro(JsonLd, { props: { data } });
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(JSON.parse(scripts[0]?.textContent ?? "")).toEqual(data);
  });
});
