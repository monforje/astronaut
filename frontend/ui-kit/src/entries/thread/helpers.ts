/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ThreadMessage, ThreadPerson } from "./types";

export const plainText = (text: string) => text.replace(/<[^>]+>/g, "");

export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export interface TextPart {
  text: string;
  kind: "text" | "mention" | "bold";
  at: number;
}

function segments(pieces: string[], build: (piece: string, at: number) => TextPart): TextPart[] {
  let at = 0;
  const out: TextPart[] = [];
  for (const piece of pieces) {
    if (piece !== "") out.push(build(piece, at));
    at += piece.length;
  }
  return out;
}

export function splitMentions(text: string, people: ThreadPerson[]): TextPart[] {
  const names = people.map((p) => p.name).toSorted((a, b) => b.length - a.length);
  if (names.length === 0) return [{ text, kind: "text", at: 0 }];
  const escaped = names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`);
  return segments(text.split(pattern), (piece, at) => ({
    text: piece,
    kind: piece.startsWith("@") && names.includes(piece.slice(1)) ? "mention" : "text",
    at,
  }));
}

export function splitBold(text: string): TextPart[] {
  return segments(text.split(/(<b>.*?<\/b>)/), (piece, at) =>
    /^<b>.*<\/b>$/.test(piece)
      ? { text: piece.slice(3, -4), kind: "bold", at }
      : { text: plainText(piece), kind: "text", at },
  );
}

export const mentionQuery = (text: string): string | null => {
  const match = /@([^\s@]*)$/.exec(text);
  return match ? match[1] : null;
};

export function filterPeople(people: ThreadPerson[], query: string | null): ThreadPerson[] {
  if (query === null) return [];
  const q = query.toLowerCase();
  return people.filter((p) => p.name.toLowerCase().includes(q));
}

export const insertMention = (text: string, name: string) =>
  text.replace(/@([^\s@]*)$/, `@${name} `);

export function isContinuation(prev: ThreadMessage | null, message: ThreadMessage): boolean {
  return (
    !!prev &&
    prev.kind !== "system" &&
    prev.author === message.author &&
    !message.replyTo &&
    message.kind !== "agent" &&
    minutesOf(message.time) - minutesOf(prev.time) <= 5
  );
}

export function toggleReaction(
  reactions: Record<string, string[]> | undefined,
  emoji: string,
  who: string,
): Record<string, string[]> {
  const next = { ...reactions };
  const users = next[emoji] ? [...next[emoji]] : [];
  const index = users.indexOf(who);
  if (index < 0) users.push(who);
  else users.splice(index, 1);
  if (users.length) next[emoji] = users;
  else delete next[emoji];
  return next;
}
