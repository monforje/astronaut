/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ReactNode, type Ref } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { Button } from "../button";
import {
  ToastCard,
  ToastStack,
  Toaster,
  bindToast,
  createToastStore,
  type ToastEntry,
  type ToastTone,
} from "./index";
import "./toast.force.css";

export {
  Toaster,
  bindToast,
  createToastStore,
  type ToastPosition as ToastPos,
  type ToastTone,
} from "./index";
export type Force = "hover" | "active" | "focus";

export interface ToastItem {
  id: number;
  title: string;
  desc?: string;
  tone?: ToastTone;
  action?: string;
  loading?: boolean;
  icon?: IconName;
  closing?: boolean;
  actionForce?: Force;
  force?: Force;
}

export const POS_LABEL = {
  br: "Внизу справа",
  bc: "Внизу по центру",
  bl: "Внизу слева",
  tr: "Вверху справа",
  tc: "Вверху по центру",
  tl: "Вверху слева",
} as const;

function forced(force?: Force): object | undefined {
  return force ? { "data-force": force } : undefined;
}

function toEntry(item: ToastItem): ToastEntry {
  return {
    id: item.id,
    title: item.title,
    description: item.desc,
    tone: item.tone,
    loading: item.loading,
    closing: item.closing,
    icon: item.icon ? <Icon name={item.icon} /> : undefined,
    action: item.action ? { label: item.action, buttonProps: forced(item.actionForce) } : undefined,
    cardProps: forced(item.force),
  };
}

export function DemoToast({ item }: { item: Omit<ToastItem, "id"> }) {
  const entry = toEntry({ id: 0, ...item });
  return (
    <ToastCard
      title={entry.title}
      description={entry.description}
      tone={entry.tone}
      loading={entry.loading}
      icon={entry.icon}
      action={entry.action}
      {...entry.cardProps}
    />
  );
}

export function DemoToaster({
  items,
  pos = "br",
  expanded,
  onAction,
  onClose,
  onEnter,
  onLeave,
}: {
  items: ToastItem[];
  pos?: "br" | "bc" | "bl" | "tr" | "tc" | "tl";
  expanded?: boolean;
  onAction?: (id: number) => void;
  onClose?: (id: number) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}) {
  return (
    <ToastStack
      items={items.map(toEntry)}
      position={pos}
      expanded={expanded}
      onAction={onAction}
      onClose={onClose}
      onEnter={onEnter}
      onLeave={onLeave}
    />
  );
}

function useExampleToast() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [{ store, toast }] = useState(() => {
    const created = createToastStore();
    return { store: created, toast: bindToast(created) };
  });
  return { stage, setStage, store, toast };
}

export function UndoToastExample() {
  const { stage, setStage, store, toast } = useExampleToast();
  const [archived, setArchived] = useState(false);
  const id = "MSKU4821907";
  const restore = () => setArchived(false);
  return (
    <div className="ds-toast-example">
      <div className="ds-toast-example__bar">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setArchived(true);
            toast({
              title: "Груз отправлен в архив",
              description: id,
              action: { label: "Отменить", onClick: restore },
            });
          }}
        >
          В архив
        </Button>
        <span className="ds-toast-example__status" role="status">
          {id}: {archived ? "в архиве" : "в работе"}
        </span>
      </div>
      <ToastStage small stageRef={setStage}>
        <Toaster store={store} container={stage} />
      </ToastStage>
    </div>
  );
}

export function ProgressToastExample() {
  const { stage, setStage, store, toast } = useExampleToast();
  return (
    <div className="ds-toast-example">
      <div className="ds-toast-example__bar">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const id = toast({
              title: "Сверяем документы…",
              description: "128 грузов",
              loading: true,
            });
            window.setTimeout(
              () => toast.update(id, { loading: false, title: "Сверка завершена", tone: "warn" }),
              2000,
            );
          }}
        >
          Сверить документы
        </Button>
      </div>
      <ToastStage small stageRef={setStage}>
        <Toaster store={store} container={stage} />
      </ToastStage>
    </div>
  );
}

export function ToastStage({
  children,
  small,
  stageRef,
}: {
  children?: ReactNode;
  small?: boolean;
  stageRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={stageRef} className={`ds-toast-stage${small ? " ds-toast-stage--sm" : ""}`}>
      {children}
    </div>
  );
}
