---
name: macro-contract
description: Genera o aggiorna un Macro Contract per un blocco di PROGRESS.md e un Task Contract per ogni task, allineandoli al Project Blueprint e preparando il gate umano e il branch Git. Usare dopo il piano, prima di iniziare un macro-task o quando obiettivi, scope, database o test del blocco cambiano.
---

# Macro Contract

Trasforma un blocco di sviluppo in un contratto semi-indipendente ma tracciato al progetto.

## Preflight

1. Esegui `factory blueprint validate . --ready`.
2. Leggi `architecture.yaml`, le fonti Blueprint, `PRD.md` e `PROGRESS.md`.
3. Seleziona un solo blocco non completato. Non inventare task fuori dal piano approvato.

## Macro Contract

Crea `blueprint/contracts/MC-<NNN>-<slug>.yaml` con lo schema atteso dal runner. Definisci:

- outcome osservabile e `block_id` esatto;
- riferimenti a `OBJ-*`, `AC-*` e `INV-*` esistenti; `alignment.domain_invariants` elenca gli `INV-*` di `domain.yaml` (campo `entity`) delle entità che il blocco tocca, anche se non ne cambia la regola, purché la regola sia già costruita o la costruisca un task del blocco: quella che costruisce un blocco successivo sta nel Macro Contract di quel blocco. Una lista vuota è accettata, ma lascia quelle regole senza una prova che il contratto nomini;
- include/exclude espliciti e impatto su istanze e connessioni;
- `database_impact` (migrazione, compatibilità, distruttività): qualunque modifica a schema, dati, seed o migrazione imposta `required: true`. Il blocco che cambia lo schema mette tra le sue verifiche la prova di aggiornamento (`$database-interview`), in `verification.integration` o già dentro il `migration_test` di `database.yaml`, nella cartella dei test del database che il task DB ha tra gli `allowed_paths`. Con `required: true` il collaudo lancia i comandi `verification` di `database.yaml`; con `false` no, ed è così che una migrazione dichiarata senza impatto passa senza controllo. Togliere o ricreare una colonna è `migration.destructive: true`, e il validatore la vuole con `backwards_compatible: false`;
- test structural, integration, E2E e regression; `regression` è il comando dell'intera suite del progetto, non di un file solo: è ciò che protegge le regole che il blocco non cambia;
- se la review standard include database, il Macro Contract finale richiama il punto già esistente `factory architecture test .` e la review suite predisposta usa `scripts/review.sh` come wrapper: non aggiungere i tre comandi DB nudi a `verification` prima del lifecycle e non alzare `database_impact.required` senza impatto reale. Con `testing.independent_test.enabled: true`, il trusted Test segue il proprio contratto e non usa `suite.command`: non presentare il wrapper standard come prova DB trusted, né disattivare o modificare il Test indipendente per applicare la ricetta;
- i Comandi del Test utente che non chiedono la persona stanno in un solo script che avvia ciò che serve (con il `lifecycle` di `architecture.yaml`), li lancia nell'ordine del Test utente e ferma tutto, anche se uno fallisce; lo script può girare più volte di seguito con lo stesso esito. Lo script è una voce di `verification.e2e` (un elenco di comandi di shell, non un verify di task): a blocco verde lo lancia il collaudo, e un comando che non parte ferma il blocco prima della persona. Se lo scrive un task, il suo percorso è tra gli `allowed_paths` di quel task;
- branch `feature/<slug>` o `test/<slug>`.

Se manca un'informazione, chiedila alla persona. Per un impatto dati usa `$database-interview` prima di dichiarare il contratto `ready`.

## Task Contract

Per ogni riga task del blocco crea `blueprint/tasks/<TASK-ID>.yaml`:

