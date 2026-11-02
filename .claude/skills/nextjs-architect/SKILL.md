---
name: nextjs-architect
description: >
  Progetta, scaffolda e implementa progetti Next.js (App Router, versione 16+)
  con architettura feature-based ispirata a bulletproof-react: confini tra
  feature enforce-abili via ESLint, architettura unidirezionale shared →
  features → app, TypeScript strict, validazione Zod, Server Actions,
  testing e CI. Lo stack (DB, ORM, auth, UI) non viene inventato: si legge
  dal Blueprint e dal PRD del progetto. Usa questa skill quando si crea un
  progetto Next.js o React, si struttura il codice ("che cartelle uso", "dove
  metto questo componente"), si implementa una feature o si aggiunge una
  pagina, una route o una server action.
---

# Next.js Architect

Sei un senior Next.js engineer. Il tuo compito è trasformare il piano (PRD,
Blueprint, task) in codice Next.js organizzato in modo che **il prossimo
agente che apre il repo capisca dove va ogni cosa senza chiederlo**.

Questa skill è pensata per una factory di progetti costruiti da agenti. Da qui
discende il principio che governa ogni scelta:

> Una regola che il linter verifica vale dieci regole scritte in un documento.

Gli agenti (e gli umani alle 23:00) saltano la documentazione, ma non ignorano
una build rossa. Quindi ogni convenzione importante di questa skill ha un
enforcement meccanico: ESLint, `tsc`, schema Zod, test. Ciò che non è
verificabile automaticamente va scritto in `CONTEXT.md`, che è il posto dove gli
agenti successivi andranno a cercare.

## Le due modalità

| Modalità | Quando | Output |
|---|---|---|
| **Scaffold** | non esiste `package.json`, o progetto appena creato | struttura + config + mappa in `CONTEXT.md` |
| **Feature** | progetto già strutturato, task da implementare | codice della feature, dentro i confini esistenti |

---

## Fase 0 — Contesto (sempre, in tutte le modalità)

Leggi quello che esiste: `architecture.yaml` e le fonti `blueprint/` (stack, data model, route), `CONTEXT.md`
per le convenzioni già decise, `package.json` e `next.config.*` per lo stack reale, la versione e ciò che è
già installato.

**Lo stack si legge, non si inventa.** DB, ORM, auth, UI kit e hosting vengono dal Blueprint. Se un layer
manca del tutto, non sceglierlo di nascosto: scrivi la domanda in `QUESTIONS.md` con due opzioni e una riga
di motivazione.

### Versione del framework

Questa skill è scritta per **Next.js 16** (LTS attiva da ottobre 2025, minimo
Node 20.9). Next.js 15 è in maintenance fino a ottobre 2026: se il progetto è su
15, i pattern restano validi ma cambiano alcune API — vedi
`references/nextjs-16.md`, sezione "Differenze 15 → 16".

Prima di fissare le versioni in `package.json`, verifica qual è la stabile
corrente (`npm show next version`, o una ricerca web). Un numero di versione
scritto in una skill invecchia; il comando no.

---

## L'architettura, in una pagina

```
src/
├── app/                    # SOLO routing: page.tsx, layout.tsx, route.ts, proxy.ts
│   ├── (marketing)/        # route group: raggruppa senza toccare l'URL
│   ├── (app)/              # area autenticata, con il suo layout
│   └── api/                # route handler, solo se servono davvero
├── features/               # il cuore: un modulo per dominio funzionale
│   └── projects/
│       ├── api/            # query e mutation di QUESTA feature
│       ├── components/     # componenti di QUESTA feature
│       ├── hooks/
│       ├── schemas/        # Zod: la forma dei dati al confine
│       ├── types/
│       └── utils/
├── components/             # UI condivisa e agnostica di dominio (Button, Table)
│   ├── ui/                 # primitivi (shadcn/ui o equivalente)
│   └── layout/             # Header, Sidebar, Footer
├── lib/                    # librerie configurate: db, auth, http client, logger
├── config/                 # env validato, costanti, feature flag
├── hooks/                  # hook condivisi
├── types/                  # tipi condivisi
├── utils/                  # funzioni pure condivise
└── testing/                # helper e mock per i test
```

Su questa struttura valgono **tre regole**, tutte verificate da ESLint
(`import/no-restricted-paths`, config pronta in `examples/config/`):

1. **Unidirezionalità: `shared → features → app`.** `app/` può importare da
   `features/` e dalle cartelle condivise; `features/` può importare solo da
   quelle condivise; le condivise non importano da nessuna delle due. Così sai
   sempre in che direzione guardare quando cerchi una dipendenza, e togliere una
   feature non rompe il resto.

2. **Nessun import tra feature.** `features/billing` non importa da
   `features/projects`. Se due feature hanno bisogno della stessa cosa, quella
   cosa è condivisa e sale in `components/`, `lib/` o `utils/`; se hanno bisogno
   di parlarsi, si compongono nel layer `app/`. Questa è la regola che tiene
   basso il costo di ogni modifica futura: senza di essa, dopo dieci feature
   ogni modifica tocca mezzo repo.

3. **`app/` resta sottile.** Un `page.tsx` legge i parametri, chiama l'API layer
   della feature, compone i componenti. Nessuna logica di business, nessuna
   query inline. Se un `page.tsx` supera ~50 righe, quasi sempre c'è dentro
   qualcosa che appartiene a una feature.

**Niente barrel file** (`index.ts` che ri-esporta tutto): rompono il tree
shaking, rallentano i build e creano cicli di import difficili da diagnosticare.
Importa i file direttamente.

Non creare cartelle vuote "per completezza": una feature che non ha hook non ha
la cartella `hooks/`. Le cartelle vuote sono rumore che gli agenti successivi
interpretano come "qui dovrebbe esserci qualcosa".

Dettagli, casi limite e anti-pattern: `references/structure.md`.

---

## Fase 1 — Dal PRD alle feature (modalità scaffold)

Prima di creare file, produci la **mappa**. Due minuti qui evitano un refactor dopo:

| Feature | Route | Entità principali | Note |
|---|---|---|---|
| `auth` | `(auth)/login`, `(auth)/register` | User, Session | |
| `projects` | `(app)/projects`, `(app)/projects/[id]` | Project, Member | |

Come si ricava:

- **process map / functional requirements del PRD → feature.** Una feature è un
  pezzo di dominio con un suo linguaggio, non un tipo di file. `projects`,
  `billing`, `notifications` sono feature; `forms`, `modals`, `helpers` no.
- **page inventory → route** in `app/`, con i route group a separare le aree che
  hanno layout o regole di accesso diverse.
- **data model → schema del DB**; **query map → funzioni in `features/*/api/`**.

Regola pratica sul dimensionamento: se una feature ha una sola pagina e due
componenti, probabilmente è parte di un'altra feature. Se ne ha quindici, ne
contiene due che vanno separate. Meglio partire con feature un po' grosse e
spaccarle quando i confini si vedono, che frammentare subito su confini
immaginari.

---

## Fase 2 — Scaffold

1. `npx create-next-app@latest <nome> --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
   (adatta i flag allo stack del Blueprint; se il PRD non prevede Tailwind,
   togli il flag invece di installarlo "tanto poi si vede")
2. Copia e adatta le config da `examples/config/`: TypeScript strict,
   ESLint flat config con i confini, Prettier, `env.ts` validato con Zod.
3. Crea l'albero `src/` **solo per le feature della mappa**.
4. Installa lo stack del Blueprint (ORM, auth, validazione, test).
5. **Verifica che passi**: `npm run build`, `npm run lint`, `npx tsc --noEmit`.
   Uno scaffold che non builda è peggio di nessuno scaffold, perché il prossimo
   agente eredita un errore che non ha causato lui e non sa se è intenzionale.
6. Primo commit, con i test e la CI già dentro (`examples/testing/ci.yml`).

Verifica anche che i confini funzionino davvero: scrivi un import vietato al
volo, controlla che ESLint lo segnali, cancellalo. Una regola di lint mai
testata di solito è una regola scritta male.

---

## Fase 3 — Implementare una feature

Ordine di lavoro. Non è burocrazia: ogni passo restringe lo spazio degli errori
del successivo, e i tipi si propagano da soli invece di essere riscritti a mano.

1. **Schema Zod** in `features/<f>/schemas/` — la forma dei dati al confine.
   I tipi TypeScript si derivano da lì (`z.infer`), non si scrivono due volte.
2. **API layer** in `features/<f>/api/` — query (lettura) e Server Action
   (scrittura). Ogni funzione fa: autorizzazione → validazione → accesso dati →
   errore tipizzato o risultato.
3. **Componenti server** — quelli che leggono dati. Sono il default.
4. **Confine client** — `"use client"` il più in basso possibile nell'albero:
   sul componente che ha davvero stato o eventi, non sulla pagina intera. Un modulo
   non si smonta né si resetta a fine caricamento (sessione, dati iniziali): vedi
   `design-implement`, sezione "Moduli e caricamenti asincroni".
5. **Test** sui comportamenti che il PRD chiama esplicitamente.

Riferimenti mentre implementi:

- pattern del framework (server/client, caching, `params` async, `proxy.ts`,
  streaming) → `references/nextjs-16.md`
- naming, gestione errori, sicurezza, performance → `references/conventions.md`
- codice copiabile → `examples/feature-projects/`

Gli esempi in `examples/` sono **pattern, non template da ricopiare alla
lettera**: rispettano la forma, ma usano lo stack del progetto reale. Se il
progetto usa Prisma e l'esempio Drizzle, cambia l'accesso ai dati e tieni la
struttura.

---

## File di riferimento

| File | Quando leggerlo |
|---|---|
| `references/structure.md` | scaffold, dubbi su dove va un file, config dei confini ESLint |
| `references/nextjs-16.md` | ogni volta che scrivi codice Next.js: server/client, caching, routing, form |
| `references/conventions.md` | naming, errori, sicurezza, performance, env, git |
| `examples/` | codice di riferimento — vedi `examples/README.md` per l'indice |
