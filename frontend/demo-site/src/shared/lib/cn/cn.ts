/** Склейка имён классов: пустые значения отбрасываются. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