- `parent` uguale al Macro Contract; `progress_task_id`, dipendenze e `verify.command` identici a `PROGRESS.md`; obiettivo concreto e allineamento come sottoinsieme del Macro Contract.
- `allowed_paths` minimi e `forbidden_paths` espliciti. Il runner confronta ogni voce così com'è con il percorso intero del file toccato (`*` un livello, `**` più livelli, `?` un carattere, niente graffe): una cartella si scrive `src/calendar/**`, mai `src/calendar`; per alternative una voce per ognuna (`src/*.ts` e `src/*.tsx`). Un percorso vietato vince sull'ammesso: `forbidden_paths` non copre cartelle ammesse né `PROGRESS.md`, `CONTEXT.md` e `QUESTIONS.md`, che il task aggiorna da sé.
- I percorsi ammessi comprendono la cartella delle prove dell'entità che il task tocca (per esempio `tests/calendar/**`), non il solo file di prova del task: chi aggiunge la prova nominata di una regola che il blocco non cambia deve poterla scrivere accanto alle altre. Resta un perimetro stretto: la cartella di quell'entità, non tutte le prove del progetto.
- Oltre alla cartella con `/**`, elenca anche i file principali che il task prevede di creare o modificare, come voci in più nella stessa cartella (`src/calendar/**` più `src/calendar/slots.ts`): non allargano il perimetro, servono a chi prepara il contesto del task per trovare i file giusti. La cartella resta obbligatoria, perché senza di essa il task esce dal perimetro appena tocca un file vicino.
- `alignment.domain_invariants` riporta gli `INV-*` del Macro Contract che il task prova con un test nominato (un sottoinsieme del padre).
- Se il progetto ha la mappa del codice (`graphify-out/`), prima di fissare `allowed_paths` interrogala con `factory grafo cerca <parole>` e `factory grafo vicini <file>`, e cerca per nome anche chi sta dall'altra parte del confine (chi lancia il comando, la pagina che chiama la rotta, chi usa la tabella).
- Nell'`objective` scrivi in forma letterale i comandi CLI, le rotte HTTP (metodo e percorso), i canali IPC e le tabelle che il task tocca: la sezione di mappa del task parte da questi nomi e attraversa con essi il confine fra programmi.
- Evidence solo `test-report`, `commit-sha` o `file:<path>`, almeno test e commit. Un `file:<path>` è un riepilogo tracciato dentro `allowed_paths` del task: il runner conta solo i file che git vede come creati o modificati dal task, quindi mai sotto cartelle ignorate (`coverage/`, `.playwright/`, `playwright-report/`, `.venv/`) né in `TEST-RESULTS/`, che è vietata. Il report grezzo di una suite resta dov'è e l'Evidence è un riepilogo con esito, comando e data.
- `schema_version: 2`, `workstream` (`backend`, `frontend`, `integration`, `database` o `platform`) e le `interface_operations` OpenAPI coinvolte; `DESIGN/**` sempre nei `forbidden_paths` (la bozza è della persona); mai `project.yaml` della radice in `allowed_paths`, nemmeno coperto da `**` (è vietato di base a ogni task).
- Lo schema è chiuso e una chiave in più è un errore duro: `schema_version`, `id`, `parent`, `progress_task_id`, `status`, `title`, `objective`, `workstream`, `interface_operations`, `alignment`, `dependencies`, `change_scope`, `verify`. Non inventare campi come `notes` o `design_ref`: il riferimento visivo e le note vivono nei sotto-bullet del task in `PROGRESS.md` o in commenti YAML (`#`).
- Il task `integration` che chiude una journey del blocco ha tra gli `allowed_paths` lo spec di quella journey: il file (per esempio `tests/system-e2e/prenota.spec.ts`), mai la cartella `tests/system-e2e/**`, mai la fixture `tests/system-e2e/system-test.ts` né la config Playwright. Lo spec lo scrive la nascita del progetto dalla bozza, prima che esistano le viste, e nessun altro task del blocco lo ha tra gli `allowed_paths`: l'`objective` dell'integration dice di riallinearlo alla vista costruita (controlli e testi letti dalla vista, regola in `playwright-e2e`) mantenendo asseriti tutti gli input, le azioni, gli esiti (`expected_outcomes`) e gli status (`operation_statuses`) che `architecture.yaml` dichiara per quella journey. Nessun esito tolto o rinominato, nessun `expect` tolto per far passare lo spec. Il controllo non è la parola dell'agente: la fixture del collaudo rende rossi un esito dichiarato e non asserito e uno asserito e non dichiarato, e uno status fuori da `operation_statuses`.

L'unione dei Task Contract dello stesso blocco copre ogni obiettivo, criterio di accettazione e invariante del Macro Contract: nessun requisito resta orfano, e `factory check approve-contract` lo controlla prima della firma. Un task DB include migrazione e test reale. In una slice full-stack il task `integration` dipende dai task `backend` e `frontend`, riferisce almeno una `interface_operation` e verifica il percorso browser → backend → datastore con lo spec e la journey di `playwright-e2e`, e riallinea lo spec alla vista costruita nei limiti del punto sull'`integration` qui sopra.

## Gate

1. `factory blueprint compile .` e `factory blueprint validate . --ready`.
2. Mostra outcome, esclusioni, impatti DB e architettura, test e branch.
3. Fermati: la persona esegue `factory approve-contract <ID> . --note "..."`. Non eseguire i gate umani e non promuovere `dev` in `main`.

Qualunque modifica a Blueprint, Macro Contract o Task Contract invalida l'approvazione e richiede nuova compilazione e firma.
