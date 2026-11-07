/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { cx, useControlled } from "../../ui/internal";
import {
  DropzoneArea,
  DropzoneFileRow,
  zoneText,
  type DropzoneFile,
  type ZoneKind,
} from "./DropzoneParts";

export type DropzoneRejectReason = "type" | "size" | "count";

export interface DropzoneRejection {
  file: File;
  reason: DropzoneRejectReason;
  message: string;
}

export interface DropzoneProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onDrop" | "onChange" | "children" | "defaultValue"
> {
  accept?: readonly string[];
  maxSizeMb?: number;
  maxFiles?: number;
  compact?: boolean;
  cell?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  list?: boolean;
  label?: string;
  files?: DropzoneFile[];
  defaultFiles?: DropzoneFile[];
  onFiles?: (files: File[]) => void;
  onReject?: (rejections: DropzoneRejection[]) => void;
  onRemove?: (file: DropzoneFile, index: number) => void;
  onRestore?: (file: DropzoneFile, index: number) => void;
}

const MIME_HINTS: Record<string, string> = {
  pdf: "pdf",
  xlsx: "sheet|excel",
  xls: "excel",
  csv: "csv",
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  gif: "gif",
  webp: "webp",
  doc: "msword",
  docx: "wordprocessing",
  txt: "text/plain",
  zip: "zip",
};
const BYTES_IN_MB = 1048576;
const REJECT_FLASH_MS = 1800;
const NO_FILES: DropzoneFile[] = [];

const extensionOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

function typeAllowed(type: string, accept: readonly string[]) {
  if (!type) return true;
  return accept.some((ext) => {
    const hint = MIME_HINTS[ext.toLowerCase()];
    return hint ? new RegExp(hint).test(type) : true;
  });
}

function draggedTypesAllowed(event: DragEvent, accept?: readonly string[]) {
  if (!accept?.length) return true;
  const items = [...(event.dataTransfer?.items ?? [])];
  return items.every((item) => item.kind !== "file" || typeAllowed(item.type, accept));
}

let counter = 0;
const nextId = () => `dz-${++counter}`;

export function Dropzone({
  accept,
  maxSizeMb,
  maxFiles,
  compact,
  cell,
  disabled,
  disabledReason,
  list = true,
  label,
  files: filesProp,
  defaultFiles = NO_FILES,
  onFiles,
  onReject,
  onRemove,
  onRestore,
  className,
  ...rest
}: DropzoneProps) {
  const [files, setFiles] = useControlled(filesProp, defaultFiles);
  const [flash, setFlash] = useState<{
    kind: "drag" | "reject";
    dragCount?: number;
    reason?: string;
  } | null>(null);
  const [note, setNote] = useState("");
  const [undo, setUndo] = useState<{ file: DropzoneFile; index: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const refocus = useRef<number | null>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (refocus.current === null) return;
    const buttons = rows.current?.querySelectorAll<HTMLButtonElement>(".ds-dropzone__remove");
    const target = buttons?.length
      ? buttons[Math.min(refocus.current, buttons.length - 1)]
      : zone.current;
    refocus.current = null;
    target?.focus();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [files.length]);

  const full = maxFiles !== undefined && files.length >= maxFiles;
  const kind: ZoneKind = disabled ? "disabled" : (flash?.kind ?? (full ? "full" : "idle"));
  const text = zoneText(kind, {
    compact,
    accept,
    maxSizeMb,
    maxFiles,
    count: files.length,
    dragCount: flash?.dragCount,
    reason: flash?.reason,
    disabledReason,
  });

  const clearFlashLater = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), REJECT_FLASH_MS);
  };

  const add = (incoming: FileList | File[]) => {
    const rejections: DropzoneRejection[] = [];
    const accepted: File[] = [];
    for (const file of incoming) {
      const ext = extensionOf(file.name);
      const reject = (reason: DropzoneRejectReason, message: string) =>
        rejections.push({ file, reason, message: `«${file.name}» — ${message}` });
      if (accept?.length && !accept.some((a) => a.toLowerCase() === ext)) {
        reject("type", `формат .${ext}`);
      } else if (maxSizeMb !== undefined && file.size > maxSizeMb * BYTES_IN_MB) {
        reject("size", `больше ${maxSizeMb} МБ`);
      } else if (maxFiles !== undefined && files.length + accepted.length >= maxFiles) {
        reject("count", `лимит ${maxFiles} файлов`);
      } else {
        accepted.push(file);
      }
    }
    setUndo(null);
    if (accepted.length) {
      setFiles([...files, ...accepted.map((file) => ({ id: nextId(), name: file.name }))]);
      onFiles?.(accepted);
    }
    if (rejections.length) {
      setFlash({ kind: "reject", reason: rejections[0].message });
      setNote(`Файлы не добавлены: ${rejections.map((r) => r.message).join("; ")}`);
      clearFlashLater();
      onReject?.(rejections);
    } else {
      setFlash(null);
      setNote("");
    }
  };

  const openPicker = () => {
    if (!full && !disabled) input.current?.click();
  };

  const handleOver = (event: DragEvent) => {
    event.preventDefault();
    if (full || disabled) return;
    window.clearTimeout(timer.current);
    setFlash(
      draggedTypesAllowed(event, accept)
        ? { kind: "drag", dragCount: event.dataTransfer?.items?.length }
        : { kind: "reject" },
    );
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const remove = (file: DropzoneFile, index: number) => {
    setUndo({ file, index });
    setNote("");
    refocus.current = index;
    setFiles(files.filter((_, i) => i !== index));
    onRemove?.(file, index);
  };

  const restore = () => {
    if (!undo) return;
    setFiles([...files.slice(0, undo.index), undo.file, ...files.slice(undo.index)]);
    onRestore?.(undo.file, undo.index);
    setUndo(null);
  };

  return (
    <div {...rest} className={cx("ds-dropzone__wrap", className)}>
      <DropzoneArea
        ref={zone}
        kind={kind}
        compact={compact}
        cell={cell}
        text={text}
        label={label}
        onClick={openPicker}
        onKeyDown={handleKey}
        onDragEnter={handleOver}
        onDragOver={handleOver}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFlash(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (disabled || full) {
            setFlash(null);
            return;
          }
          add(event.dataTransfer.files);
        }}
      />
      <input
        ref={input}
        type="file"
        multiple={maxFiles !== 1}
        hidden
        accept={accept?.map((x) => `.${x}`).join(",")}
        onChange={(event) => {
          if (event.target.files) add(event.target.files);
          event.target.value = "";
        }}
      />
      {list && files.length ? (
        <div ref={rows} className="ds-dropzone__list">
          {files.map((file, index) => (
            <DropzoneFileRow
              key={file.id ?? `${file.name}-${index}`}
              file={file}
              onRemove={() => remove(file, index)}
            />
          ))}
        </div>
      ) : null}
      <div className="ds-dropzone__note" aria-live="polite">
        {undo ? (
          <>
            Файл удалён: {undo.file.name}
            {filesProp === undefined || onRestore ? (
              <button type="button" onClick={restore}>
                Отменить
              </button>
            ) : null}
          </>
        ) : (
          note
        )}
      </div>
    </div>
  );
}
