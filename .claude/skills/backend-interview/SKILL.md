---
name: backend-interview
description: Intervista tecnica per creare o ricostruire blueprint/backend.yaml con moduli, confini, interfacce, operazioni, dipendenze e test di integrazione reali. Usare per progettare un backend nuovo, documentare un backend brownfield o riallinearlo a dominio e database.
---

# Backend interview

Definire come il backend realizza gli obiettivi senza duplicare il modello di dominio o lo schema dati.

## Ricognizione

Ispezionare entrypoint, moduli, route/API, use case, repository, job, code/eventi, dipendenze esterne, gestione errori e test. Derivare i fatti dal codice e segnalare dipendenze circolari, accesso diretto al DB fuori confine e interfacce senza test. Per servizi esterni, versioni o fatti di cui non si ha conoscenza diretta usare `$tech-research`.

## Intervista

Per ogni tema proporre una risposta raccomandata con esempio e trade-off. Chiarire:

1. tecnologia e runtime vincolati;
2. moduli/capability e responsabilità esclusiva di ciascuno;
3. operazioni/use case, input, output, autorizzazione e invarianti;
4. interfacce sincrone o asincrone, contratti, errori e idempotenza;
5. accesso al database, transazioni e mapping dominio↔persistenza;
6. servizi esterni, timeout, retry, circuit breaker e fallback;
7. autenticazione, autorizzazione, audit e protezione dati;
8. concorrenza, job, code ed eventi;
9. logging, metriche, tracing e health/readiness;
10. test unitari, contract, integrazione con DB reale ed E2E strutturale.

Aggiornare `backend.yaml` dopo ogni decisione confermata. Mantenere `draft` finché moduli, operazioni e verifiche non sono coerenti con `domain.yaml`, `database.yaml` e `acceptance.yaml`.

Quando emerge una modifica strutturale, proporre l'impatto prima di cambiare il contratto. Se coinvolge dati, invocare `$database-interview`; se cambia un blocco pianificato, aggiornare Macro e Task Contract e richiedere una nuova approvazione. Concludere ricompilando il Blueprint.
