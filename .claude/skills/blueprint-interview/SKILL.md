---
name: blueprint-interview
description: Intervista uno sviluppatore per creare, ricostruire o aggiornare il Project Blueprint versionato in blueprint/*.yaml e compilarlo in architecture.yaml. Usare nella genesi di un progetto, su un progetto brownfield privo di Blueprint, o quando obiettivi, dominio, accettazione, deployment, sicurezza o Git devono essere chiariti.
---

# Blueprint interview

Costruire il contratto del progetto con un'intervista progressiva. Separare fatti osservati, decisioni confermate e proposte dell'AI.

## Protocollo dell'intervista

1. Ispeziona prima il repository in sola lettura (README, manifesti, codice, migrazioni, test, CI, Docker/Compose, configurazioni, l'eventuale `architecture.yaml`) e non chiedere ciò che si può verificare. Per i fatti che non conosci usa `$tech-research`: la ricerca è evidenza, la decisione resta della persona.
2. Se manca `blueprint/`, esegui `factory blueprint init .` senza sovrascrivere documenti esistenti. Dichiara se il progetto è nuovo o brownfield e riassumi i fatti già ricavati.
3. Per ogni decisione dai alla persona la risposta che raccomandi, il perché serve, un esempio concreto applicato al progetto e il principale trade-off. Se la risposta è dubbia, contraddittoria o generica, contestala con evidenze: non trasformare un dubbio in una decisione implicita.
4. Dopo ogni risposta confermata aggiorna subito il solo documento sorgente coinvolto, mantenendolo `draft`, e annota le decisioni irreversibili o costose in `blueprint/decisions/ADR-<NNN>-<slug>.md`. L'intervista si può interrompere e riprendere: all'avvio successivo leggi i file e continua dal primo campo incompleto.

## Ordine delle decisioni

Procedi in questo ordine, saltando solo ciò che il repository dimostra già:

1. `project.yaml`: problema, utenti, owner, descrizione e confini.
2. `objectives.yaml`: outcome identificati `OBJ-*`, non-obiettivi e metriche.
3. `domain.yaml`: linguaggio, attori, entità, aggregate e invarianti `INV-*`.
4. Usare `$database-interview` per `database.yaml`.
5. Usare `$backend-interview` per `backend.yaml`.
6. Usare `$frontend-interview` per `DESIGN/` e `frontend.yaml`; per progetti senza UI dichiarare esplicitamente `framework: none`.
7. Usare `$bridge-frontend-backend` per `api.yaml` e le specifiche in `blueprint/interfaces/`.
8. `acceptance.yaml`: criteri Given/When/Then `AC-*`, tracciati agli obiettivi e ai livelli di test.
9. `deployment.yaml`: ambienti, lifecycle, strategia, rollback e osservabilità. Con un ambiente `production`:
   - `GET /health` restituisce anche il commit, per esempio `{"status":"ok","commit":"<sha>"}`, letto dalla variabile d'ambiente `RELEASE_COMMIT`, che imposta l'agente del rilascio, oppure dal file `RELEASE_COMMIT` nella radice, che scrive il runner nell'esportazione (senza nessuno dei due il campo manca): il runner lo confronta con il commit firmato;
   - l'host pubblico della produzione va nel registro `external_resources` (`owner`, `access: read-only`, `hosts` con l'host preciso), altrimenti lo schema rifiuta il controllo di salute.
10. `security.yaml`: dati, accessi, segreti, audit, retention e vincoli.
11. `git.yaml`: `main`, `dev`, prefissi `feature/` e `test/`, gate di integrazione e release.

## Chiusura

Verificare che ogni obiettivo abbia criteri di accettazione, ogni invariante critica abbia un test e database/backend/deployment dichiarino verifiche reali. Presentare un riepilogo di decisioni, dubbi residui e rischi.

Solo dopo conferma esplicita della persona:

1. incrementare `project.revision` per un aggiornamento già versionato;
2. portare tutte le fonti confermate e `project.yaml` a `status: ready`;
3. eseguire `factory blueprint compile .`;
4. eseguire `factory blueprint validate . --ready`;
5. se la topologia operativa è pronta, eseguire anche `factory architecture validate . --ready`.

Non creare Macro Contract durante questa intervista: dopo il piano usare `$macro-contract`.
