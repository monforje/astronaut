import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://demo.astronaut.localhost";
const hostIP = process.env.E2E_HOST_IP ?? "127.0.0.1";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "./e2e-results",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    // --ignore-certificate-errors: без него Chromium не регистрирует service worker моков (MSW) на хосте с
    // сертификатом локального CA ("SSL certificate error occurred when fetching the script"), и страница не рисуется.
    launchOptions: {
      args: [
        `--host-resolver-rules=MAP *.astronaut.localhost ${hostIP}`,
        "--ignore-certificate-errors",
      ],
    },
    // Сертификат стенда подписан локальным CA (ao): в контейнере Playwright его нет в доверенных.
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
