# Stack per tipo di progetto — profilo default

La skill `scaffold` parte da qui. Il PRD può derogare; la deroga va annotata in CONTEXT.md.

| Tipo progetto | Stack | Test | Note |
|---|---|---|---|
| Web app full-stack | `frontend/`: Next.js + TypeScript + Tailwind; `backend/`: Fastify + TypeScript + Prisma + PostgreSQL | Vitest + contract test OpenAPI + Playwright | due istanze collegate da contratto tipizzato |
| API sola | Fastify + TypeScript + Prisma | Vitest + supertest + prova di sistema via HTTP + contract test OpenAPI | quando il frontend è separato o assente; la prova di sistema chiama il servizio avviato dal collaudo (skill `verify`) |
| CLI / tool | Node + TypeScript, zero framework | Vitest | dipendenze minime |
| Sito statico / landing | Astro + Tailwind | Playwright smoke | contenuti in markdown |
| Automazione / script | Node o Python (che è più naturale allo scopo) | pytest / Vitest | |

## Integrazioni MCP tipiche

| Bisogno | Server MCP |
|---|---|
| Documentazione librerie aggiornata (anti-allucinazione API) | Context7 (`@upstash/context7-mcp`) — attivo di default in factory.yaml |
| Verifica visiva del frontend durante il loop | Playwright (`@playwright/mcp`) — attivo di default in factory.yaml |
| Accesso a database esistente del cliente | Postgres MCP |
| Documenti/consegne | filesystem MCP puntato su cartella condivisa |

## Deploy di riferimento

Docker Compose per il dev locale a un comando; produzione su VPS con Docker (o piattaforma richiesta dal PRD). Nessun Kubernetes finché un PRD non lo giustifica.
