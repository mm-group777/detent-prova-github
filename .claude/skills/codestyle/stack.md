# Stack del progetto: profilo default

Questo profilo non sceglie la tecnologia e non impone nessuno stack. Il sistema non conosce in anticipo il linguaggio, il framework o il database di un progetto: li decide il progetto, e la skill `scaffold` li segue.

## Chi decide lo stack

In quest'ordine, la prima fonte che nomina una scelta vince.

1. Ciò che il progetto ha già scritto: la scheda e il PRD (`BRIEF.md`, `PRD.md`), le fonti di `blueprint/` (`database.yaml`, `backend.yaml`, `frontend.yaml`), le decisioni tecniche chiuse in `QUESTIONS.md` e, in un progetto adottato, ciò che il codice usa già. Se una di queste nomina una tecnologia, si usa quella, qualunque sia.
2. Se nessuna fonte dice niente, sceglie l'agente dell'Interview o, per ciò che l'Interview non ha deciso, lo scaffold: la soluzione più semplice che regge il lavoro, con gli strumenti già presenti sul computer (`factory env check` dice cosa c'è). Senza il bisogno dichiarato di più utenti insieme o di grandi volumi si parte con un database a file, senza un server da accendere.
3. Ogni scelta tecnica fatta dall'agente si annota in `CONTEXT.md` (sezione Decisioni e motivi) e nelle Scelte del riepilogo, perché la firma finale la mostra. Un vincolo del PRD o del piano firmato vince sempre su una preferenza.

## Cosa non cambia con lo stack

Qualunque sia la tecnologia, il progetto ha:

- un test runner configurato con almeno un test verde dal primo commit, e comandi di prova nudi, che il sistema lancia da solo (`pytest tests/...`, mai `source .venv/bin/activate && ...`);
- le dipendenze nell'ambiente del progetto (`.venv`, `node_modules` o l'equivalente del linguaggio), mai installate fuori;
- la ricetta dell'ambiente in `blueprint/deployment.yaml`, con comandi `derived` solo se un file del progetto li prova;
- se ha un servizio da mettere in linea, un solo `Dockerfile` alla radice che avvia il server di produzione su `0.0.0.0` e sulla porta della variabile `PORT`.

Le regole di dettaglio stanno nella skill `scaffold` e nei documenti di formato della casa Factory, non qui.

## Integrazioni MCP tipiche

| Bisogno | Server MCP |
|---|---|
| Documentazione librerie aggiornata (anti-allucinazione API) | Context7 (`@upstash/context7-mcp`), attivo di default in factory.yaml |
| Verifica visiva del frontend durante il loop | Playwright (`@playwright/mcp`), attivo di default in factory.yaml |
| Accesso a database esistente del cliente | Postgres MCP |
| Documenti e consegne | filesystem MCP puntato su cartella condivisa |

Un servizio di rilascio non si sceglie qui: il fornitore lo deduce il sistema da ciò che è collegato nelle Integrazioni.
