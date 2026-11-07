/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { CalendarDayData } from "../calendar/Calendar";

export type ThreadMessageId = string | number;

export interface ThreadPerson {
  name: string;
  role?: string;
}

export interface ThreadFile {
  name: string;
  size: string;
}

export interface ThreadStream {
  phase: "think" | "text" | "done";
  text: string;
  liked?: boolean;
  thinking?: string;
  summary?: string;
}

export interface ThreadMessage {
  id: ThreadMessageId;
  kind?: "message" | "system" | "agent";
  author?: string;
  day: string;
  time: string;
  text: string;
  file?: ThreadFile;
  reactions?: Record<string, string[]>;
  replyTo?: ThreadMessageId;
  edited?: boolean;
  status?: "sending" | "failed";
  stream?: ThreadStream;
}

export interface ThreadDraft {
  text: string;
  replyTo?: ThreadMessageId | null;
  editing?: ThreadMessageId | null;
  file?: ThreadFile | null;
}

export interface ThreadSubmit {
  text: string;
  replyTo?: ThreadMessageId;
  editing?: ThreadMessageId;
  file?: ThreadFile;
}

export type ThreadMenu = { id: ThreadMessageId; kind: "more" | "emoji" } | null;

export type ThreadAgentAction = "copy" | "up" | "down" | "regen";

export type ThreadPart = "message" | "quote" | "reaction" | "reply" | "box" | "send" | "undo";

export interface ThreadPartContext {
  message?: ThreadMessage;
  emoji?: string;
}

export type ThreadPartData = (
  part: ThreadPart,
  context: ThreadPartContext,
) => CalendarDayData | undefined;

export interface ThreadToast {
  text: string;
  action?: string;
}

export const EMPTY_DRAFT: ThreadDraft = { text: "", replyTo: null, editing: null, file: null };
