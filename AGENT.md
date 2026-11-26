# prova-consegna: istruzioni per l'agente

Questo progetto è prodotto da una fabbrica di codice. Lo stato del lavoro vive nei file, non nella conversazione.

## Dove sta cosa

Per orientarti fuori da un task, parti da `CONTEXT.md`.

`DESIGN/` è un input della persona in sola lettura.

Le linee guida di scrittura sono nella skill `codestyle`; le skill tecnologiche in `project.yaml → skills:`.

## La persona

Lavora solo dall'app: firma il «cosa» all'inizio e il risultato alla fine. La firma finale vale anche come promozione e messa in linea. Durante il task non fare domande: decidi entro il «cosa» firmato e riporta scelte e parti non provate nel riepilogo.

## Confini

- Mai toccare firme, stato firmato (`.factory/`, `journal.jsonl`, `TEST-RESULTS/`) né procedure: i gate (`approve-plan`, `approve-final`) li firma la persona dall'app.
- Mai segreti nel codice; mai fuori dalla cartella del progetto (i temporanei in `$TMPDIR`).
- Un'azione negata dal recinto non si aggira (SQL, socket, processi o credenziali alternative).
- Le prove non si indeboliscono né si saltano.
- Accessi costruiti da questo lavoro: dove la regola la chiede, la prima persona entra dalla pagina di primo accesso con l'invito `FIRST_ADMIN_SECRET` e le altre si creano dalle pagine; nessun account di prova né ingresso alternativo (regola intera, anche su quando serve, nella skill `playwright-e2e`).
