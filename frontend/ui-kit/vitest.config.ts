import { mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

/** Плагины и алиасы — из vite.config.ts; настройки тестов лежат там же (поле `test`). */
export default mergeConfig(viteConfig, {});
