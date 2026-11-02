# CONTEXT: Circolo padel

Mappa del progetto per chi arriva con contesto vuoto (umano o agente). La compila la skill `scaffold`; la aggiorna chi cambia la struttura.

## Cos'è questo progetto

Prenotazione dei campi di un circolo padel senza telefonate: il socio apre la pagina /prenota (route RT-prenota), sceglie uno slot libero e vede la conferma; uno slot già prenotato viene rifiutato con lo stato 409. Una sola operazione API (prenotaSlot) e nessun database: le prenotazioni stanno in memoria nel server.

## Struttura

```
frontend/                interfaccia Next.js (TypeScript), radice con package.json, package-lock.json e test propri
  src/app/prenota/       la route RT-prenota
  src/features/booking/  form di prenotazione, client dell'operazione prenotaSlot e i loro test
  src/integration/       test di integrazione: il client reale contro il server reale
backend/                 server Fastify (TypeScript), radice con package.json, package-lock.json e test propri
  src/bookings/          operazione prenotaSlot, archivio in memoria e contract test sulla specifica OpenAPI
DESIGN/                  bozza visiva della pagina (prenotazione.html), sola lettura
blueprint/               fonti, Macro e Task Contract, specifica OpenAPI in blueprint/interfaces/public.openapi.yaml
tests/system-e2e/        spec Playwright di sistema: li percorre solo factory architecture test .
Makefile                 install (npm ci nelle due radici), build e test (nelle due radici), e2e (il collaudo d'architettura), up (ferma uno stack già avviato, controlla gli strumenti prima delle build, costruisce il codice corrente, avvia i due servizi e torna quando sono vivi e rispondono) e down (ferma ciò che up ha avviato, riconoscendolo dalla cartella annotata da up)
.env.example             variabili del collaudo senza segreti, da copiare in .env.test
.gitignore               ignora node_modules, .env.test, log e pid: ciò che l'avvio e le prove producono non sporca l'albero
```

## Comandi

I comandi per installare, costruire, provare e avviare il progetto stanno nella ricetta dell'ambiente in `blueprint/deployment.yaml` (schema 3) e si controllano con `factory env check`. Si lanciano dalla radice del repository: un solo package manager, npm, con un package-lock.json per radice, e i target del Makefile (`install`, `build`, `test`, `e2e`, `up`, `down`) entrano nelle due radici al posto di chi li lancia.

L'avvio, `make up`, ricompila server e interfaccia dal sorgente corrente (mai una build vecchia) e poi li avvia in background, interfaccia su http://127.0.0.1:3000 e server su http://127.0.0.1:8000; prima ferma da sé uno stack avviato da un up precedente, controlla gli strumenti prima delle build e torna solo quando i due server sono vivi e rispondono (al più dopo 60 secondi). Per fermarli `make down`. L'ambiente del collaudo si crea una volta con `cp .env.example .env.test` (`.env.test` non va in Git).

## Convenzioni attive

