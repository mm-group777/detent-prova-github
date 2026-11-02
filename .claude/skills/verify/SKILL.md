---
name: verify
description: Come scrivere i criteri di verifica dei task, la garanzia della fabbrica. Usare durante la pianificazione per scrivere i verify e quando un verify fallisce.
---

# Verify: la garanzia della fabbrica

Il collo di bottiglia di una fabbrica di codice non è generare: è provare che funziona. Regola d'oro: **l'agente non si auto-certifica**. Il criterio di verifica è un comando che il runner esegue deterministicamente, senza avviare il prodotto, e un task è fatto solo quando esce 0.

## Scala di fiducia (usa il livello più alto ragionevole per il task)

1. `test -f` / `grep`: esiste o contiene, solo per task di setup.
2. Test unitari o di integrazione mirati (`npm test -- --run <area>`): default per la logica; un test può creare il suo database temporaneo, applicare le migrazioni e fare un giro reale insert e select.
3. Build e suite completa (`npm run build && npm test`): per task strutturali.
4. Il percorso utente reale UI, API e datastore lo prova la suite di sistema (`factory architecture test .`, nel Macro Contract finale che lo dichiara; i blocchi intermedi eseguono il ciclo di vita dell'architettura). Per progettazione e uso degli spec vedi `playwright-e2e`.

Il comando, le istanze attraversate e la suite di review stanno in `architecture.yaml → testing.review_suite`; `factory e2e audit .` controlla che journey, criteri, flow e operationId coincidano.

Per un prodotto con sola API il livello 4 è lo stesso: la suite di review (`runner: command`) sta a parte dai verify, che girano sul sorgente senza avviare il prodotto, e chiama via HTTP il servizio avviato dal collaudo. Prova almeno:

- il corpo dello stato di salute, non solo il codice 200;
- una creazione, con i campi della risposta come li dice la specifica, e dove il dominio lo prevede il rifiuto del secondo tentativo uguale;
- lo stop e lo start del servizio, con il dato creato ancora presente;
- nel log del servizio, l'assenza di un valore segreto sentinella (una stringa riconoscibile, non un segreto vero) messo nel file ambiente di prova.

La stessa ricerca del valore sentinella vale, per una pagina web, nel pacchetto costruito e in ciò che il server della pagina serve al browser.

## Scrivere un buon verify (in fase plan)

- Esce 0 = fatto, altro = non fatto. Nessuna interpretazione.
- Comando nudo (`pytest tests/…`, `npx vitest run`): il runner attiva da solo `.venv`/`venv` e `node_modules/.bin` e carica le variabili da `.env` e `project.yaml → env`. Mai `source .venv/bin/activate &&` dentro un verify.
- Specifico del task: `npm test` totale va bene solo se il task È «far passare tutta la suite». Un verify che passa sempre è peggio di nessun verify.
- Mock e stub interni solo nei test unitari e di interfaccia: un verde su mock prova la coerenza interna, non il funzionamento (`no such table` a runtime è il buco classico).
- Il verify dell'ultimo task di ogni onda dovrebbe coprire l'integrazione dell'onda, non solo l'ultimo pezzo.

## Quando un verify fallisce

Leggi l'output per intero prima di toccare codice e segui la skill `debug`.
