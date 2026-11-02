---
name: plan
description: Scompone il PRD approvato in PROGRESS.md, task atomici con dipendenze, onde e criterio di verifica eseguibile per ogni task. Gate umano sul piano. Usare dopo l'approvazione del PRD.
---

# Plan: dal PRD ai task eseguibili

Produce `PROGRESS.md`, la fonte di verità che il loop consumerà. GATE UMANO: il piano va approvato prima che il loop parta.

## Formato riga task (CONTRATTO: il runner lo parsa, non deviare)

```
- [ ] **T1.2** Titolo breve e imperativo | deps: T1.1 | verify: `comando eseguibile`
```

- Stati: `[ ]` da fare · `[/]` in corso · `[x]` fatto · `[!]` bloccato. `deps:` lista di ID separati da virgola, oppure `-`.
- `verify:` è un comando shell che esce 0 se il task è fatto; obbligatorio per ogni task di sviluppo (il runner rifiuta il piano se manca) e senza avviare il prodotto (skill `verify`).
- I task stanno sotto intestazioni `## Onda N — nome`. Dettagli opzionali in sotto-bullet SENZA checkbox. ID stabili: mai rinumerare task esistenti (il journal li referenzia).
- Alla fine di ogni onda aggiungi `### Test utente` con 2-7 prove manuali nel formato di `$prepare-human-review`: il runner le trasforma in una guida per persone non tecniche e ferma il loop in attesa di `OK`/`KO`. Le prove di un'onda usano solo funzioni delle onde fino alla sua: se il sito porta la persona verso una pagina di un'onda successiva (per esempio dopo l'accesso), quella pagina esiste già almeno in forma minima nell'onda che la raggiunge, e la prova si aspetta solo ciò che c'è.

## Come scomporre

1. Parti dai criteri di accettazione del PRD: ogni criterio è coperto da almeno un task il cui verify lo dimostra. Lo stesso vale per ciò che le fonti fissano: ogni invariante (`INV-*` di `domain.yaml`) delle entità che il blocco tocca, ogni frase di esito degli obiettivi (`outcome` in `objectives.yaml`) e ogni valore che un criterio dichiara (un limite, un conteggio, un testo) ha una prova nominata, un test che dice nel titolo cosa afferma, tra i casi coperti di un task del blocco, anche se il blocco non cambia quel codice. Non serve un task apposta: la prova entra nel task che tocca l'entità.
2. Task piccoli, dimensionati per un contesto pulito: se il piano d'attacco non sta in 5 righe, dividi; se il titolo contiene una «e», sono due task. Nei sotto-bullet indica i file da toccare quando li conosci.
3. Onda 1 = fondamenta (modelli dati, autenticazione se serve, prima pagina o endpoint funzionante end-to-end); le onde successive raggruppano task indipendenti. Ordina per rischio: il task che può invalidare il progetto va il prima possibile. Con persistenza, il task «migrazioni + seed» apre l'onda 1. Se il Blueprint dichiara un accesso e i flussi lo attraversano, l'onda 1 ha un task che lo costruisce, con la sua prova: lo scaffold non lo scrive.
4. Chiudi ogni onda con il flusso utente attraversato per intero. Lo prova la suite di sistema (flow in `blueprint/frontend.yaml`, journey `system-e2e` in `architecture.yaml`, spec in `tests/system-e2e`: vedi `frontend-interview` e `playwright-e2e`), non il verify di un task. Il verify dell'ultimo task dell'onda copre l'integrazione con test eseguibili senza avviare il prodotto.
5. Ultima onda: rifiniture, documentazione, criteri di accettazione finali del PRD come verify.

### Slice full-stack

Per ogni funzionalità che attraversa frontend e backend il contratto OpenAPI è una decisione approvata prima del loop; poi una slice verticale: un task `backend` (le `operationId` approvate e i contract test), un task `frontend` (route e componenti in `frontend/`, con un client generato o validato dalla specifica) e un task `integration` che dipende dai primi due e verifica il percorso reale browser → backend → datastore. Backend e frontend procedono in parallelo; non raggruppare prima tutto il backend e poi tutto il frontend.

### Filone visivo (UX/UI)

Se `blueprint/frontend.yaml` ha un `technology.framework` diverso da `none`, lo sviluppo visivo ha task propri: un piano che produce backend e wiring senza resa visiva è incompleto.

1. La prima onda che tocca il frontend apre con un task `design tokens + shell` (tema con i valori di `design_language`, layout e navigazione fedeli alla bozza); ogni task di schermata ne dipende.
2. Il task frontend di ogni slice cita nel sotto-bullet il file in `DESIGN/` (il `design_ref` della route): la fedeltà visiva è parte del fatto e l'esecuzione segue `design-implement`.
3. Ogni onda con UI chiude con un task di stati visivi e rifinitura: `loading`, `empty`, `error`, `success` disegnati, responsive ai breakpoint, contrasto e focus.
4. La fedeltà estetica che uno spec non cattura non è un Risultato atteso: va in un'`Evidenza` del `### Test utente`, che include sempre una prova per aprire la schermata reale accanto al file della bozza e annotare le differenze.

## Procedura

1. Leggi `PRD.md` (deve essere `Stato: approvato`), `architecture.yaml`, le fonti `blueprint/*.yaml`, `DESIGN/` in sola lettura e `CONTEXT.md`. Con un frontend usa `$frontend-interview` e, se comunica con il backend, `$bridge-frontend-backend`: route, flussi, `design_language` e contratto devono essere coerenti prima di pianificare.
2. Elenca le scelte implementative che il PRD lascia aperte (librerie, modello dati, integrazioni, trade-off) e risolvile ORA con un default per ciascuna, perché una decisione lasciata dentro un task diventa un task bloccato domani. Per i fatti che non conosci usa `$tech-research` e riassumi in `CONTEXT.md` ciò che le sessioni di sviluppo dovranno sapere. Traducile nel contratto: ogni frontend, backend, worker, CLI, database, cache, coda o servizio esterno è una `instance`; ogni `depends_on` ha una `connection` con `verify`; definisci environment, riferimenti ai segreti, lifecycle, delivery e rollback e la suite di review che copre tutte le istanze interne.
3. Scrivi `PROGRESS.md` con 3-6 onde e in testa il promemoria del formato (copia da `templates/project-state/PROGRESS.md`), poi `$macro-contract` per un Macro Contract per onda e un Task Contract per task.
4. Mostra alla persona le decisioni proposte, numero di task e onde, i 3 task più rischiosi, gli impatti database, la copertura del filone visivo e cosa NON è coperto.
5. Con l'approvazione passa a `scaffold`. A scaffold completo esegui `factory blueprint compile .`, `factory blueprint validate . --ready`, `factory e2e audit .` e `factory architecture validate . --ready`, poi fermati: la persona esegue `factory approve-plan . --note "..."` (e prima di ogni onda `factory approve-contract <ID> .` e `factory start-contract <ID> .`). Non eseguire tu i gate umani.

## Regole

- Niente task «ricerca/valuta/indaga»: il loop implementa, le decisioni si prendono qui o nel PRD.
- YAGNI: si pianifica solo ciò che serve ai criteri di accettazione del PRD. Niente task «per il futuro», niente astrazioni preventive.
