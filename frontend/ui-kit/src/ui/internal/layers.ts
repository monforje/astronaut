/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useCallback, useEffect, useState } from "react";

const stack: symbol[] = [];

export function useLayer(active: boolean): () => boolean {
  const [id] = useState(() => Symbol("layer"));
  useEffect(() => {
    if (!active) return;
    stack.push(id);
    return () => {
      const index = stack.indexOf(id);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [active, id]);
  return useCallback(() => stack[stack.length - 1] === id, [id]);
}
