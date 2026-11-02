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

## Onda 1 - Modulo formatDuration con prova node:test

- [ ] **T1.1** Aggiunge formatDuration e la sua prova | deps: T0.4 | verify: `node --test test/duration.test.js`
  - Nessun obiettivo del Blueprint descrive questo lavoro; OBJ-001 è il più vicino perché riguarda il repository di prova.
  - Interpretazione prudente: Math.floor per i decimali; TypeError per negativi, NaN, Infinity e tipi non numerici.
  - Nessun rilascio pianificato in questo blocco.

### Test utente

- [ ] **U1.1** Prova automatica del modulo
  - Scopo: Verificare che la prova node:test passi.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita riporta zero test falliti.
  - Evidenza 1: Annotare il numero di test passati e falliti.
  - File richiesto 1: `src/duration.js`
  - File richiesto 2: `test/duration.test.js`
  - Comando 1: `node --test test/duration.test.js`
- [ ] **U1.2** Secondi sotto il minuto
  - Scopo: Verificare la formattazione dei secondi.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita mostra 45s.
  - Evidenza 1: Annotare il testo stampato.
  - File richiesto 1: `src/duration.js`
  - Comando 1: `node -e 'const {formatDuration}=require("./src/duration.js"); console.log(formatDuration(45))'`
- [ ] **U1.3** Minuti e secondi
  - Scopo: Verificare la formattazione da un minuto in su.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita mostra 2m 05s.
  - Evidenza 1: Annotare il testo stampato.
  - File richiesto 1: `src/duration.js`
  - Comando 1: `node -e 'const {formatDuration}=require("./src/duration.js"); console.log(formatDuration(125))'`
- [ ] **U1.4** Ore minuti e secondi
  - Scopo: Verificare la formattazione da un'ora in su.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita mostra 1h 02m 05s.
  - Evidenza 1: Annotare il testo stampato.
  - File richiesto 1: `src/duration.js`
  - Comando 1: `node -e 'const {formatDuration}=require("./src/duration.js"); console.log(formatDuration(3725))'`
- [ ] **U1.5** Decimali arrotondati per difetto
  - Scopo: Verificare che i decimali si arrotondino per difetto.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita mostra 59s.
  - Evidenza 1: Annotare il testo stampato.
  - File richiesto 1: `src/duration.js`
  - Comando 1: `node -e 'const {formatDuration}=require("./src/duration.js"); console.log(formatDuration(59.9))'`
- [ ] **U1.6** Valore non valido
  - Scopo: Verificare che un valore non numerico lanci TypeError.
  - Precondizione 1: Aprire un terminale nella radice del progetto.
  - Azione 1: Eseguire il comando indicato.
  - Risultato atteso 1: L'uscita mostra TypeError.
  - Evidenza 1: Annotare il testo stampato.
  - File richiesto 1: `src/duration.js`
  - Comando 1: `node -e 'const {formatDuration}=require("./src/duration.js"); try { formatDuration("abc") } catch (e) { console.log(e.constructor.name) }'`
