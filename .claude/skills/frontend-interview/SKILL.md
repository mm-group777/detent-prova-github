---
name: frontend-interview
description: Analizzare una bozza HTML o un progetto frontend/full-stack in DESIGN e creare o aggiornare blueprint/frontend.yaml con tecnologia target, route, flussi, componenti, stati UI e requisiti dati. Usare durante la Genesi, quando si aggiunge un frontend a un progetto backend già avviato, quando DESIGN cambia o quando il contratto frontend deve essere riallineato.
---

# Frontend interview

Trasformare `DESIGN/` in un contratto verificabile per il frontend definitivo senza trattare la bozza come codice di produzione.

## Preflight

1. Leggere `architecture.yaml`, `PRD.md`, `blueprint/objectives.yaml`, `blueprint/domain.yaml`, `blueprint/acceptance.yaml` e l'eventuale frontend esistente.
2. Se mancano `DESIGN/` o `blueprint/frontend.yaml` in un progetto Factory-AI esistente, eseguire `factory sync .`; non sovrascrivere file già presenti.
3. Ispezionare `DESIGN/` in sola lettura: manifesti, entrypoint, route, componenti, CSS, token, asset e note. Ignorare `node_modules`, cache e output di build.
4. Non installare dipendenze né eseguire script della bozza prima di averne verificato manifesti e comandi. Aprire direttamente HTML statico; usare Playwright per una preview framework solo quando l'avvio è sicuro.
5. Se il progetto richiede un frontend ma `DESIGN/` contiene soltanto il README gestito, fermarsi e chiedere la bozza alla persona.

## Analisi

Separare sempre:

- fatti osservati nella bozza;
- intenzioni deducibili ma non certe;
- decisioni necessarie per il prodotto reale.

Ricostruire route, gerarchia visuale, navigazione, azioni, responsive, accessibilità e stati `loading`, `empty`, `error`, `success`. Non inventare un endpoint: registrare in `data_requirements` soltanto il bisogno informativo della route.

Per ogni flow ricostruire anche i criteri di accettazione attraversati, le operazioni API necessarie, tutti i campi/input compilati, i controlli azionati e gli esiti osservabili. I criteri user-visible del flow devono dichiarare `level: e2e` in `blueprint/acceptance.yaml`; `flows[].acceptance`, `flows[].operations`, `flows[].required_inputs`, `flows[].required_actions` e `flows[].expected_outcomes` sono il contratto verificabile copiato nella journey di `architecture.yaml`, non testo descrittivo. La journey aggiunge `operation_statuses` per distinguere happy path e 4xx controllati usando soltanto response dichiarate dall'OpenAPI. Per un modulo con Post/Redirect/Get lo status di successo è il redirect dichiarato dall'OpenAPI (`303` o `302`), mai `200`. `required_inputs` può essere `[]` per un flow senza form; azioni ed esiti non possono essere vuoti.

Estrarre il linguaggio visivo della bozza — palette, tipografia, scala di spaziatura, raggi e ombre, layout portante, componenti ricorrenti, breakpoint — e registrarlo in `design_language` con i valori osservati, non idealizzati. Collegare ogni route al file della bozza che la mostra tramite `design_ref`: è il riferimento che i task di sviluppo visivo useranno per la fedeltà.

Trattare il framework della bozza come evidenza, non come vincolo. Scegliere la tecnologia target da PRD, profilo e architettura; se diverge dalla bozza, spiegare il motivo e registrarlo in `CONTEXT.md` durante lo scaffold. Per versioni, compatibilità o fatti di cui non si ha conoscenza diretta usare `$tech-research`.

## Contratto frontend

Leggere [references/frontend-blueprint.md](references/frontend-blueprint.md), quindi aggiornare `blueprint/frontend.yaml` dopo ogni decisione confermata. Usare ID stabili `FE-ROUTE-*`, `FE-FLOW-*` e `FE-DATA-*`.

Mantenere `status: draft` finché:

- tecnologia e strategia di rendering sono definite;
- ogni flusso riferisce route reali;
- ogni flusso riferisce criteri `level: e2e` e le `operationId` reali coinvolte (lista vuota solo se il flow non comunica con API);
- ogni route dichiara gli stati osservabili;
- il linguaggio visivo è registrato in `design_language` e ogni route con una schermata nella bozza dichiara `design_ref`;
- ogni bisogno dati ha route, scopo e direzione;
- test componenti, visuali e accessibilità hanno comandi reali o una scelta esplicita.

Per un progetto senza UI dichiarare `technology.framework: none`, liste vuote e verifiche `not-applicable`.

## Chiusura

1. Se esistono requisiti dati, usare `$bridge-frontend-backend` prima di dichiarare il Blueprint pronto.
2. Eseguire `factory blueprint compile .` e `factory blueprint validate .`.
3. Mostrare route, flussi, divergenze dalla bozza, dati mancanti e rischi visuali.
4. Portare la fonte a `ready` soltanto dopo conferma esplicita.
5. Non modificare mai `DESIGN/`. Se DESIGN cambia dopo un'approvazione, ricompilare, ripianificare e richiedere nuovamente i gate umani.
