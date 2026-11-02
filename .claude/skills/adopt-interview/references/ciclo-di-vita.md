# Ciclo di vita e dati iniziali: come si ricavano dalle evidenze

Il collaudo non legge `architecture.yaml`, lo ESEGUE: `setup`, `start`, `stop`, `reset`, `data.migrations` e `data.seed` sono comandi che una shell lancia dalla radice del progetto, e un valore che non è un comando fa fallire il collaudo. Ordine del kernel: `lifecycle.setup`; `lifecycle.reset`, se dichiarato e solo quando il collaudo lancia una suite o le journey; `lifecycle.start`, che deve TORNARE (il kernel ne aspetta l'uscita al massimo 10 minuti, poi fallisce); per ogni istanza non `external`, in ordine di dipendenza, l'attesa del suo `healthcheck` e poi `data.migrations` e `data.seed`; poi connessioni, prove e `lifecycle.stop`. Se il `healthcheck` dell'istanza dati risponde già prima di `start` (database acceso da `setup`), migrazioni e seed girano prima di `start`, una volta sola. Prima di `setup` il kernel controlla le porte delle istanze e si ferma se una è già occupata: per il database del progetto dichiara una porta sua, oppure un servizio del progetto nella ricetta (per esempio in Compose), mai un database già acceso fuori dal progetto. Migrazioni e seed devono poter ripetersi, perché `start` può aver già migrato. Lo stesso vale per `setup`, `start`, `stop` e `reset`: vedi «Comandi ripetibili».

## Da dove ricavare le evidenze

Apri solo i file, non lanciare nulla per scoprire un comando: Compose e Dockerfile (servizi, porte, `healthcheck`, `depends_on`), la sezione `scripts` del manifesto (`dev`, `build`, `start`, `db:migrate`, `db:seed`), ORM e migrazioni (`prisma/`, `drizzle.config.*`, `alembic.ini`, `manage.py`), Makefile e simili, gli script di avvio e provisioning in `tools/` o `scripts/` (cosa lasciano acceso?), la CI (i passi che avviano servizi, migrano e riempiono prima dei test mostrano la sequenza vera). README e guide sono una pista, mai la sola prova.

## lifecycle.start: deve tornare

- Avvia in secondo piano e restituisce il controllo; la prontezza non si aspetta dentro `start` ma nei `healthcheck` delle istanze (`tcp`, `http` o `command`, con `timeout_seconds` largo per l'avvio a freddo). Porta e percorso di salute si leggono nei file: una porta standard non letta è una `convenzione`, un percorso di salute non letto non si indovina (usa `tcp` sulla porta o un `command`).
- Un server in primo piano (`npm run dev`, `uvicorn`, `rails server`) non torna e il collaudo cade nel timeout. Servono un segno di secondo piano (`docker compose up -d`, `pm2 start`, `nohup ... &`) o un avvolgimento tuo con log e pid fuori dall'albero, voce `convenzione`.
- Avvia il codice corrente: con Compose aggiungi `--build`, altrimenti il collaudo prova un'immagine vecchia.
- Un servizio che pretende lo schema all'avvio esce subito su un database vuoto. Se il database lo accende `start` stesso, le migrazioni vanno dentro `start`, dopo l'attesa e prima del servizio, che resta tra parentesi in secondo piano: `docker compose up -d --wait db && npm run db:migrate && (npm start > /tmp/app.log 2>&1 &)`. Se non capisci dai file (punto d'ingresso, controlli delle migrazioni, ORM, log descritti nella guida) se il servizio pretende lo schema, non indovinare: `domanda` con i file guardati.

## stop, setup, reset

- `stop` spegne ciò che `start` ha acceso (`docker compose down`, `pm2 stop ...`) e ferma solo il PID che `start` ha scritto in un file; il kernel rifiuta `pkill`, `killall` e la ricerca di processi per nome. Senza uno stop nel repository, deducilo come l'inverso del tuo `start` e dichiaralo `convenzione`. Con istanze runtime, `architecture.yaml` ready esige sia `start` sia `stop`.
- `setup` è installazione o provisioning a servizi spenti, per OGNI radice che il collaudo usa, non solo quella del servizio: il guasto tipico è che `setup` installa `api` ma le journey lanciano `web` senza le sue dipendenze, e «modulo non trovato» compare solo alla promozione. Elenca le istanze con il loro percorso, le cartelle da cui partono le suite e le journey e dove stanno i manifesti dei runner di prova, e installa le dipendenze di ognuna (`npm ci --prefix api && npm ci --prefix web`).
- `reset` è facoltativo: scrivilo solo se un file lo dichiara, altrimenti togli la chiave. Il kernel lo esegue dopo `setup` e prima di migrazioni, seed e `start` (passo «reset dei dati»), solo quando il collaudo lancia una suite o le journey: deve azzerare i dati di prova senza bisogno di `start`, e mai quelli di sviluppo.

## setup: l'ambiente dell'host, da zero

Prima di `setup` nessuno ha installato nulla e la persona non apre il Terminale: i comandi che il kernel lancia sull'host (`test`, i `verify`, il ciclo
di vita, il collaudo di blocco) trovano solo ciò che `setup` prepara. Vale anche se `start` è Docker, che non crea l'ambiente dell'host.
`setup` gira nel recinto dei comandi: scarica da internet e scrive solo nel progetto e nelle cache dei gestori; un indice privato con credenziali in
`~/.npmrc` o `~/.pypirc` non si raggiunge (`domanda`).

- Ambiente isolato del progetto, creato solo se manca, e dipendenze di ogni radice col gestore che il progetto usa (lo dicono manifesto e lockfile).
  ESEMPI: Node `npm ci --prefix api && npm ci --prefix web`; Python con uv `test -x .venv/bin/python || uv venv --python 3.12 .venv`, poi
  `uv pip install --python .venv/bin/python -r requirements.txt`. Stesso esito al secondo lancio: vedi «Comandi ripetibili».
- La versione dell'interprete viene dai file del progetto (`.python-version`, `.nvmrc`, `.tool-versions`, manifesto, Dockerfile, CI). Se non la dicono
  o dicono cose diverse vale la regola delle versioni del punto 4: `domanda`, mai una versione inventata.
- Gli strumenti che `setup` esige stanno in `tools` della ricetta, interprete con la versione compreso (vedi [ricetta.md](ricetta.md)). uv non scarica
  interpreti nel recinto: la versione scelta deve già stare sul computer, altrimenti il controllo va rosso e lo dice chiaro.
- Dopo `setup` i comandi della stessa prova (`start`, `data.migrations`, `data.seed`, `stop`) usano percorsi espliciti, per esempio
  `.venv/bin/python -m alembic upgrade head` o `node_modules/.bin/prisma migrate deploy`: il PATH della prova si calcola una volta, prima di `setup`.

## Comandi ripetibili

Il kernel rilancia questi comandi a ogni passaggio (il controllo dell'onboarding, la Conferma e il collaudo di ogni blocco), e `stop` gira anche dopo un `setup` o uno `start` falliti. Ogni comando di `setup`, `start`, `stop` e `reset`, e ogni `data.migrations` e `data.seed`, deve poter girare più volte di seguito dalla radice con lo stesso esito (uscita 0 e stesso stato finale), su un progetto appena clonato come su uno già preparato da un giro precedente.

- Niente comandi che falliscono se il risultato c'è già: `mkdir` senza `-p`, `ln -s` senza `-f` o senza controllo, `createdb`, `CREATE DATABASE` o `CREATE ROLE` senza controllo, `docker network create` senza controllo, migrazioni che rifanno ciò che c'è. Si usa la forma che ammette il già fatto (`mkdir -p`, `ln -sfn`, `IF NOT EXISTS`) o un controllo davanti al comando.
- Niente comandi che cambiano lo stato a ogni giro: append a file (`>>`), contatori o nomi con la data, seed che duplica le righe a ogni lancio (serve `ON CONFLICT DO NOTHING` o un upsert).
- Un file di esempio si copia solo se manca. Giusto: `test -f docker/.env || cp docker/.env.example docker/.env`. Sbagliato: `cp -n docker/.env.example docker/.env`, che su macOS esce con 1 se il file c'è già (l'esito di `cp -n` cambia con il sistema e la versione di `cp`) e fa rifiutare la Conferma.
- `stop` esce 0 anche se non c'è nulla da spegnere (pid mancante, processo già finito): `test ! -f .run/pid || { kill "$(cat .run/pid)" || true; rm -f .run/pid; }`, con il pid dove lo scrive `start`.

## data.migrations e data.seed

- Sono comandi, non percorsi: `migrations: drizzle/` fallisce con `is a directory`. Il comando vero sta nelle evidenze: meglio lo script del manifesto (`npm run db:migrate`) del comando riscritto a mano. Una libreria di autenticazione con tabelle proprie ha spesso una sua CLI di migrazione: se non la trovi in script, CI o guide, non indovinarla e scrivi una `domanda`.
- Se il progetto sta in una sottocartella: `cd backend && npx prisma migrate deploy`.
- Gli stessi comandi stanno in `blueprint/database.yaml` (`migrations.apply_command`, `lifecycle.seed_command`): tienili uguali. `backup` e `restore` sono descrizioni che il kernel non esegue.
- Senza migrazioni né dati nei file non inventarli: lascia fuori le chiavi e scrivi una `domanda`.

## Il comando di sviluppo non è lifecycle.start

Il comando di sviluppo (riga `Avvio dev` di `CONTEXT.md`, `commands.start` della ricetta) serve a una persona al terminale e può non terminare; `lifecycle.start` serve al collaudo e DEVE tornare. Il lifecycle si scrive UNA volta, in `architecture.yaml`: dove `CONTEXT.md`, la ricetta o `ONBOARDING.yaml` lo richiamano lo fanno a parole, senza copiare il comando.

## Valori che non trovi

Non inventare: senza un file che lo dica la chiave resta fuori (mai una frase, mai `undecided` nei campi che il kernel esegue). Una voce sola in `ONBOARDING.yaml` per tutto il ciclo di vita: `domanda` per ciò che manca, `convenzione` per ciò che hai dedotto (stop inverso, avvolgimento `nohup`), con i file in `evidence` e `architecture.yaml` in `applied_in`. Fonti che si contraddicono: `domanda` con entrambi i percorsi.

## Esempio (i valori sono solo ESEMPI)

App Node con Compose e Drizzle, altre chiavi delle istanze omesse:

```yaml
# Evidenze: docker-compose.yml, package.json, drizzle.config.ts, drizzle/0000_init.sql
lifecycle:
  setup: npm ci
  start: docker compose up -d --build    # TORNA: la prontezza sta nei healthcheck
  stop: docker compose down
instances:
  postgres:
    kind: database
    healthcheck: { type: tcp, host: 127.0.0.1, port: 5432, timeout_seconds: 60 }   # porta letta in docker-compose.yml
    data:
      migrations: npm run db:migrate     # script che lancia drizzle-kit migrate
      seed: npm run db:seed
  web:
    kind: backend
    healthcheck: { type: http, url: http://127.0.0.1:3000/api/health, expected_status: 200, timeout_seconds: 90 }
```