- Codice e identificatori in inglese, testi per la persona in italiano; TypeScript strict; file in kebab-case.
- Per funzione: UI, logica e test di una funzionalità stanno nella stessa cartella, con i test accanto al codice (*.test.ts).
- Il contratto OpenAPI è l'unica fonte dei tipi di rete: il server lo prova con contract test, la pagina usa un client validato sulla stessa specifica e non copia i tipi a mano.
- Nessun valore visivo scritto nei componenti: colori, font e spaziature vengono dai token di design_language, raccolti in frontend/src/styles/theme.css.
- Una dipendenza nuova va nel package.json della radice in cui serve e nella tabella delle decisioni.
- I file di servizio dell'avvio (pid e log di make up) stanno in node_modules/.stack, che Git ignora: dopo make up e make down l'albero resta pulito, come chiedono start-contract, integrate-contract e promote-dev. Mai pid o log accanto ai sorgenti.
- Se adatti il Makefile, cambia sempre insieme tre cose: i comandi di avvio, le cartelle dei server (nelle righe di `install` e di `up`, per esempio `cd backend && ...`) e l'elenco `STACK_SERVICES` in cima al file, una voce `nome=indirizzo` per servizio: gli indirizzi di controllo devono restare uguali agli healthcheck di architecture.yaml, e se una porta o un percorso cambia, cambia in tutti e due i file. Se i servizi non sono due, togli o aggiungi insieme le righe del servizio in `install` e in `up` (`npm ci`, build e avvio) e la sua voce in `STACK_SERVICES`: le funzioni di shell leggono l'elenco, non si toccano. I target `build` e `test` hanno una riga per radice (sono i comandi della ricetta dell'ambiente): togli o aggiungi anche lì la riga del servizio, con il suo `npm run build` e il suo `npm test`. Se la voce di un servizio manca da `STACK_SERVICES`, `down` lo ferma lo stesso (segue i file `.pid`), ma `up` non lo aspetta, non si accorge se muore e non controlla il suo indirizzo: l'avvio può riuscire con un servizio che non risponde. Una voce senza le righe di avvio in `up`, al contrario, fa fallire `up`, che lo dice. `backend` e `frontend` sono solo i nomi dei servizi (nell'elenco, nei file `.pid` e `.log` di node_modules/.stack e nei messaggi) e restano anche se le cartelle si chiamano `api` e `web`; lo stesso nome va scritto uguale nell'elenco e nelle righe di `up`.
- `make down` non si adatta: `make up` annota in node_modules/.stack, accanto al numero di processo di ogni server, la cartella in cui lavora davvero, e `make down` ferma tutto ciò che `up` ha annotato, ma solo un processo che ha ancora quella cartella. Per questo funziona con qualunque comando di avvio (npm run serve, uvicorn), con qualunque nome di cartella e con qualunque elenco di servizi. Il processo avviato da `up` deve restare nella cartella da cui parte: la cartella si annota una volta sola, subito dopo l'avvio, e se il processo la cambia da solo (un server lanciato direttamente che chiama `chdir`) `down` non lo riconosce più e lo lascia vivo; se serve un'altra cartella, il `cd` si fa nella riga di `up`, prima di avviare il server. Un processo vivo che non può verificare (cartella illeggibile, o pid scritto da un Makefile più vecchio) lo lascia, tiene il pid e fallisce dicendo cosa fare; un numero di processo riusato da un altro programma, o già morto, lo toglie dal file e lo dice. Il Makefile usa `curl`, `pgrep` e `ps` (gli ultimi due sono del pacchetto `procps`, che nelle immagini Docker slim e in Alpine va installato: il `ps` di BusyBox non legge lo stato di un processo, e `up` lo rifiuta) e legge la cartella dei processi da `/proc` o con `lsof`: `up` controlla che ci siano prima delle build e di avviare qualunque server e, se `pgrep` manca, `down` non ferma un server vivo: lo dice, una volta sola anche se i server vivi sono più d'uno, e fallisce.

## Dove si aggiunge cosa

- Nuova pagina: frontend/src/app/<route>/page.tsx, con i componenti in frontend/src/features/<funzione>/ e la bozza di riferimento in DESIGN/.
- Nuova operazione del server: backend/src/<funzione>/, dopo averla dichiarata in blueprint/interfaces/public.openapi.yaml (il contratto si cambia nel piano, non nel loop).
- Nuovo spec di sistema: tests/system-e2e/<journey>.spec.ts, uno per journey, con campi, azioni ed esiti del flusso in blueprint/frontend.yaml.

## Decisioni e motivi

| Data | Decisione | Perché |
|---|---|---|
| 2026-10-14 | Next.js per l'interfaccia, Fastify per il server, Vitest per i test di entrambi | stack del profilo default per una web app full-stack |
| 2026-10-14 | npm come unico package manager, un package-lock.json per radice | gli stessi comandi in PROGRESS.md, nei contratti e in architecture.yaml |
| 2026-10-14 | Prenotazioni in memoria, nessun database | scelta del riferimento: niente migrazioni né make db-init |
| 2026-10-14 | Test accanto al codice, verify dei task filtrati per cartella | ogni task prova solo il proprio lavoro e il comando può fallire |
| 2026-10-15 | make up ricompila prima di avviare, pid e log in node_modules/.stack | l'avvio non si fida di nessuna build precedente e l'albero deve restare pulito per i gate del runner |
| 2026-10-15 | make up ferma prima lo stack già avviato e make down ferma anche i processi che npm lancia, aspettando che escano | un secondo up non lascia il server vecchio sulle porte (le risposte verrebbero dal codice vecchio) e down non perde mai ciò che up ha avviato |
| 2026-10-16 | make up annota accanto al pid la cartella di lavoro di ogni server e make down riconosce i server da quella (per dispositivo e inode); toglie il pid solo a processo fermo o già riconosciuto come altro, e se non può verificare un processo vivo lo lascia e fallisce; make up torna solo quando i server sono vivi e rispondono ai loro indirizzi, senza passare dal proxy | cambiare il comando di avvio o le cartelle non deve lasciare server vivi senza pid, un numero di processo riusato da un altro progetto non si ferma, un percorso con lettere accentate o un ambiente senza lingua non cambia l'esito, e un server che muore dopo i primi secondi non deve far uscire up con 0 |
| 2026-10-16 | i servizi stanno in un solo elenco (STACK_SERVICES), che le funzioni di shell leggono da un punto solo, make down ferma ciò che up ha annotato senza guardare l'elenco, make up controlla anche pgrep e ps prima di avviare, e il processo avviato da up deve restare nella cartella da cui parte | un progetto con uno o tre servizi si adatta cambiando l'elenco e le righe di install e di up e nient'altro, un servizio dimenticato nell'elenco non resta vivo dopo make down, senza procps (immagini Docker slim) down non lascia server vivi in silenzio, e un server che cambia cartella da solo non è più riconoscibile da down (l'ora di avvio non è un rimedio semplice: ps -o lstart non c'è su BusyBox e il suo testo cambia con la lingua dell'ambiente) |
| 2026-10-16 | stack_alive guarda lo stato con ps e lascia l'ultima parola a kill -0; make up controlla gli strumenti, compreso un ps che legge lo stato di un processo, prima delle build e le porte subito prima di avviare; make down dice una volta sola cosa manca | un genitore che raccoglie un processo tra le due chiamate faceva passare per vivo un server già fermo (down falliva e teneva il pid, e con lui up), il ps di BusyBox (Alpine) non vede gli zombie e down aspettava per niente server già morti, e in un'immagine senza procps up costruiva due volte prima di scoprire che non poteva fermare nulla |
