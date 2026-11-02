# Contratto frontend-backend

`blueprint/api.yaml` conserva ownership e compatibilità; la specifica OpenAPI conserva endpoint e tipi.

```yaml
schema_version: 1
status: ready
protocol: http
contracts:
  - id: public-http
    kind: openapi
    path: blueprint/interfaces/public.openapi.yaml
    producer: backend
    consumers: [frontend]
compatibility:
  policy: backwards-compatible
  breaking_change: human-approval
```

Regole minime della specifica OpenAPI:

- definire `info`, `paths` e un `operationId` unico per operazione;
- definire schema e descrizione per ogni response significativa;
- usare un envelope d'errore coerente e documentare i codici applicabili;
- non esporre direttamente record del database come contratto pubblico;
- rendere esplicite nullabilità, formati di date/ID e paginazione;
- documentare lo schema di autenticazione e i requisiti per operazione;
- dichiarare per ogni operazione gli status che il codice restituirà davvero: un POST che risponde con un redirect (Post/Redirect/Get) dichiara `303` o `302` con `Location`, non `200`;
- mantenere l'operazione compatibile finché consumer vecchi e nuovi convivono.

Esempio di allineamento:

```yaml
# frontend.yaml
data_requirements:
  - id: FE-DATA-001
    route: FE-ROUTE-001
    operation_id: listProjects

# backend.yaml
operations:
  - id: list-projects
    interface_operation: listProjects
```
