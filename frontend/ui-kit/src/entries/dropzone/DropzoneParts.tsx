/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx, type IconName, Icon } from "../../ui/internal";
import "./dropzone.css";

export type ZoneKind = "idle" | "drag" | "reject" | "full" | "disabled";

export interface DropzoneFile {
  id?: string;
  name: string;
  progress?: number;
}

export interface ZoneText {
  title: string;
  hint: string;
  icon: IconName;
}

export interface ZoneTextOptions {
  compact?: boolean;
  accept?: readonly string[];
  maxSizeMb?: number;
  maxFiles?: number;
  count?: number;
  dragCount?: number;
  reason?: string;
  disabledReason?: string;
}

export function acceptLabel(accept: readonly string[]): string {
  return accept.map((x) => x.toUpperCase()).join(", ");
}

export function zoneText(kind: ZoneKind, options: ZoneTextOptions = {}): ZoneText {
  const { compact, accept, maxSizeMb, maxFiles, dragCount, reason } = options;
  const { count = maxFiles ?? 0, disabledReason = "Нет прав на загрузку" } = options;
  switch (kind) {
    case "drag":
      return {
        title: "Отпустите, чтобы загрузить",
        hint: dragCount ? `Файлов: ${dragCount}` : "Файлы готовы к загрузке",
        icon: "dl",
      };
    case "reject":
      return reason
        ? { title: "Не удалось добавить", hint: reason, icon: "alert" }
        : {
            title: "Такой формат не подходит",
            hint: accept?.length ? `Нужны ${acceptLabel(accept)}` : "Файл не подходит",
            icon: "alert",
          };
    case "full":
      return {
        title: `Загружено ${count} из ${maxFiles ?? count}`,
        hint: "Удалите файл, чтобы добавить новый",
        icon: "check",
      };
    case "disabled":
      return { title: "Недоступно", hint: disabledReason, icon: "dl" };
    default:
      return {
        title: compact ? "Перетащите или выберите файлы" : "Перетащите файлы сюда или нажмите",
        hint: [
          accept?.length ? acceptLabel(accept) : "",
          maxSizeMb ? `до ${maxSizeMb} МБ` : "",
          maxFiles ? `не более ${maxFiles}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        icon: "dl",
      };
  }
}

export interface DropzoneAreaProps extends ComponentPropsWithRef<"div"> {
  kind?: ZoneKind;
  compact?: boolean;
  cell?: boolean;
  text: ZoneText;
  label?: string;
}

export function DropzoneArea({
  kind = "idle",
  compact,
  cell,
  text,
  label = "Загрузка файлов",
  className,
  ...rest
}: DropzoneAreaProps) {
  const inactive = kind === "full" || kind === "disabled";
  return (
    <div
      {...rest}
      role="button"
      tabIndex={inactive ? -1 : 0}
      aria-label={label}
      aria-disabled={inactive || undefined}
      data-state={kind === "idle" ? undefined : kind}
      className={cx(
        "ds-dropzone",
        compact && "ds-dropzone--compact",
        cell && "ds-dropzone--cell",
        className,
      )}
    >
      <span className="ds-dropzone__tile">
        <Icon name={text.icon} size="md" />
      </span>
      <span className="ds-dropzone__text">
        <span className="ds-dropzone__title">{text.title}</span>
        <span className="ds-dropzone__hint">{text.hint}</span>
      </span>
    </div>
  );
}

export interface DropzoneFileRowProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  file: DropzoneFile;
  onRemove?: () => void;
  removeProps?: ComponentPropsWithRef<"button"> & Record<`data-${string}`, string | undefined>;
}

export function DropzoneFileRow({
  file,
  onRemove,
  removeProps,
  className,
  ...rest
}: DropzoneFileRowProps) {
  const progress = file.progress ?? 100;
  const done = progress >= 100;
  const ext = (file.name.split(".").pop() ?? "").toUpperCase().slice(0, 3);
  return (
    <div {...rest} className={cx("ds-dropzone__file", className)} data-done={done || undefined}>
      <span className="ds-dropzone__ext" aria-hidden="true">
        {ext}
      </span>
      <span className="ds-dropzone__name">{file.name}</span>
      <span className="ds-dropzone__status">
        {done ? (
          <>
            <Icon name="ok" size="sm" />
            Готово
          </>
        ) : (
          `${Math.round(progress)}%`
        )}
        <button
          type="button"
          aria-label={`Удалить файл ${file.name}`}
          {...removeProps}
          className={cx("ds-dropzone__remove", removeProps?.className)}
          onClick={onRemove}
        >
          <Icon name="x" size="sm" />
        </button>
      </span>
      <div
        className="ds-dropzone__bar"
        role="progressbar"
        aria-label={`Загрузка ${file.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="ds-dropzone__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
