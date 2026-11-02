# Pattern Next.js 16 (App Router)

Riferimento sui pattern del framework. Next.js 16 è LTS attiva da ottobre 2025;
Next.js 15 è in maintenance fino a ottobre 2026.

Verifica sempre la patch corrente con `npm show next version` invece di fidarti
di un numero scritto qui: questo file invecchia, il registry no. Per API di cui
non sei certo, la doc ufficiale si legge in markdown aggiungendo `.md` all'URL
(`nextjs.org/docs/app/....md`), comodo da fetchare.

## Indice

- [Server e Client Component](#server-e-client-component)
- [Data fetching](#data-fetching)
- [Server Action](#server-action)
- [Caching (opt-in in Next 16)](#caching-opt-in-in-next-16)
- [Route handler](#route-handler)
- [proxy.ts](#proxyts)
- [Streaming e loading](#streaming-e-loading)
- [Metadata](#metadata)
- [Differenze 15 → 16](#differenze-15--16)

---

## Server e Client Component

Tutto è Server Component finché non scrivi `"use client"`. È il default giusto:
zero JS nel bundle, accesso diretto a DB e segreti, meno stato da sincronizzare.

Metti `"use client"` **il più in basso possibile nell'albero**, solo dove serve:
`useState`/`useReducer`, `useEffect`, event handler, API del browser, hook di
librerie client.

```tsx
// ❌ tutta la pagina diventa client per un bottone
"use client";
export default async function ProjectsPage() { /* ... */ }

// ✅ la pagina resta server, solo il pezzo interattivo è client
// app/(app)/projects/page.tsx  — Server Component
export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <ProjectsList projects={projects} />   {/* server */}
      <CreateProjectButton />                {/* "use client" dentro */}
    </>
  );
}
```

Regole di confine che evitano gli errori più comuni:

- Un Server Component può renderizzare un Client Component; il contrario solo
  passando il server component come `children` o prop.
- Le props che attraversano il confine devono essere serializzabili: niente
  funzioni, classi, `Date` complesse dentro strutture esotiche.
- **Un segreto letto in un Client Component finisce nel bundle.** Nessun errore
  a build time se la variabile ha il prefisso `NEXT_PUBLIC_`: da qui la regola
  di validare l'env in `config/env.ts` separando esplicitamente le variabili
  server da quelle client (vedi `examples/config/env.ts`).

## Data fetching

Nei Server Component si fa `await` diretto. Nessun `useEffect`, nessuno stato di
loading manuale.

```tsx
// features/projects/api/get-projects.ts
import "server-only";              // errore a build time se importato dal client
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function getProjects() {
  const user = await requireUser();
  return db.query.projects.findMany({
    where: (p, { eq }) => eq(p.ownerId, user.id),
    orderBy: (p, { desc }) => desc(p.createdAt),
  });
}
```

`import "server-only"` in cima a ogni file dell'API layer è la protezione più
economica che esista contro le fughe di dati: se qualcuno lo importa da un
componente client, il build fallisce invece di spedire le credenziali al
browser.

Richieste indipendenti in parallelo, altrimenti si sommano le latenze:

```tsx
const [projects, members] = await Promise.all([getProjects(), getMembers()]);
```

`params` e `searchParams` sono **Promise** (da Next 15):

```tsx
export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { projectId } = await params;
  const { tab } = await searchParams;
}
```

Lo stesso vale per `cookies()`, `headers()` e `draftMode()`: sono async.

## Server Action

Mutazioni senza route handler, con validazione, autorizzazione, gestione errori e
integrazione con `useActionState` (esempio in `examples/feature-projects/api/create-project.ts`).

Lo scheletro:

```ts
"use server";

export async function createProject(_prev: ActionState, formData: FormData) {
  const user = await requireUser();                        // 1. autorizzazione
  const parsed = createProjectSchema.safeParse(...);       // 2. validazione
  if (!parsed.success) return { errors: ... };
  const project = await db.insert(...);                    // 3. effetto
  revalidateTag("projects", "max");                        // 4. invalidazione
  redirect(`/projects/${project.id}`);                     // 5. navigazione
}
```

Quattro cose che rendono una Server Action sicura, e che è facile dimenticare
perché il codice "funziona" anche senza:

1. **Ogni action è un endpoint HTTP pubblico.** Non basta nascondere il bottone:
   l'autorizzazione va verificata dentro l'action, sempre.
2. **Valida l'input con Zod.** `formData` arriva dalla rete, non dal tuo form.
3. **Non fidarti degli ID nel payload.** Verifica che la risorsa appartenga
   all'utente corrente, non solo che l'utente sia loggato.
4. **Ritorna errori, non eccezioni**, per gli errori attesi (validazione,
   permessi): l'utente deve vedere un messaggio, non una pagina di errore.

`redirect()` funziona lanciando un'eccezione: chiamalo **fuori** da try/catch, o
il catch lo intercetta e la navigazione non avviene.

## Caching (opt-in in Next 16)

Il cambiamento concettuale più grosso rispetto a Next 14/15: **tutto è dinamico
di default**, il caching si chiede esplicitamente. Prima era il contrario, e la
sorgente numero uno di bug era dato stantio senza sapere perché.

```ts
// abilitazione in next.config.ts
export default { cacheComponents: true };
```

```tsx
async function getPublicProjects() {
  "use cache";
  cacheLife("hours");        // profilo di durata
  cacheTag("projects");      // tag per l'invalidazione mirata
  return db.query.projects.findMany({ where: isPublic });
}
```

Invalidazione dopo una mutazione: `revalidateTag("projects", "max")`. In Next 16
la firma richiede il profilo di cache come secondo argomento — se ottieni un
errore TypeScript su `revalidateTag`, è quasi sempre questo. `unstable_cache` è
in deprecazione, migra a `"use cache"`.

Regola pratica: cacha i dati **pubblici e condivisi tra utenti**. Dati
per-utente, dashboard e qualsiasi cosa dietro autenticazione di norma non si
cachano — il rischio di servire i dati di un utente a un altro supera di gran
lunga il guadagno di latenza.

## Route handler

Usali solo quando serve davvero un endpoint HTTP: webhook, integrazioni con
terze parti, API pubblica, download di file. Per le mutazioni della tua UI le
Server Action sono meno codice e più tipizzate.

```ts
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  // verifica SEMPRE la firma prima di leggere il body
}
```

## proxy.ts

In Next 16 `middleware.ts` si chiama `proxy.ts` e la funzione esportata è
`proxy`. Gira sul runtime Node (il vecchio middleware girava su Edge);
`middleware.ts` continua a funzionare ma è deprecato ed è mantenuto soprattutto
per i casi Edge.

```ts
// src/app/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session");
  if (!session && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/app/:path*"] };
```

**Il proxy è un'ottimizzazione di UX, non un controllo di sicurezza.** Controlla
la presenza di un cookie, non la sua validità: sono già stati pubblicati diversi
CVE di bypass del middleware. L'autorizzazione vera va nel layout dell'area
protetta, nelle query e nelle action — cioè vicino ai dati.

## Streaming e loading

`loading.tsx` avvolge automaticamente la route in un Suspense. Per un controllo
più fine, Suspense manuale sul pezzo lento, così il resto della pagina appare
subito:

```tsx
export default async function Page() {
  return (
    <>
      <Header />                                   {/* immediato */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />                                  {/* query lenta */}
      </Suspense>
    </>
  );
}
```

Fai skeleton che assomiglino al contenuto finale: uno spinner generico che poi
cede il posto a un layout diverso produce un salto visivo fastidioso.

## Metadata

```tsx
export const metadata: Metadata = { title: "Progetti", description: "..." };

// dinamico
export async function generateMetadata({ params }): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProject(projectId);
  return { title: project.name };
}
```

Il layout root definisce `title.template` (`"%s | Nome App"`) così le pagine
scrivono solo la loro parte.

## Differenze 15 → 16

Se il progetto è su Next 15, cambiano queste cose:

| Next 15 | Next 16 |
|---|---|
| `middleware.ts` (Edge) | `proxy.ts` (Node); middleware deprecato |
| caching di default su `fetch` | tutto dinamico, `"use cache"` opt-in |
| `unstable_cache` | `"use cache"` + `cacheLife` / `cacheTag` |
| `revalidateTag(tag)` | `revalidateTag(tag, profile)` |
| Webpack default (Turbopack opzionale) | Turbopack default (`--webpack` per tornare indietro) |
| `next lint` | rimosso: ESLint si invoca direttamente |
| Node 18.17+ | Node 20.9+ |

Upgrade: `npx @next/codemod@latest upgrade latest` copre la maggior parte delle
modifiche meccaniche; il lavoro vero è rivedere il caching, perché lì il codemod
non può indovinare l'intenzione.
