/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useState } from "react";
import { Dropzone, DropzoneArea, DropzoneFileRow, type DropzoneFile, type ZoneKind } from "./index";
import { zoneText as baseZoneText, type ZoneText } from "./DropzoneParts";
import "./dropzone.force.css";

export type { ZoneKind, ZoneText };

export const ACCEPT = ["pdf", "xlsx", "jpg", "png"];

export function zoneText(
  kind: ZoneKind,
  o: {
    compact?: boolean;
    max?: number;
    maxMb?: number;
    count?: number;
    dragCount?: number;
    reason?: string;
  } = {},
): ZoneText {
  const { compact, max = 5, maxMb = 10, count = max, dragCount, reason } = o;
  return baseZoneText(kind, {
    compact,
    accept: ACCEPT,
    maxFiles: max,
    maxSizeMb: maxMb,
    count,
    dragCount,
    reason,
  });
}

export function DropzoneView({
  kind = "idle",
  compact,
  cell,
  text,
  force,
  still,
}: {
  kind?: ZoneKind;
  compact?: boolean;
  cell?: boolean;
  text: ZoneText;
  force?: "hover" | "focus";
  still?: boolean;
}) {
  return (
    <DropzoneArea
      kind={kind}
      compact={compact}
      cell={cell}
      text={text}
      className={still ? "ds-dropzone--still" : undefined}
      data-force={force}
    />
  );
}

export interface UploadFile {
  name: string;
  p: number;
}

export function FileRow({
  file,
  onRemove,
  removeForce,
}: {
  file: UploadFile;
  onRemove?: () => void;
  removeForce?: "hover";
}) {
  return (
    <DropzoneFileRow
      file={{ name: file.name, progress: file.p }}
      onRemove={onRemove}
      removeProps={{ "data-force": removeForce }}
    />
  );
}

export interface DropState {
  kind: ZoneKind;
  force?: "hover" | "focus";
  files: UploadFile[];
  dragCount?: number;
  reason?: string;
  note?: string;
  removeForce?: "hover";
}

export function DropzoneScene({
  state,
  compact,
  max = 5,
}: {
  state: DropState;
  compact?: boolean;
  max?: number;
}) {
  const text = zoneText(state.kind, {
    compact,
    max,
    count: state.files.length,
    dragCount: state.dragCount,
    reason: state.reason,
  });
  return (
    <div className="ds-dropzone__wrap">
      <DropzoneView kind={state.kind} compact={compact} text={text} force={state.force} still />
      {state.files.length ? (
        <div className="ds-dropzone__list">
          {state.files.map((f) => (
            <FileRow key={f.name} file={f} removeForce={state.removeForce} />
          ))}
        </div>
      ) : null}
      <div className="ds-dropzone__note" aria-live="polite">
        {state.note ?? ""}
      </div>
    </div>
  );
}

export function DemoDropzone({
  compact,
  list = true,
  max = 5,
  maxMb = 10,
  disabled,
}: {
  compact?: boolean;
  list?: boolean;
  max?: number;
  maxMb?: number;
  disabled?: boolean;
}) {
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  useEffect(() => {
    if (!files.some((f) => (f.progress ?? 100) < 100)) return;
    const timer = window.setInterval(() => {
      setFiles((current) =>
        current.map((f) =>
          (f.progress ?? 100) >= 100
            ? f
            : { ...f, progress: Math.min(100, (f.progress ?? 0) + 8 + Math.random() * 14) },
        ),
      );
    }, 140);
    return () => window.clearInterval(timer);
  }, [files]);

  return (
    <Dropzone
      accept={ACCEPT}
      maxSizeMb={maxMb}
      maxFiles={max}
      compact={compact}
      list={list}
      disabled={disabled}
      files={files}
      onFiles={(added) =>
        setFiles((current) => [
          ...current,
          ...added.map((file, i) => ({
            id: `${file.name}-${current.length + i}-${Date.now()}`,
            name: file.name,
            progress: 0,
          })),
        ])
      }
      onRemove={(_, index) => setFiles((current) => current.filter((_f, i) => i !== index))}
      onRestore={(file, index) =>
        setFiles((current) => [
          ...current.slice(0, index),
          { ...file, progress: 100 },
          ...current.slice(index),
        ])
      }
    />
  );
}
