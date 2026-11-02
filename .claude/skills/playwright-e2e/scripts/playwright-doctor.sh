#!/bin/sh
set -eu

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js non trovato" >&2
  exit 1
fi

if [ ! -f package.json ]; then
  echo "ERROR: package.json non trovato nella directory corrente" >&2
  exit 1
fi

echo "Node: $(node --version)"

if [ -x node_modules/.bin/playwright ]; then
  echo "Playwright Test: locale"
else
  echo "ERROR: node_modules/.bin/playwright non trovato; installa le dipendenze del progetto" >&2
  exit 1
fi

# Playwright deve scrivere sotto .playwright/ e mai in test-results/: su macOS coincide con TEST-RESULTS/ (i rapporti
# dei collaudi) e Playwright la svuota a ogni esecuzione. Un'avvertenza non ferma la diagnosi.
check_output_dir() {
  if ! grep -q 'outputDir' "$1"; then
    echo "ATTENZIONE: $1 non imposta outputDir: Playwright scriverebbe in test-results/, che su macOS coincide con TEST-RESULTS/. Imposta outputDir e outputFolder del report HTML sotto .playwright/ (vedi la skill playwright-e2e)." >&2
  elif grep -Eq "outputDir[[:space:]]*:[[:space:]]*['\"\`](\./)?test-results" "$1"; then
    echo "ATTENZIONE: $1 imposta outputDir in test-results/, che su macOS coincide con TEST-RESULTS/. Sposta outputDir e outputFolder del report HTML sotto .playwright/ (vedi la skill playwright-e2e)." >&2
  fi
}

config_found=false
for config in playwright.config.ts playwright.config.js playwright.config.mts playwright.config.mjs; do
  if [ -f "$config" ]; then
    echo "Config: $config"
    check_output_dir "$config"
    config_found=true
  fi
done

for config in playwright.system.config.ts playwright.system.config.js playwright.system.config.mts playwright.system.config.mjs .factory/system-e2e/playwright.system.config.mjs; do
  if [ -f "$config" ]; then
    echo "Config di sistema: $config"
    check_output_dir "$config"
  fi
done

if [ "$config_found" = false ]; then
  echo "ERROR: playwright.config non trovato" >&2
  exit 1
fi

# I percorsi di una configurazione sono relativi alla sua cartella (frontend/.playwright/ se sta in frontend/): git deve
# ignorarli a qualunque profondità, altrimenti risultati, trace e report restano file non tracciati e il controllo del
# perimetro li attribuisce al task. Un'avvertenza non ferma la diagnosi.
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  for path in .playwright/results/.last-run.json .playwright/report/index.html playwright/.auth/user.json; do
    if ! git check-ignore -q "$path" 2>/dev/null; then
      echo "ATTENZIONE: $path non è ignorato da git in $(pwd). Aggiungi al .gitignore del progetto le righe di assets/playwright.gitignore, senza ancorarle alla radice (.playwright/, playwright-report/, blob-report/, .auth/)." >&2
    fi
  done
fi

echo "Test scoperti:"
node_modules/.bin/playwright test --list
