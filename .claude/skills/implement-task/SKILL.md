---
name: implement-task
description: Procedura per eseguire UN singolo task del loop, dall'apertura del contesto al commit. Il runner la richiama a ogni iterazione. Usare quando viene assegnato un task con ID da PROGRESS.md.
---

# Implement-task: il cuore del loop

Ti è stato assegnato UN task. Il tuo mandato finisce con quel task.

Potresti aver già lavorato ad altri task dello stesso blocco in questa sessione, oppure partire da zero: non contarci. Ciò che ricordi è un acceleratore, non una fonte: i file di stato sono l'unica verità e possono essere cambiati da altri dopo il tuo ultimo sguardo, quindi ricontrolla il file prima di agire su un contratto o una convenzione che ricordi. Il perimetro del task corrente vale sempre da solo: quello che ti era consentito nel task precedente non ti è consentito ora.

## Come lavori

1. **Contesto.** Leggi il tuo Task Contract in `blueprint/tasks/` (obiettivo, workstream, operazioni, dipendenze, path consentiti, Evidence), il Macro Contract padre in `blueprint/contracts/`, `architecture.yaml`, le fonti Blueprint richiamate, `CONTEXT.md` e `MEMORY.md` (un aiuto, mai sopra i contratti). Un task frontend legge `frontend.yaml` (con `design_language`), `api.yaml` e la schermata in `DESIGN/` indicata dal `design_ref` della route; un task backend legge `backend.yaml`, `api.yaml` e l'eventuale `database.yaml`; un task integration li legge tutti e segue le connessioni di `architecture.yaml`. Se il prompt dice che il collaudo utente è KO, leggi prima `TEST-RESULTS/<blocco>.md`: le note della persona sono il bug report da riprodurre.
2. **Implementa** il minimo completo che soddisfa il task, rispettando la skill `codestyle` e quella della tecnologia in uso; il codice deve somigliare a quello che c'è già. Scrivere un test prima del codice è una possibilità, non un obbligo: conta che il comportamento chiesto sia provato da test. Di un fatto tecnico di cui non sei certo non andare a memoria (`$tech-research`). Un task frontend applica `playwright-e2e` per lo spec della journey e, se ha impatto visivo, `design-implement`. Lo spec della journey in `tests/system-e2e` lo modifica solo un task `integration` che lo elenca tra i suoi `allowed_paths`: lo riallinea alla vista costruita lasciando asseriti tutti gli esiti e gli status dichiarati in `architecture.yaml` (nessun esito tolto o rinominato, nessun `expect` tolto per farlo passare), e non tocca mai la fixture `system-test.ts` né la config. Gli status HTTP delle operazioni del task (`interface_operations`) sono quelli che l'OpenAPI firmata dichiara per ciascuna: vedi «Se qualcosa non va».
3. **Verifica.** Esegui `verify.command` e la suite del progetto e produci le Evidence dichiarate dal contratto. Quando il task chiude un flusso tra più istanze esegui `factory e2e audit .`; per il database applica le migrazioni su un database reale di test. Rosso: skill `debug`, mai correzioni a tentativi.
4. **Chiudi.** Rileggi il diff completo: ha fatto tutto ciò che il task chiede e niente di più, senza residui di debug o file estranei? Aggiorna `CONTEXT.md` solo se hai cambiato la struttura o preso una decisione che le sessioni future devono conoscere. Poi committa il lavoro. Lo stato della tua riga in `PROGRESS.md` lo imposta il runner dopo il verify verde; le altre righe non si toccano.

## Se qualcosa non va

- **Ambiguità o decisione di prodotto mancante:** non tirare a indovinare. Scrivi la domanda in `QUESTIONS.md` (formato nel file) sotto l'intestazione `## [APERTA] <ID del tuo task> - <data>`, mai con un numero SCF (sono le decisioni dello scaffold, non domande dei task): il runner la controlla e, senza, il tentativo non vale. Aggiungi `Impatto contratto` se la risposta può cambiare `PROGRESS.md`, Blueprint, Macro Contract o `architecture.yaml`; marca il tuo task `[!]`, committa quanto è sicuro e chiudi la sessione. Il loop prosegue sugli altri task e, quando la persona chiude la domanda, riapre il task.
- **Status HTTP diverso dall'OpenAPI:** gli status delle operazioni del tuo task (`interface_operations`) sono quelli dichiarati nell'OpenAPI firmata, e le journey di `architecture.yaml` li ripetono in `operation_statuses`. Se il comportamento giusto ne richiede un altro (per esempio un redirect dopo un modulo dove l'OpenAPI dice 200), non implementarlo e non scrivere test che lo pretendono: scrivi la domanda in `QUESTIONS.md` sotto l'intestazione del tuo task, indica in `Impatto contratto` i file da cambiare (l'OpenAPI in `blueprint/interfaces/` e `architecture.yaml`), marca il task `[!]` e chiudi la sessione.
- **Azione negata dal recinto:** non ottenere lo stesso effetto con SQL, socket, helper di sistema, processo esterno, servizio o credenziale alternativa. Scrivi in `QUESTIONS.md` (stessa intestazione, con l'ID del tuo task) azione negata, effetto richiesto e impatto sul contratto, marca il task `[!]` e ferma il lavoro bloccato. Non leggere un exit di pipeline o `tail` come successo se il recinto ha negato l'azione; non firmare gate, non toccare stato firmato e non dichiarare riuscita l'azione. Il rifiuto resta vincolante anche se il canale tecnico è accessibile.
- **Lavoro mancante nel piano:** non aggiungere task da solo: annotalo in `QUESTIONS.md` come proposta.
- **Collaudo utente KO:** riproduci ogni problema scritto nel file di esito, aggiungi il test di regressione, correggi la causa e riesegui verify e suite completa. Non cambiare l'esito nel file: sarà il runner a chiedere un nuovo collaudo.

## Divieti

- Toccare task diversi dal tuo, anche «già che ci sei».
- Cambiare `architecture.yaml` dopo l'approvazione (fa parte dell'impronta firmata), Blueprint, Macro Contract o Task Contract: la modifica invalida la firma e torna alla fase contrattuale.
- Modificare file fuori da `change_scope.allowed_paths` o in `forbidden_paths`, `DESIGN/` (è un input della persona, non il frontend di produzione) e il `project.yaml` della radice (vietato di base anche se `allowed_paths` lo elenca: per una variabile d'ambiente o un'altra impostazione scrivi la domanda in `QUESTIONS.md`).
- Aggiungere dipendenze non previste dal profilo senza annotarlo in `CONTEXT.md` con la motivazione.
