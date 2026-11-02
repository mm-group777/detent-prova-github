# Connessioni a file, collaudo E2E esistente e design: come si dichiarano

Valgono solo nei progetti adottati (`project.yaml` con `adopted: true`); in un progetto nuovo il kernel le rifiuta. Chiavi esatte: una in più o in meno è un errore duro. Il kernel verifica che i file esistano e che le dichiarazioni siano coerenti fra loro, non che siano vere: la verità sta nelle prove che citi e nella conferma della persona.

## Connessioni configurate con un file

Esempio (un'applicazione che configura database, cache e code in file di impostazioni, senza variabili d'ambiente):

```yaml
# architecture.yaml
instances:
  postgres:
    kind: database
    interface: { database: app, url_config: config/settings.py }   # al posto di url_env
  redis:
    kind: cache
    interface: { host: 127.0.0.1, port: 6379 }                     # host e porta letti in config/defaults.py
connections:
  - { from: django, to: postgres, protocol: postgresql, via_config: config/settings.py, verify: ./manage.py check }
  - { from: django, to: redis, protocol: redis, via_config: config/defaults.py, verify: nc -z 127.0.0.1 6379 }
```

```yaml
# blueprint/database.yaml (stesso file in architecture.yaml)
environments:
  development: { location: localhost, connection_config: config/settings.py }   # al posto di connection_env
connections:
  django_default: { environment: development, via_config: config/settings.py } # al posto di via_env
```

- Per ogni connessione o ambiente, una sola forma: `via_env` o `via_config`, `url_env` o `url_config`, `connection_env` o `connection_config`. Entrambe insieme sono un errore.
- Il percorso è relativo alla radice, senza `..`, e il file esiste già nel repository come file (un collegamento simbolico che esce dalla radice è rifiutato). Mai un indirizzo, un utente o una password: il contratto dice dove sta la configurazione, non cosa contiene.
- `database.yaml` e `architecture.yaml` devono dire la stessa cosa: se il Blueprint dichiara `via_config: config/settings.py`, almeno una connessione verso il database in `architecture.yaml` ha lo stesso `via_config`.
- Con `via_config` il runner non inietta nessuna variabile d'ambiente nei comandi: il progetto usa la sua configurazione. Un ambiente di review non deve elencare variabili inventate.
- Il file che scegli è quello che definisce la connessione (dove si legge l'host, la porta, il nome), con la fonte in `evidence` della voce.

## Collaudo E2E che il progetto ha già

```yaml
# architecture.yaml
testing:
  review_suite: system_e2e
  suites:
    system_e2e:
      runner: existing
      command: ./tools/run-e2e                 # il comando vero, su una riga
      instances: [web, django, postgres]
      environment: test
      specs: [web/e2e-tests/compose.test.ts, web/e2e-tests/login.test.ts]   # i file che compongono il collaudo, tracciati da Git
      journeys:
        - name: compose
          kind: system-e2e
          flow: FE-FLOW-COMPOSE
          acceptance: [AC-001]
          operations: [send-message]
          operation_statuses: { send-message: [200] }
          required_inputs: [...]                # identici al flow in blueprint/frontend.yaml
          required_actions: [...]
          expected_outcomes: [...]
          spec: web/e2e-tests/compose.test.ts   # uno dei file di specs
          path: [web, django, postgres]
          mocks: []
```

- Il comando è quello che il progetto usa per lanciare i suoi test E2E (salvo che apra un'app Electron: vedi «Suite che lancia un'app Electron»); se comincia con un percorso del repository (`./tools/run-e2e`) quel file esiste. Non va analizzato né riscritto come Playwright, e `true` o `echo` sono rifiutati.
- Ogni file di `specs` esiste ed è tracciato da Git. Non servono la configurazione Playwright di sistema (in un progetto adottato sarebbe `.factory/system-e2e/playwright.system.config.mjs`, mai nella radice), la fixture `tests/system-e2e` né `PLAYWRIGHT_BASE_URL`.
- Il contratto di copertura non cambia: ogni flow del frontend e ogni criterio `level: e2e` è attraversato da una journey, e i suoi `required_inputs`, `required_actions` ed `expected_outcomes` coincidono col flow. La journey è una dichiarazione: scegli il file che prova davvero quel flow (aprilo), e se la scelta è tua dichiaralo nella voce di `ONBOARDING.yaml`.
- Il frontend esige comunque una journey che attraversi un backend e un datastore (`path`).

## Suite che lancia un'app Electron

Una suite il cui comando apre un'app Electron (Cypress, Electron stesso: i programmi di `lanciatori-electron.yaml`, nella casa Factory) non parte nel recinto dei comandi del kernel, quindi non è mai la `review_suite`: `factory check confirm-genesis` la rifiuta se il comando la lancia, direttamente o con un livello di script (script di `package.json`, target di Makefile, script shell del progetto). Prima di scrivere `testing.review_suite` apri quel file e guarda il comando della suite e lo script che chiama.

- Scegli come `review_suite` una suite che gira nel recinto (un test runner da riga di comando, Playwright headless). Se il progetto non ne ha nessuna, non inventarla e non lasciare la `review_suite` vuota: dichiara come suite `existing` il comando `test` della ricetta e scrivi la voce `decisa-per-i-controlli` «Copertura provvisoria: ...» con la `decision` sui campi della suite, che dice chiaro che non è un E2E vero. Nei progetti con soli test Electron il comando `test` della ricetta è la `review_suite`, e la suite Electron resta nella voce «Suite lanciata dalla persona» qui sotto.
- La suite Electron non si scrive in `architecture.yaml`. Va in `ONBOARDING.yaml` come `domanda` ([onboarding-yaml.md](onboarding-yaml.md)) senza `decision`: `topic` «Suite lanciata dalla persona: <nome>», `question` col comando e il motivo (nel recinto non parte), `recommended` col comando che la persona lancia a mano e la `review_suite` scelta per il collaudo automatico, `evidence` i file che definiscono la suite, `applied_in` vuota.

## Design

`design_source.path` di `blueprint/frontend.yaml` può essere la cartella dell'interfaccia già presente (template, componenti): basta che contenga almeno un file. Non scrivere in `DESIGN/`. Per un progetto adottato l'impronta del design copre il percorso della cartella, non il suo contenuto: i lavori sull'interfaccia non invalidano il Blueprint compilato né la firma del piano.
