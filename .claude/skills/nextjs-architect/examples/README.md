# Esempi

Codice di riferimento. Sono **pattern, non template da ricopiare alla lettera**:
rispetta la forma (dove sta il codice, in che ordine avvengono le cose, cosa
viene validato) e adatta lo stack a quello del progetto reale. Se il progetto
usa Prisma e l'esempio usa una sintassi Drizzle-like, cambia l'accesso ai dati e
tieni la struttura.

Il commento in cima a ogni file dice dove va nel progetto.

## `config/` — configurazione

| File | Cosa mostra |
|---|---|
| `tsconfig.json` | strict + `noUncheckedIndexedAccess`, alias `@/*` |
| `eslint.config.mjs` | **i confini dell'architettura** via `import/no-restricted-paths` |
| `.prettierrc` | formattazione, plugin Tailwind |
| `next.config.ts` | `cacheComponents`, security header, build che non ignora gli errori |
| `env.ts` | validazione Zod dell'env, separazione server/client |
| `package-scripts.json` | script npm (senza `next lint`, rimosso in Next 16) + lint-staged |

`eslint.config.mjs` è il file più importante della cartella: è ciò che rende le
regole di struttura verificabili invece che opzionali.

## `feature-projects/` — una feature completa

Feature `projects` con tutti i layer. Include anche l'esempio di **Server Action
con Zod, form ed error handling**, che non è un artefatto separato: vive
naturalmente dentro la feature, in `api/create-project.ts` +
`components/create-project-form.tsx`.

| File | Cosa mostra |
|---|---|
| `schemas/project.ts` | Zod come fonte unica, tipi via `z.infer`, coercizione dei campi form |
| `types/index.ts` | tipi di dominio e `ActionState` |
| `api/get-projects.ts` | `server-only`, autorizzazione vicino ai dati, query parallele, controllo di proprietà |
| `api/create-project.ts` | Server Action: autorizzazione → validazione → effetto → `revalidateTag` → `redirect` |
| `components/projects-list.tsx` | Server Component, stato vuoto, sotto-componente privato |
| `components/create-project-form.tsx` | Client Component, `useActionState`, `useFormStatus`, errori per campo, ARIA |
| `hooks/use-project-filters.ts` | stato dei filtri nell'URL invece che in `useState` |
| `utils/budget.ts` | logica pura di dominio |
| `page.tsx.example` | il layer `app/`: come si tiene sottile una pagina |

Ordine di lettura consigliato: `schemas` → `api` → `components` → `page.tsx.example`.
È lo stesso ordine in cui conviene scrivere una feature nuova.

## `testing/` — test e CI

I file di prova portano il suffisso `.example` perché gli strumenti di prova del cliente
(vitest, jest, Playwright) non li raccolgano da `.claude/skills`: nel progetto si copiano
senza il suffisso, nel percorso indicato dal commento in cima.

| File | Cosa mostra |
|---|---|
| `vitest.config.ts` | jsdom, alias, esclusione degli E2E |
| `setup.ts` | matcher, cleanup, mock di `next/navigation` |
| `budget.test.ts.example` | unit su logica pura, factory per i dati di test, casi al confine |
| `create-project-form.test.tsx.example` | test di componente sul comportamento visibile |
| `e2e/projects.spec.ts.example` | Playwright sui percorsi critici |
| `ci.yml` | GitHub Actions: typecheck, lint, test, build, audit, E2E |
