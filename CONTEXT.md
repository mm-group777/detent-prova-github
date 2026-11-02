# CONTEXT — detent-prova-github

Mappa del progetto per chi arriva con contesto vuoto (umano o agente).

## Cos'è questo progetto

Un repository di prova per l'integrazione GitHub di Detent: branch, pull request, check e firma prima del merge (README.md). Non contiene un'applicazione da avviare.

## Struttura

```
.
├── README.md          scopo del repository di prova
├── AGENT.md           istruzioni della fabbrica per l'agente
├── BRIEF.md           sintesi del progetto ricavata dal codice
├── CONTEXT.md         questa mappa
├── MEMORY.md          memoria operativa curata
├── PRD.md             requisiti del prodotto, in bozza
├── PROGRESS.md        piano e stato dei task
├── QUESTIONS.md       domande aperte per la persona
├── ONBOARDING.yaml    conferme richieste dopo l'adozione
├── architecture.yaml  contratto operativo della soluzione
├── project.yaml       configurazione della fabbrica per questo progetto
├── blueprint/         le 11 fonti del Project Blueprint
├── DESIGN/            solo README.md: nessuna bozza di interfaccia
├── TEST-RESULTS/      solo .gitkeep: nessun esito di collaudo
├── .factory/          stato del runner della fabbrica
└── .claude/skills/    26 skill installate dalla fabbrica
```

Non esistono cartelle di codice applicativo, test, migrazioni o infrastruttura.

## Comandi

I comandi per installare, costruire, provare e avviare il progetto stanno nella ricetta dell'ambiente in `blueprint/deployment.yaml` (schema 3). Nel progetto non è stato trovato alcun comando scritto nei file: installare, costruire, collaudare e avviare sono `not_found`; la prova è un controllo di base dichiarato come convenzione provvisoria.

## Convenzioni attive

- Le istruzioni della fabbrica in `AGENT.md` chiedono di non scrivere segreti, di usare `$TMPDIR` per i file temporanei e di non modificare gli stati firmati.
- Il flusso Git è quello dichiarato in `blueprint/git.yaml`: `main`, `dev`, prefissi `feature/` e `test/`.
- Non ci sono file di istruzioni della persona (`AGENTS.md`, `CLAUDE.md` o simili).

## Dove si aggiunge cosa

- Nuova fonte di progetto → `blueprint/`.
- Nuovo task o blocco di lavoro → `PROGRESS.md` e `blueprint/contracts/` quando il piano lo prevede.
- Nuovo codice applicativo → non esiste ancora una cartella: va deciso con la persona prima di scriverlo.

## Decisioni e motivi

| Data | Decisione | Perché |
|---|---|---|
| 2026-11-03 | Descrivere il progetto com'è: repository di prova senza codice applicativo | È quanto risulta dai file presenti |
| 2026-11-03 | Database, backend, frontend e API dichiarati assenti | Nessun file del progetto li implementa o li configura |
| 2026-11-03 | Nessuna skill di progetto proposta | I file non provano convenzioni di prova o una mappa di codice |
