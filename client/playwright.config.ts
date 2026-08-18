import { defineConfig } from "@playwright/test";

const browserExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  fullyParallel: false,
  outputDir: "test-results",
  reporter: "list",
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: browserExecutablePath
      ? { executablePath: browserExecutablePath }
      : undefined,
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    reuseExistingServer: true,
    timeout: 120_000,
    url: "http://127.0.0.1:4173/prix-aliments",
  },
});
