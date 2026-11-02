# detent-prova-github: istruzioni per l'agente

Questo progetto è prodotto da una fabbrica di codice. Lo stato del lavoro vive nei file, non nella conversazione.

## Dove sta cosa

- `architecture.yaml`: il contratto vincolante dell'intera soluzione (istanze, dipendenze, connessioni, lifecycle, collaudo E2E).
- `CONTEXT.md`: la mappa del codice (dove sta cosa, convenzioni, decisioni). I comandi del progetto (installare, costruire, provare, avviare) stanno nella ricetta di `blueprint/deployment.yaml`.
- `MEMORY.md`: conoscenza durevole e curata, solo preferenze, correzioni e trappole; è un aiuto e non può contraddire contratti, codice o verify. Niente segreti, transcript o output grezzo.
- `PROGRESS.md`: i task e il loro stato, la fonte di verità del lavoro.
- `QUESTIONS.md`: le domande dell'agente per la persona.
- Le linee guida di scrittura sono nella skill `codestyle`; le skill tecnologiche attive sono in `project.yaml → skills:`. Il prompt del task indica la directory nativa dell'engine da cui caricarle.

## Come si lavora

- **Progetto appena nato:** le skill `intake` (con l'analisi di `DESIGN/` e il contratto frontend/backend), `prd`, `plan`, `scaffold`. Finito lo scaffold fermati: la persona registra il piano con `factory approve-plan`, tu non registri il tuo gate. Poi il loop esegue un task alla volta con la skill `implement-task`.
- **Task assegnato:** solo quel task. Con un'ambiguità o una decisione di prodotto mancante scrivi la domanda in `QUESTIONS.md` e marca il task `[!]`, senza tirare a indovinare. Se il prompt segnala un collaudo KO, parti da `TEST-RESULTS/<blocco>.md`.
- **Sessione dell'agente fuori dal loop (`factory chat --auto`):** valgono le stesse regole; per correzioni, preferenze e soluzioni verificate segui la skill `memory`.
- **Diniego del recinto:** non aggirare un'azione negata con SQL, socket, helper di sistema, processo esterno, servizio o credenziale alternativa. Scrivi in `QUESTIONS.md` l'azione negata, l'effetto richiesto e l'impatto sul contratto. Solo nel loop marca il task `[!]` e ferma il lavoro bloccato; fuori dal loop fermati senza creare stati fittizi. Una pipeline con `tail` può leggere l'uscita, ma il suo exit non cancella un diniego. Non firmare gate, non modificare stato firmato e non dichiarare riuscita l'azione. Il rifiuto resta vincolante anche se il canale tecnico è accessibile.
- Usa autonomamente tutti i tool disponibili (lettura, ricerca, scrittura, shell, sub-agent, skill, MCP, web): non fermarti al piano, implementa e verifica senza aggirare i gate umani della fabbrica.

## Confini

- `PROGRESS.md` si aggiorna solo nella riga del proprio task. `architecture.yaml` cambia soltanto durante Genesi o ripianificazione: dopo `approve-plan` è parte dell'impronta firmata, e se la topologia deve cambiare ti fermi e chiedi una nuova approvazione.
- Non modificare `.factory/plan-approval.json`, `journal.jsonl` o gli stati in `TEST-RESULTS`: appartengono al runner e alla persona, e le decisioni sono firmate. Non invocare `approve-plan` o `review` da un processo headless.
- `CONTEXT.md` si aggiorna quando cambia la struttura o si prende una decisione che le sessioni future devono conoscere.
- `DESIGN/` è un input della persona in sola lettura. Il frontend definitivo vive in `frontend/` e si costruisce con la skill `design-implement`: deve reggere il confronto visivo con la bozza, non solo funzionare.
- I file temporanei si scrivono in `$TMPDIR`, non in `/tmp`: `/tmp` è chiuso dal recinto.
