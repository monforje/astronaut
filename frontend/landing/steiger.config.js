import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,

  {
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },

  {
    ignores: ["src/shared/api/generated/**"],
  },

  {
    files: ["src/app/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-segmentless-slices": "off",
    },
  },
]);
