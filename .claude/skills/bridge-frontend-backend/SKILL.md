---
name: bridge-frontend-backend
description: Progettare e mantenere il contratto di comunicazione tra frontend e backend usando blueprint/api.yaml e una specifica OpenAPI tipizzata, allineando requisiti dati UI, operazioni backend, autenticazione, errori e compatibilità. Usare dopo frontend-interview/backend-interview, quando si aggiunge o cambia un endpoint, quando frontend e backend non concordano sui dati o quando si aggiunge un frontend a un progetto backend esistente.
---

# Bridge frontend-backend

Definire un unico seam contrattuale consumato da entrambi i lati. Non duplicare manualmente request, response o DTO nel Blueprint.

## Preflight

1. Leggere `blueprint/frontend.yaml`, `blueprint/backend.yaml`, `blueprint/domain.yaml`, `blueprint/database.yaml`, `blueprint/acceptance.yaml` e `architecture.yaml`.
2. Rifiutare fonti ancora contraddittorie: chiarire prima ownership, autorizzazione e invarianti.
3. Elencare ogni `data_requirement` del frontend e l'operazione backend che può produrlo o consumarlo.
4. Per un progetto esistente, ricostruire route, handler, DTO e client correnti prima di proporre modifiche; distinguere il comportamento osservato dal contratto desiderato.

## Contratto canonico

Leggere [references/api-contract.md](references/api-contract.md). Creare la specifica in `blueprint/interfaces/<nome>.openapi.yaml` e registrarla in `blueprint/api.yaml` con produttore e consumatori.

Usare `operationId` stabili. Descrivere request, response, errori, autenticazione, autorizzazione, nullabilità, date, ID, paginazione, idempotenza e codici HTTP. Riferire schemi condivisi con `$ref`; non mantenere una seconda descrizione degli stessi payload in `frontend.yaml` o `backend.yaml`. Un modulo HTML con Post/Redirect/Get (il POST risponde con un redirect) dichiara nelle response il redirect vero, `303` o `302` con l'header `Location`, mai `200`: la pagina che mostra l'esito è un'altra operazione, di norma un GET. La journey ripete lo stesso status in `operation_statuses` (`frontend-interview`).

Aggiornare:

- `frontend.data_requirements[].operation_id` per il consumatore;
- `backend.operations[].interface_operation` per il produttore;
- `api.contracts[]` per percorso, protocollo e ownership.

Il frontend deve generare o validare il proprio client dalla specifica. Il backend deve eseguire contract test su request e response della stessa specifica. Scegliere gli strumenti concreti durante scaffold in base allo stack.

## Compatibilità

Considerare breaking almeno: rimozione o rinomina di campi, nuova obbligatorietà, cambio tipo/formato, riduzione degli status supportati e mutamento dell'autorizzazione. Presentare sempre diff, consumer impattati e strategia di migrazione prima di modificare un contratto `ready`.

Supportare inizialmente `protocol: http` con OpenAPI oppure `protocol: none`. Per GraphQL, eventi o code fermarsi e proporre un'estensione esplicita del Blueprint: non mascherarla come HTTP. Per specifiche di servizi esterni o fatti di cui non si ha conoscenza diretta usare `$tech-research`.

## Chiusura

1. Verificare che ogni requisito dati riferisca route, `operationId` OpenAPI e operazione backend esistenti.
2. Verificare che ogni operazione sia coperta da almeno un contract test backend e da un test del client o componente frontend.
3. Eseguire `factory blueprint compile .` e `factory blueprint validate . --ready` quando tutte le fonti sono confermate.
4. Passare a `$plan`: il contratto è una decisione approvata, mentre implementazione backend, frontend e integrazione diventano task distinti.
5. Se il progetto era già approvato, segnalare che la nuova impronta invalida piano e Macro Contract precedenti; non aggirare i gate umani.
