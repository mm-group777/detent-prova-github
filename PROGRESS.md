# PROGRESS — detent-prova-github

Formato riga (contratto del runner, non deviare):
`- [ ] **ID** Titolo | deps: ID1, ID2 | verify: ` + comando tra backtick
Stati: `[ ]` da fare · `[/]` in corso · `[x]` fatto · `[!]` bloccato
Dettagli in sotto-bullet senza checkbox. Mai rinumerare ID esistenti.
Terminata la Genesi, l'utente registra personalmente l'impronta del piano con
`factory approve-plan .`; dopo quel gate l'agente può cambiare solo lo stato dei task.

## Onda 0 — Genesi (interattiva, con l'umano)

- [x] **T0.1** Intervista sull'idea → BRIEF.md (skill intake) | deps: -
- [x] **T0.2** PRD.md approvato dall'umano (skill prd) | deps: T0.1
- [x] **T0.3** Piano approvato: onde e task qui sotto (skill plan) | deps: T0.2
- [x] **T0.4** Scaffold: skeleton, test harness, CONTEXT.md e architecture.yaml ready (skill scaffold) | deps: T0.3 | verify: `test -f CONTEXT.md && factory architecture validate . --ready`

<!-- La skill plan sostituisce questa sezione con le onde reali del progetto. -->
<!-- Ogni onda di sviluppo deve terminare con (formato completo nella skill prepare-human-review):
  ### Test utente
  - [ ] **U1.1** Titolo della prova sul prodotto reale
    - Scopo: perché serve questa prova manuale
    - Precondizione 1: cosa preparare, spiegato a una persona non tecnica
    - File richiesto 1: `percorso/relativo` (solo se serve)
    - Comando 1: `comando umano` (solo se serve)
    - Azione 1: cosa aprire, compilare o cliccare, senza passaggi impliciti
    - Risultato atteso 1: un fatto osservabile, per esempio compare il titolo "Titolo esatto della schermata"
    - Evidenza 1: cosa annotare o fotografare senza dati sensibili; qui va anche ciò che giudica solo una persona (bozza, layout, colori, focus)
  I Comandi che non chiedono la persona li lancia l'agente prima di consegnare e stanno nello script e2e del blocco (skill prepare-human-review e macro-contract).
-->

## Onda 1 - Modulo slugify con la sua prova

- [ ] **T1.1** Aggiunge src/slugify.js e la sua prova node:test | deps: T0.4 | verify: `node --test test/slugify.test.js`
  - Nessun obiettivo del Blueprint descrive questo lavoro: OBJ-001 e AC-001 sono i riferimenti più vicini, non un allineamento tematico.
  - Solo file nuovi: non modificare né rinominare file esistenti, README compreso.

### Test utente

- [ ] **U1.1** Slug di un titolo normale
  - Scopo: Verificare che le parole di un titolo normale siano separate da un solo trattino.
  - Precondizione 1: Il file src/slugify.js esiste.
  - Azione 1: Esegui il comando 1 dalla radice del progetto.
  - Risultato atteso 1: L'uscita è esattamente ciao-mondo.
  - Evidenza 1: Annota l'uscita del comando.
  - File richiesto 1: `src/slugify.js`
  - Comando 1: `node -e 'const {slugify}=require("./src/slugify.js");console.log(slugify("Ciao Mondo"))'`
- [ ] **U1.2** Slug con accenti, simboli e spazi ripetuti
  - Scopo: Verificare che accenti e simboli spariscano e che gli spazi ripetuti diventino un solo trattino.
  - Precondizione 1: Il file src/slugify.js esiste.
  - Azione 1: Esegui il comando 1 dalla radice del progetto.
  - Risultato atteso 1: L'uscita è esattamente citta-perche-mondo.
  - Evidenza 1: Annota l'uscita del comando.
  - File richiesto 1: `src/slugify.js`
  - Comando 1: `node -e 'const {slugify}=require("./src/slugify.js");console.log(slugify("Città  Perché -- Mondo!!"))'`
- [ ] **U1.3** Slug di un input vuoto
  - Scopo: Verificare che un input senza lettere o cifre produca uno slug vuoto.
  - Precondizione 1: Il file src/slugify.js esiste.
  - Azione 1: Esegui il comando 1 dalla radice del progetto.
  - Risultato atteso 1: L'uscita è esattamente 0.
  - Evidenza 1: Annota l'uscita del comando.
  - File richiesto 1: `src/slugify.js`
  - Comando 1: `node -e 'const {slugify}=require("./src/slugify.js");console.log(slugify("").length)'`
- [ ] **U1.4** La prova automatica passa
  - Scopo: Verificare che la prova node:test del modulo sia verde.
  - Precondizione 1: Il file test/slugify.test.js esiste.
  - Azione 1: Esegui il comando 1 dalla radice del progetto.
  - Risultato atteso 1: Il comando termina senza errori.
  - Risultato atteso 2: Il riepilogo riporta fail 0.
  - Evidenza 1: Annota il riepilogo della prova.
  - File richiesto 1: `test/slugify.test.js`
  - Comando 1: `node --test test/slugify.test.js`
