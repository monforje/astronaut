/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { assetsInlineLimit: 0 },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.tsx"],
  },
});
