# BRIEF — detent-prova-github

## Cos'è

Un repository di prova per l'integrazione GitHub di Detent: serve a verificare branch, pull request, check e firma prima del merge (README.md).

## Cosa contiene oggi

- La radice con i documenti di genesi e di lavoro (`README.md`, `AGENT.md`, `MEMORY.md`, `PRD.md`, `PROGRESS.md`, `QUESTIONS.md`, `CONTEXT.md`).
- `blueprint/` con le 11 fonti del Project Blueprint.
- `DESIGN/` con il solo `README.md`: nessuna bozza di interfaccia.
- `.claude/skills/` con 26 skill installate dalla fabbrica.
- `TEST-RESULTS/` con il solo segnaposto.
- Nessun manifesto (`package.json`, `pyproject.toml`, `Makefile`), nessun codice sorgente, nessun test, nessuna configurazione di CI, nessun Dockerfile o Compose, nessun database.

## A cosa serve

Il README dichiara lo scopo: provare l'integrazione GitHub di Detent, cioè il percorso branch → pull request → check → firma → merge. Il repository è il banco di prova, non l'applicazione che viene provata.

## Utenti

Non sono nominati in nessun file: vanno confermati. Il contesto suggerisce il team Detent che collauda l'integrazione GitHub.

## Confini osservati

- Non c'è un prodotto applicativo da avviare: nessun comando di installazione, build, prova o avvio è scritto in un file del progetto.
- Non ci sono dati persistiti, interfacce utente, API o moduli backend.
- Non ci sono credenziali o valori di configurazione versionati.

## Punti aperti

- Cosa deve diventare il progetto: resta un banco di prova o deve ospitare un prodotto?
- Quali comandi, se esistono, devono installare, provare e avviare il progetto.
- Quale prova automatica copre il criterio di accettazione AC-001.
- Chi sono i responsabili del progetto e quale procedura di ripristino dei dati va documentata, se servirà.
