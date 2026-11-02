import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/testing/setup.ts"],
    globals: true,
    // I test end-to-end li fa Playwright: se Vitest prova a eseguirli,
    // fallisce con errori che sembrano bug del codice e non lo sono.
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      // Nessuna soglia globale: inseguire una percentuale porta a test che
      // coprono getter banali e lasciano scoperta la logica che conta.
      reporter: ["text", "html"],
      exclude: ["**/*.config.*", "**/testing/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
