// ESLint flat config. In Next.js 16 `next lint` non esiste più:
// si invoca ESLint direttamente (vedi gli script in package.json).
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

// Elenca qui le feature del progetto. Aggiungi la voce QUANDO CREI la feature:
// aggiungerle a fine progetto significa scoprire venti import illegali già scritti
// e avere la tentazione di disattivare la regola.
const FEATURES = ["auth", "projects", "billing"];

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // I confini dell'architettura. È la regola che tiene in piedi la struttura:
      // senza enforcement, dopo dieci feature ogni modifica tocca mezzo repo.
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. Nessun import trasversale tra feature.
            ...FEATURES.map((f) => ({
              target: `./src/features/${f}`,
              from: "./src/features",
              except: [`./${f}`],
            })),

            // 2. Le feature non importano dal layer app (unidirezionalità).
            { target: "./src/features", from: "./src/app" },

            // 3. Le cartelle condivise non importano da features/ né da app/.
            {
              target: [
                "./src/components",
                "./src/hooks",
                "./src/lib",
                "./src/types",
                "./src/utils",
              ],
              from: ["./src/features", "./src/app"],
            },
          ],
        },
      ],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  { ignores: [".next/**", "node_modules/**", "coverage/**", "next-env.d.ts"] },
];
