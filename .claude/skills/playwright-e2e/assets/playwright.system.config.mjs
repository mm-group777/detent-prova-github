// Configurazione Playwright della suite di sistema di un progetto ADOTTATO. Sta in .factory/system-e2e/, una cartella con il punto, ed è
// JavaScript: tsc, ESLint, Prettier, jest e vitest del cliente non la prendono, quindi adottare la fabbrica non cambia il loro esito.
// La scrive `factory sync` quando architecture.yaml dichiara una journey Playwright; non va copiata a mano nella radice del progetto.
// I percorsi di Playwright sono relativi alla cartella della configurazione: la radice del progetto si ricava da qui, così spec e
// risultati stanno dove li cerca il resto della fabbrica (tests/system-e2e, .playwright/).
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error('PLAYWRIGHT_BASE_URL deve provenire dall’environment della review suite in architecture.yaml.');
}

// La radice del progetto, con la barra finale: due cartelle sopra questo file.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));

// Tutto ciò che Playwright produce (risultati, trace, report) sta sotto .playwright/ nella radice. Mai in test-results/ o in
// playwright-report/: su macOS il disco non distingue le maiuscole, quindi test-results/ è la stessa cartella di TEST-RESULTS/ (i
// rapporti dei collaudi) e Playwright la svuota a ogni esecuzione.
const REPORT_DIR = `${ROOT}.playwright/report`;

export default defineConfig({
  testDir: `${ROOT}tests/system-e2e`,
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
  outputDir: `${ROOT}.playwright/results`,
});
