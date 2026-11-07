/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { DemoAvatar } from "../avatar/demo";
import { DemoBadge } from "../badge/demo";
import { BusyOverlay, Loader, LOADER_SRC, MARK_SRC, PageLoader } from "./index";
import "./loader.force.css";

export { LOADER_SRC, MARK_SRC };

export function DemoLoader({
  size,
  label = "Загружаем грузы",
  sub,
}: {
  size?: "sm" | "page";
  label?: string;
  sub?: string;
}) {
  return <Loader size={size} label={label} hint={sub} />;
}

export function DemoBusyCard({ busy }: { busy?: boolean }) {
  return (
    <div className="ds-loader-busy" aria-busy={busy || undefined}>
      <div className="ds-loader-busy__head">
        Грузы <small>пример блока, который обновляется</small>
      </div>
      <div className="ds-loader-busy__row">
        <DemoAvatar name="ООО «Дальснаб»" size="md" />
        <span style={{ flex: 1 }}>
          <b>ООО «Дальснаб»</b>
          <small>312 т · 128 грузов</small>
        </span>
        <DemoBadge tone="ok" size="sm" form="plain">
          Сверено
        </DemoBadge>
      </div>
      <div className="ds-loader-busy__row">
        <DemoAvatar name="АО «Приморье-Опт»" size="md" />
        <span style={{ flex: 1 }}>
          <b>АО «Приморье-Опт»</b>
          <small>268 т · 94 груза</small>
        </span>
        <DemoBadge tone="warn" size="sm" form="plain">
          Ждём
        </DemoBadge>
      </div>
      {busy ? <BusyOverlay label="Обновляем…" /> : null}
    </div>
  );
}

export function DemoPageLoader({ state = "off" }: { state?: "off" | "in" | "on" | "out" }) {
  return (
    <div className="ds-loader-frame">
      <div className="ds-loader-frame__app" aria-hidden="true">
        <span className="ds-loader-frame__side" />
        <span className="ds-loader-frame__page">
          <i style={{ width: "40%" }} />
          <i />
          <i style={{ width: "80%" }} />
          <i style={{ width: "60%" }} />
        </span>
      </div>
      <PageLoader
        open={state === "in" || state === "on"}
        label="Загружаем рабочее пространство"
        hint="Astronaut · Владивосток"
      />
    </div>
  );
}

export function BrandAnimation({
  src,
  file,
  title,
  note,
  width,
}: {
  src: string;
  file: string;
  title: string;
  note: string;
  width: number;
}) {
  return (
    <figure className="ds-loader-gallery" style={{ margin: 0 }}>
      <img src={src} alt="" style={{ width }} />
      <figcaption>
        <b>
          {title} · {file}
        </b>
        {note}
      </figcaption>
    </figure>
  );
}
