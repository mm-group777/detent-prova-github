# Struttura del progetto

Dettaglio della struttura, dei confini e dei casi limite. Il riassunto operativo
è nella SKILL.md; qui c'è il "perché" e cosa fare quando la regola non si applica
in modo ovvio.

## Indice

- [Albero completo](#albero-completo)
- [Dove va questo file?](#dove-va-questo-file)
- [Anatomia di una feature](#anatomia-di-una-feature)
- [Confini: la config ESLint](#confini-la-config-eslint)
- [Route group e organizzazione di app/](#route-group-e-organizzazione-di-app)
- [Anti-pattern](#anti-pattern)
- [Casi limite](#casi-limite)

---

## Albero completo

```
progetto/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout: html, body, provider globali
│   │   ├── page.tsx                # home
│   │   ├── error.tsx               # error boundary globale (client component)
│   │   ├── not-found.tsx
│   │   ├── (marketing)/            # area pubblica, suo layout
│   │   │   ├── layout.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── (app)/                  # area autenticata, suo layout + guard
│   │   │   ├── layout.tsx
│   │   │   └── projects/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── [projectId]/page.tsx
│   │   ├── api/                    # route handler (webhook, integrazioni)
│   │   │   └── webhooks/stripe/route.ts
│   │   └── proxy.ts                # ex middleware.ts (Next 16)
│   ├── features/
│   │   └── projects/
│   │       ├── api/
│   │       │   ├── get-projects.ts
│   │       │   ├── get-project.ts
│   │       │   └── create-project.ts     # Server Action
│   │       ├── components/
│   │       │   ├── projects-list.tsx
│   │       │   └── create-project-form.tsx
│   │       ├── hooks/use-project-filters.ts
│   │       ├── schemas/project.ts
│   │       ├── types/index.ts
│   │       └── utils/format-budget.ts
│   ├── components/
│   │   ├── ui/                     # primitivi: button, input, dialog
│   │   └── layout/                 # header, sidebar, footer
│   ├── config/
│   │   ├── env.ts                  # variabili validate con Zod
│   │   └── constants.ts
│   ├── lib/
│   │   ├── db.ts                   # client DB configurato
│   │   ├── auth.ts                 # sessione, helper di autorizzazione
│   │   └── errors.ts               # tipi di errore applicativi
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── testing/                    # render helper, factory, mock
├── public/
├── e2e/                            # test Playwright
├── .env.example                    # SEMPRE aggiornato, mai .env nel repo
├── eslint.config.mjs
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Dove va questo file?

Tre domande in cascata:

1. **Lo usa una sola feature?** → dentro quella feature.
2. **Lo usano due o più feature?** → cartella condivisa (`components/ui`,
   `lib`, `utils`, `hooks`, `types`). Attenzione: "lo userà anche X in futuro"
   non conta. Si condivide al secondo uso reale, non al primo ipotizzato —
   astrarre troppo presto produce astrazioni sbagliate che poi restano.
3. **È routing?** → `app/`, e niente altro che routing.

Casi frequenti:

| Cosa | Dove |
|---|---|
| Bottone generico | `components/ui/button.tsx` |
| Form di creazione progetto | `features/projects/components/create-project-form.tsx` |
| Card che mostra un progetto | `features/projects/components/project-card.tsx` |
| Header dell'app | `components/layout/header.tsx` |
| `formatCurrency` | `utils/format.ts` |
| `calculateProjectBudget` | `features/projects/utils/budget.ts` |
| Client Stripe configurato | `lib/stripe.ts` |
| Tipo `Project` | `features/projects/types/index.ts` |
| Tipo `ApiResponse<T>` | `types/api.ts` |

Il discrimine è il **dominio**, non la genericità tecnica: `formatCurrency` non
sa cosa sia un progetto, `calculateProjectBudget` sì.

## Anatomia di una feature

```
features/projects/
├── api/        # tutto ciò che tocca dati: query (lettura) e Server Action (scrittura)
├── components/ # UI della feature; usa i primitivi da components/ui
├── hooks/      # logica React riutilizzabile dentro la feature
├── schemas/    # Zod: input dei form, payload delle action, risposte esterne
├── types/      # tipi derivati dagli schema + tipi di dominio
└── utils/      # funzioni pure di dominio
```

Includi solo le cartelle che servono davvero.

Una feature dovrebbe poter essere cancellata rimuovendo la sua cartella e le
route che la usano. Se cancellarla rompe altre cinque feature, i confini sono
stati violati: è il test mentale più rapido per capire se la struttura sta
reggendo.

## Confini: la config ESLint

Config completa e commentata in `examples/config/eslint.config.mjs`. La parte che
conta:

```js
'import/no-restricted-paths': ['error', {
  zones: [
    // 1. niente import tra feature
    { target: './src/features/projects', from: './src/features', except: ['./projects'] },
    { target: './src/features/billing',  from: './src/features', except: ['./billing'] },
    // ... una zona per feature

    // 2. le feature non importano dal layer app
    { target: './src/features', from: './src/app' },

    // 3. le cartelle condivise non importano da features/ né da app/
    {
      target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils'],
      from: ['./src/features', './src/app'],
    },
  ],
}],
```

Le zone della regola 1 vanno aggiunte **quando crei la feature**, non "dopo". Se
si aggiungono a fine progetto, si scopre che venti import illegali sono già lì e
la tentazione di disattivare la regola diventa forte.

Utile affiancare `eslint-plugin-boundaries` su progetti grandi, ma
`import/no-restricted-paths` copre il 90% dei casi senza dipendenze aggiuntive.

## Route group e organizzazione di app/

I route group `(nome)` raggruppano route senza comparire nell'URL. Servono a
tre cose:

- **layout diversi**: `(marketing)` con header pubblico, `(app)` con sidebar
- **regole di accesso diverse**: il layout di `(app)` verifica la sessione una
  volta per tutta l'area invece di ripeterlo in ogni pagina
- **leggibilità**: si vede a colpo d'occhio quali route sono pubbliche

File speciali da usare invece di reinventarli: `loading.tsx` (streaming
automatico via Suspense), `error.tsx` (error boundary, deve essere un client
component), `not-found.tsx`, `template.tsx` (rimonta a ogni navigazione).

Cartelle private `_nome`: escluse dal routing. Utili per file che devono stare
vicino alla route ma non sono route. Da usare con parsimonia — se ci finisce
logica di dominio, quella logica appartiene a una feature.

## Anti-pattern

**Cartelle per tipo dentro una feature che poi contengono un solo file.**
`features/projects/hooks/index.ts` con un hook dentro va bene; cinque cartelle
con un file ciascuna, no.

**La discarica `utils.ts`.** Un file che cresce a 2000 righe di funzioni
scorrelate. Dividi per argomento: `utils/format.ts`, `utils/date.ts`,
`utils/array.ts`.

**Annidamento profondo.** `src/components/features/dashboard/widgets/weather/current/small/index.tsx`
è troppo. Oltre 3-4 livelli sotto `src/`, ripensa la divisione.

**Tutto in `app/`.** L'errore più comune con l'App Router: `page.tsx` da 400
righe con query, logica e UI. `app/` è una mappa degli URL, non il posto dove
sta il codice.

**Feature "tecniche".** `features/forms`, `features/api`, `features/utils` non
sono feature: sono tipi di file travestiti. Una feature ha un nome che un utente
o uno stakeholder riconoscerebbe.

**Barrel file.** `index.ts` che ri-esporta tutto: rompe il tree shaking,
rallenta i build, crea import circolari opachi. Importa i file direttamente.

**`components/` gonfio.** Se `components/` ha 60 file, molti appartengono a una
feature. Quella cartella è per la UI davvero condivisa e agnostica di dominio.

## Casi limite

**Feature che ne usa un'altra.** Es. `billing` deve mostrare la lista progetti.
Tre opzioni, in ordine di preferenza: (a) composizione nel layer `app/` — la
pagina chiama entrambe e passa i dati come props; (b) il pezzo condiviso sale in
`components/`; (c) se sono davvero accoppiate a livello di dominio, erano una
feature sola. Non aprire un'eccezione nella regola ESLint: la prima eccezione
autorizza tutte le altre.

**Tipi condivisi tra feature.** Se `Project` serve anche a `billing`, il tipo (o
lo schema Zod da cui deriva) sale in `types/` o in un layer di dominio
condiviso. Salgono i tipi, non le funzioni.

**Monorepo.** Con più app (web + admin + mobile), Turborepo con `apps/` e
`packages/`: la stessa filosofia sale di un livello, le feature restano dentro
ciascuna app finché non servono davvero a due app. Non partire in monorepo per
un'app sola: il costo di configurazione è immediato, il beneficio ipotetico.

**Progetto minuscolo** (3-4 pagine, nessun dominio vero). La struttura completa
è sovradimensionata: `app/`, `components/`, `lib/` bastano. Il segnale per
introdurre `features/` è la terza pagina che condivide logica con le altre.
Dirlo esplicitamente all'utente è meglio che imporre l'impianto pesante.
