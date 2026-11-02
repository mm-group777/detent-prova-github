# Catalogo skill Factory-AI

Pipeline Genesis (in ordine di esecuzione):

- `blueprint-interview`: intervista progressiva → fonti versionate in `blueprint/` → riepilogo in `architecture.yaml`
- `database-interview`: tecnologia, ambienti, schema, relazioni, migrazioni e test reali in `blueprint/database.yaml`
- `backend-interview`: moduli, operazioni, interfacce, dipendenze e test in `blueprint/backend.yaml`
- `frontend-interview`: analizza `DESIGN/` e definisce route, flussi, stati, dati e linguaggio visivo (`design_language`) in `blueprint/frontend.yaml`
- `bridge-frontend-backend`: allinea bisogni UI e operazioni backend tramite un contratto OpenAPI tipizzato
- `adopt-interview`: alternativa brownfield a `intake` per un progetto già adottato: ricava dal codice BRIEF, CONTEXT, PRD, le fonti `blueprint/` e `architecture.yaml` senza inventare valori, la ricetta dell'ambiente e al massimo 2 skill proposte, con le conferme per la persona in `ONBOARDING.yaml`
- `intake`: coordina l'intervista Blueprint e sintetizza `BRIEF.md`
- `prd`: brief → PRD.md (gate umano)
- `plan`: PRD → PROGRESS.md: task, onde e verify
- `prepare-human-review`: checklist di collaudo per non tecnici, con risultati attesi e controlli di file e comandi
- `macro-contract`: un contratto per blocco + un Task Contract per task, prima del gate umano
- `scaffold`: stack, skeleton, test harness, CONTEXT.md e architecture.yaml eseguibile

Loop:

- `implement-task`: esegue UN task: contesto → implementazione → verifica → chiusura
- `task-case-coverage`: i casi limite del task da coprire con test, prima del codice
- `design-implement`: sviluppo visivo UX/UI: token, shell, schermate fedeli a `DESIGN/`, stati disegnati, responsive e prova visiva nel browser
- `playwright-e2e`: spec Playwright persistenti per i criteri frontend: journey, system.* ed Evidence
- `verify`: come scrivere i criteri di verifica dei task
- `debug`: diagnosi quando un verify è rosso: riproduci → isola → causa radice → regressione
- `memory`: cura la conoscenza durevole e i candidati trasversali senza trasformare la memoria in un log

Tecnologie (si attivano da sole quando si lavora con quella tecnologia):

- `fastapi`: convenzioni di produzione FastAPI: struttura per dominio, async corretto, Pydantic v2, dipendenze come validatori, errori, test (con `references/` ed `examples/`)
- `nextjs-architect`: Next.js 16+ (App Router): architettura feature-based, confini enforce-abili via ESLint, TypeScript strict, Zod, Server Actions, testing e CI (con `references/` ed `examples/`)
- per aggiungerne una: skill `skill-generator`

Supporto e generative:

- `tech-research`: verifica un fatto tecnico su fonte primaria (context7, poi ricerca web)
- `skill-generator`: nuove skill da descrizione
- `codestyle-generator`: profili di linee guida (stile e tecnologie) da intervista
