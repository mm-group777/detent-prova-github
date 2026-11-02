# La ricetta dell'ambiente

Sta in `blueprint/deployment.yaml` con `schema_version: 3`: comandi e strumenti per far girare il progetto. Qui la forma e come si compila da un repository che esiste già; i controlli li fa `factory blueprint validate`. È l'unico posto dei comandi: niente tabella in `CONTEXT.md`, niente voci `prerequisite` in `ONBOARDING.yaml`.

Chi la legge dopo di te: il comando `test` viene provato sulla base e poi diventa la regressione dei blocchi di lavoro; l'app calcola gli strumenti mancanti da `tools` e dai programmi dei comandi; `factory env check` controlla quali variabili richieste mancano nell'ambiente della persona, guardando solo i nomi; il controllo delle skill proposte ammette solo i comandi `test`, `build` ed `e2e`.

## Forma

```yaml
schema_version: 3
environments:
  development:
    kind: development
    location: local
    commands:
      install: { status: derived, command: npm ci, evidence: [package.json, package-lock.json] }
      test: { status: derived, command: npm test, evidence: [package.json, .github/workflows/ci.yml] }
      e2e: { status: convention, command: npx playwright test, evidence: [] }
      start: { status: not_found, evidence: [] }
    services: [web, postgres]
    variables:
      - { name: DATABASE_URL, secret: true, purpose: stringa di connessione al database, evidence: [.env.example, docker-compose.yml] }
      - { name: PORT, secret: false, purpose: porta del server locale, evidence: [.env.example] }
tools:
  - { name: node, check: tool }
  - { name: docker-acceso, check: manual, note: Serve Docker acceso per i servizi di prova. }
publish: { status: derived, command: npm run release, evidence: [package.json] }
```

Le altre chiavi del contratto di deploy restano com'erano. Un deploy di schema 2: porta `schema_version` a 3, togli `runtime`, `container_runtime` e `orchestration` (nello schema 3 non sono ammesse) e scrivi in `tools` ciò che dicevano solo se un file lo prova.

## Ogni voce di comando

- `status: derived`: un file dice proprio quel comando (script di `package.json`, target del Makefile, passo della CI, Compose, README di setup); `evidence` elenca quei file (esistono, percorsi relativi, al massimo 20).
- `status: convention`: è il comando usuale dello strumento che il progetto usa (la sua configurazione c'è nei file) ma nessun file lo scrive. Se nemmeno lo strumento è provato, è `not_found`.
- `status: not_found`: non c'è. Niente `command`.
- Il `command` è quello che il progetto usa davvero, preferibilmente una riga che esiste già in un file (uno script nominato, un target del Makefile). Se la CI o il Makefile usano una sequenza di shell e non esiste una forma più semplice in un file, `not_found` e una `domanda` nelle conferme: non riscriverla a mano.
- Mai inventare un comando o un valore, mai eseguire nulla per scoprirlo: leggi solo i file.

## Il comando test

È quello che il progetto usa davvero per le sue prove, intero: sarà provato sulla base e poi sarà la regressione di ogni blocco. Non ridurlo a un file solo o a una scorciatoia per farlo passare. Se le prove sono più suite che non stanno in un comando già scritto in un file, scrivi la principale come `test` e aggiungi una `domanda` che dice quali prove restano fuori dalla regressione.

## Dove vanno

- `development`: i comandi per lavorare in locale (`install`, `build`, `test`, `e2e`, `start`). `services`: gli id delle istanze di `architecture.yaml` che girano lì (scrivili dopo le istanze), mai porte o indirizzi copiati.
- `test`: comandi solo se un file (CI, Compose di prova) ne dichiara di diversi. `staging` e `production`: nessun comando e nessuna `variables`.
- `publish`, al livello alto: come il progetto pubblica, solo se un file lo dichiara; è documentato e nessuno lo esegue. Senza prova, ometti la chiave.
- `tools`: `{ name, check, note }`. `check: tool` cerca un programma nel PATH; `check: manual` è ciò che una macchina non controlla (Docker acceso, un servizio esterno) e vuole una `note`. Mai per un servizio che il progetto usa nel collaudo (database, posta, code): quello lo accende il collaudo, con il compose del progetto o un servizio della ricetta (vedi [ciclo-di-vita.md](ciclo-di-vita.md)). Scrivi solo ciò che un file prova che serve e non ripetere i programmi dei comandi, già contati dal kernel.
- Interprete del `setup` ([ciclo-di-vita.md](ciclo-di-vita.md)): va in `tools` con la versione che i file del progetto dicono, mai inventata.
  Un programma nel PATH è `check: tool`; se lo trova un gestore come uv, `check: manual` con la `note`: serve già sul computer, uv non lo scarica.

## Variabili d'ambiente

Negli ambienti `development` e `test` la chiave facoltativa `variables` elenca i NOMI delle variabili che servono per avviare il progetto e lanciarne le prove; `factory env check` dice quali mancano guardando solo i nomi. Un progetto che si ferma al collaudo per una variabile mai elencata è il guasto che questa sezione evita.

Ogni voce ha le sole chiavi `name`, `secret` (booleano: `true` per chiavi, token, password, segreti di firma o sessione, stringhe di connessione con credenziali), `purpose` (una riga in italiano semplice, mai un valore né il segno «=») ed `evidence` (da 1 a 20 file che nominano proprio quella variabile). Una voce per variabile e per ambiente; `test` solo per le variabili che servono alle sole prove.

I nomi si cercano nei file, mai eseguendo il progetto: i file di esempio (`.env.example` e simili, che sono spesso incompleti), il codice che li legge (`process.env.NOME`, `os.environ`, `ENV[...]` e forme simili, con una ricerca per nome e mai per riga intera), Compose e Dockerfile, Makefile e script, la CI, la configurazione dei test. Una variabile letta da un servizio che la suite lancia conta anche se quel servizio non è un'istanza. Entra ogni nome letto senza valore di ripiego e richiesto per avviare o provare; quelli con un ripiego sicuro si possono lasciare fuori citandoli con il file in una `domanda`. Nel dubbio tra segreta e non segreta scrivi `true`.

Regole dure: mai un valore, nemmeno quello di esempio; mai aprire i file `.env` veri (`.env`, `.env.local`, `.env.production`: con `rg --hidden` escludili) ma solo i file di esempio; mai inventare un nome che nessun file nomina.

## Dopo averla scritta

`factory blueprint compile .`, poi `factory blueprint validate . --ready` (stampa tutti gli errori insieme: correggili in blocco). Nelle conferme: una `evidenza` di riepilogo per l'ambiente, una sola `convenzione` per i passi `convention`, una `domanda` per ogni passo `not_found` che conta (soprattutto `test`), per le sequenze di shell non riducibili, per le prove lasciate fuori dalla regressione e per le variabili lasciate fuori dall'elenco. Gli strumenti non diventano voci. Un nome richiesto che manca su questo computer non è un errore della ricetta: lo dice `factory env check`.
