import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error('PLAYWRIGHT_BASE_URL deve provenire dall’environment della review suite in architecture.yaml.');
}

// Tutto ciò che Playwright produce (risultati, trace, report) sta sotto .playwright/. Mai in test-results/ o in
// playwright-report/ alla radice: su macOS il disco non distingue le maiuscole, quindi test-results/ è la stessa
// cartella di TEST-RESULTS/ (i rapporti dei collaudi) e Playwright la svuota a ogni esecuzione.
const REPORT_DIR = '.playwright/report';

export default defineConfig({
  testDir: './tests/system-e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never', outputFolder: REPORT_DIR }]]
    : [['list'], ['html', { open: 'never', outputFolder: REPORT_DIR }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  outputDir: '.playwright/results',
});
