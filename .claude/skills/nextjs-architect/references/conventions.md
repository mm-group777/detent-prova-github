# Convenzioni

Naming, TypeScript, gestione errori, sicurezza, performance, env, git.

## Indice

- [Naming](#naming)
- [TypeScript](#typescript)
- [Componenti](#componenti)
- [Gestione errori](#gestione-errori)
- [Sicurezza](#sicurezza)
- [Performance](#performance)
- [Variabili d'ambiente](#variabili-dambiente)
- [Git e commit](#git-e-commit)

---

## Naming

| Elemento | Convenzione | Esempio |
|---|---|---|
| File e cartelle | kebab-case | `create-project-form.tsx` |
| Componenti React | PascalCase | `CreateProjectForm` |
| Hook | camelCase con `use` | `useProjectFilters` |
| Funzioni e variabili | camelCase | `getProjects` |
| Costanti globali | SCREAMING_SNAKE | `MAX_UPLOAD_SIZE` |
| Tipi e interfacce | PascalCase, senza prefisso `I` | `Project`, non `IProject` |
| Schema Zod | camelCase con `Schema` | `createProjectSchema` |
| File di test | `*.test.ts(x)` accanto al sorgente | `budget.test.ts` |

Kebab-case per i file evita una classe intera di bug: macOS e Windows non
distinguono maiuscole e minuscole nei nomi file, Linux sì, e la CI gira su
Linux. `Button.tsx` importato come `button.tsx` funziona sul portatile e rompe
in CI.

Nomi delle funzioni dell'API layer: `get-*` per la lettura singola o multipla,
`create-* / update-* / delete-*` per le mutazioni. Un file per funzione: si
trovano con la ricerca per nome file e i diff restano leggibili.

## TypeScript

`strict: true` sempre. Config completa in `examples/config/tsconfig.json`.

**`any` è vietato**, incluso quello implicito. Le alternative:

- non sai il tipo → `unknown` + validazione Zod (che restringe il tipo per te)
- tipo generico → parametro di tipo `<T>`
- libreria non tipizzata → dichiara il tipo minimo che ti serve in `types/`

Un `any` non è solo un tipo mancante: spegne il type checking a valle, quindi
gli errori spuntano tre file più in là dove nessuno li collega alla causa.

**I tipi si derivano dagli schema, non si scrivono due volte:**

```ts
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  budget: z.number().positive().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

Con una sola fonte, cambiare lo schema fa fallire il type check nei punti da
aggiornare. Con due, il tipo mente in silenzio.

Preferisci `type` a `interface` salvo quando serve il merging delle
dichiarazioni. Evita gli enum di TypeScript (generano runtime code e hanno
semantiche sorprendenti): usa union di stringhe o `as const`.

## Componenti

Un componente per file, con export nominato.

```tsx
type ProjectCardProps = {
  project: Project;
  onSelect?: (id: string) => void;
};

export function ProjectCard({ project, onSelect }: ProjectCardProps) { }
```

Ordine dentro il file: tipi → componente → sotto-componenti privati → helper.

Oltre ~150 righe, un componente sta quasi certamente facendo due cose. Estrai la
logica in un hook o dividi la UI in sotto-componenti.

Props: destrutturate nella firma, con i default lì. Evita lo spread `{...props}`
non tipizzato, che nasconde cosa il componente riceve davvero.

## Gestione errori

Distingui **errori attesi** (validazione, permessi, risorsa inesistente) da
**errori inattesi** (bug, DB giù). Sono due mondi con due trattamenti.

Attesi → valore di ritorno, gestito nella UI:

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```

Inattesi → lascia propagare, li prende l'error boundary e vanno al servizio di
tracking. Non seppellirli in un `catch` che logga e continua: un errore
silenziato è un bug che si manifesterà più tardi e più lontano.

```tsx
// app/error.tsx — deve essere client component
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { logError(error); }, [error]);
  return <ErrorState onRetry={reset} />;
}
```

Un `error.tsx` a livello di route group evita che un errore in una sezione
faccia sparire tutta l'app.

**Mai esporre messaggi di errore interni all'utente.** Stack trace e messaggi
del DB rivelano struttura e a volte dati. Messaggio generico all'utente,
dettaglio nei log.

## Sicurezza

- **Autorizzazione vicino ai dati**, non solo nel proxy o nella UI. Ogni query e
  ogni action verifica l'utente corrente e la proprietà della risorsa.
- **Valida ogni input esterno con Zod**: form, `formData` delle action, body dei
  route handler, risposte di API di terzi, env. "Esterno" significa: non l'ha
  scritto il tuo codice.
- **`import "server-only"`** in cima ai file che toccano DB, segreti o
  autenticazione.
- **Segreti solo lato server.** `NEXT_PUBLIC_*` è pubblico per definizione:
  finisce nel bundle JavaScript e chiunque lo legge.
- **Verifica la firma dei webhook** prima di leggere il body.
- **Rate limiting** su action e route handler sensibili (login, registrazione,
  reset password, invii email).
- **Query parametrizzate** — l'ORM lo fa; se scrivi SQL raw, usa i placeholder.
- **Non loggare dati personali o segreti.** I log finiscono in servizi terzi e
  restano per mesi.
- Tieni aggiornato Next: nel 2026 sono usciti diversi CVE che riguardano bypass
  di middleware/proxy e SSRF. `npm audit` in CI.

## Performance

L'ordine conta: la prima voce vale più delle altre messe insieme.

1. **Meno JavaScript al client.** Server Component di default, `"use client"`
   sulle foglie. È la leva più efficace dell'App Router.
2. **Immagini con `next/image`**, sempre `width`/`height` (o `fill` con un
   contenitore dimensionato) per non generare layout shift. `priority` solo
   sull'immagine sopra la piega.
3. **Font con `next/font`**: self-hosted, niente richiesta esterna bloccante,
   niente flash di testo.
4. **Parallelizza le richieste indipendenti** con `Promise.all`; usa Suspense
   per non far aspettare tutta la pagina per il pezzo lento.
5. **Attenzione alle query N+1** nei loop: caricale in blocco.
6. `dynamic()` per i componenti pesanti sotto la piega (editor, grafici, mappe).
7. Misura prima di ottimizzare: `@next/bundle-analyzer` e Lighthouse. Le
   ottimizzazioni a intuito di solito spostano complessità senza spostare
   millisecondi.

## Variabili d'ambiente

Validate all'avvio con Zod, in `config/env.ts` (esempio in
`examples/config/env.ts`). Il punto è fallire subito e in modo chiaro: senza
validazione, una variabile mancante diventa `undefined` e produce un errore
incomprensibile in produzione tre livelli più in là.

- `.env.example` versionato e **aggiornato ogni volta che aggiungi una
  variabile**; `.env*` reali sempre in `.gitignore`.
- Separa esplicitamente le variabili server da quelle client: le client hanno il
  prefisso `NEXT_PUBLIC_` e sono pubbliche.
- Nel codice importa da `config/env.ts`, mai `process.env` sparso: così esiste un
  solo posto dove sapere cosa serve al progetto per partire.

## Git e commit

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
Branch: `feature/<nome>`, `fix/<nome>`.

Prima di ogni commit devono passare `tsc --noEmit`, lint e test. Con Husky +
lint-staged è automatico e il controllo non dipende dalla memoria di chi
committa (o dell'agente).

La CI (`examples/testing/ci.yml`) ripete gli stessi controlli: l'hook locale è
saltabile con `--no-verify`, la CI no.
