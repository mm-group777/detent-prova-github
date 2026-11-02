# Comandi del collaudo d'architettura (lifecycle di architecture.yaml): li esegue il runner, non la persona.
# install prepara le radici dei servizi (npm ci).
# up avvia sempre il codice corrente: prima ferma uno stack già avviato da un up precedente (senza, i server nuovi troverebbero le porte
# occupate dal vecchio e le risposte verrebbero dal codice vecchio), poi controlla che ci siano gli strumenti (curl, pgrep e ps, con un ps che
# sa leggere lo stato di un processo, e un modo di leggere la cartella di lavoro di un processo): se ne manca uno up si ferma subito, prima
# delle build. Poi costruisce server e interfaccia dal sorgente (una build lasciata da install o da un avvio precedente non ha le operazioni
# nuove dei task e l'interfaccia riceverebbe 404) e, subito prima di avviare, controlla che sugli indirizzi di controllo non risponda già un
# altro programma: se la porta è di un altro, up non avvia nulla. Poi avvia i server in background e annota per ognuno, nel suo file .pid, il
# numero di processo e la cartella di lavoro che ha davvero. Torna solo quando tutti i processi sono vivi e rispondono ai loro indirizzi, al
# più dopo STACK_WAIT secondi. Un server che muore, anche dopo qualche secondo, o che non risponde in tempo fa fallire up: dice quale, con le
# ultime righe del suo log, ferma ciò che aveva avviato ed esce con errore.
# down ferma tutto ciò che up ha avviato: ogni server con i processi che ha lanciato (npm lancia node, e fermare solo npm può lasciare il
# server vivo sulla porta) e aspetta che siano usciti, così un up subito dopo trova le porte libere. Per ogni file .pid in node_modules/.stack
# guarda il processo del suo pid:
#   vivo con la cartella annotata da up: è il server, lo ferma e solo dopo toglie il pid (se non si ferma, il pid resta e down fallisce);
#   vivo ma con una cartella che non si legge, o che up non aveva annotato: non può sapere se è il server, quindi non lo tocca, tiene il pid e fallisce;
#   vivo con un'altra cartella (numero di processo riusato da un altro programma o da un altro progetto) oppure non più vivo: toglie il pid e lo dice.
# Le cartelle si confrontano per dispositivo e numero di inode, non per percorso scritto: lettere accentate, maiuscole diverse, collegamenti e
# lingua dell'ambiente non cambiano l'esito. Si leggono da /proc (Linux) o con lsof (macOS, dove sta in /usr/sbin).
# Il Makefile usa curl, pgrep e ps (gli ultimi due sono del pacchetto procps, che nelle immagini Docker slim e in Alpine va installato: il ps di
# BusyBox non legge lo stato di un processo, e up lo rifiuta) e legge la cartella dei processi da /proc o con lsof. up controlla che ci siano
# prima delle build e di avviare qualunque server; se pgrep o ps mancano a down, un server vivo non si ferma (sarebbe fermato solo npm, non il
# server che ha lanciato) e down fallisce dicendolo, una volta sola anche se i server vivi sono più d'uno.
# Pid e log di servizio stanno in node_modules/.stack: Git ignora node_modules, quindi dopo up e down l'albero resta pulito
# (start-contract, integrate-contract e promote-dev rifiutano un albero con file non registrati).
#
# Per adattare il Makefile a un altro progetto cambia sempre insieme tre cose: i comandi di avvio, le cartelle dei server (nelle righe di install
# e di up, per esempio cd backend && ...) e l'elenco STACK_SERVICES, in cima al file, con una voce nome=indirizzo per servizio: gli indirizzi
# devono restare uguali agli healthcheck di architecture.yaml, porte comprese. Se i servizi non sono due, togli o aggiungi insieme le righe del
# servizio in install e in up (npm ci, build e avvio) e la sua voce in STACK_SERVICES: le funzioni di shell leggono l'elenco e down ferma ciò
# che up ha annotato, quindi non si toccano. Se la voce di un servizio manca da STACK_SERVICES, down lo ferma lo stesso (segue i file .pid), ma
# up non lo aspetta, non si accorge se muore e non controlla il suo indirizzo: l'avvio può riuscire con un servizio che non risponde. Una voce
# senza le righe di avvio in up, al contrario, fa fallire up, che lo dice. backend e frontend sono solo i nomi dei servizi (per l'elenco, per i
# file .pid e .log in node_modules/.stack e per i messaggi): possono restare anche se le cartelle si chiamano in un altro modo, ma lo stesso
# nome va scritto uguale nell'elenco e nei file .pid e .log delle righe di up.
# I target build e test hanno una riga per radice (sono i comandi della ricetta dell'ambiente): aggiungi o togli anche lì la riga del servizio,
# con il suo npm run build e il suo npm test.
# Il processo avviato da up deve restare nella cartella da cui parte: up ne annota la cartella una volta sola, subito dopo l'avvio, e down
# riconosce il server da quella. Se il processo poi cambia cartella da solo (un server lanciato direttamente che chiama chdir), down non lo
# riconosce più e lo lascia vivo; npm invece resta dove è partito. Se serve un'altra cartella, il cd si fa nella riga di up, prima di
# avviare il server (i percorsi di .log e .pid in quella riga si contano dalla cartella del cd).
# build, test ed e2e sono i comandi della ricetta dell'ambiente (blueprint/deployment.yaml, schema 3), che accetta un solo comando semplice per
# voce: niente cd ... && ... nella ricetta, quindi i comandi delle due radici stanno qui. build e test entrano nelle due radici (backend e
# frontend); e2e è il collaudo d'architettura, l'unico che percorre gli spec di sistema (avvia lui lo stack con up e down).
.PHONY: install build test e2e up down

STACK := node_modules/.stack
# I servizi, uno per voce: nome=indirizzo di controllo. Gli indirizzi sono quelli degli healthcheck di architecture.yaml: se cambiano là,
# cambiano anche qui.
STACK_SERVICES := backend=http://127.0.0.1:8000/health frontend=http://127.0.0.1:3000
# L'elenco con ogni voce tra apici, come lo legge la shell: un indirizzo con & o ? non la confonde.
STACK_QUOTED = $(foreach service,$(STACK_SERVICES),'$(service)')
# Secondi che up aspetta, al massimo, che i server rispondano (il runner ne concede 60 a ogni healthcheck). Anche questo e l'elenco si
# cambiano da riga di comando: make STACK_WAIT=10 up.
STACK_WAIT := 60

# Funzioni di shell dello stack, con un prefisso che non coincide con nessun programma di sistema (halt e tree lo sono).
# stack_alive: il processo c'è ancora (uno zombie no, e un valore che non è un numero di processo non vale: kill 0 e kill -1 toccherebbero altro).
# Lo stato lo dà ps, ma l'ultima parola è di kill -0: se un genitore raccoglie il processo tra le due chiamate, ps non stampa nulla e il processo
# non c'è più (a guardare solo ps, un risultato vuoto sembrerebbe un processo vivo che non è uno zombie).
# stack_tree: un processo e tutti quelli che ha avviato. stack_gone: nessuno di quelli indicati è più vivo.
# stack_cwd: la cartella di lavoro di un processo come due numeri (dispositivo e inode); non stampa nulla se non si legge.
# stack_read: legge il file .pid di un server (numero di processo e cartella annotata, vuoti se mancano). stack_started: i nomi dei server che
# hanno un file .pid. stack_save: dopo l'avvio annota, accanto al numero di processo di ogni server, la sua cartella di lavoro di adesso.
# stack_stop: ferma un albero di processi (SIGTERM, dopo 10 secondi SIGKILL a quelli rimasti) e dice se sono usciti tutti.
# stack_need: ci sono i programmi indicati, altrimenti dice quale manca. stack_psok: ps sa leggere lo stato di un processo (quello di BusyBox,
# in Alpine senza procps, no: non vedrebbe gli zombie e down aspetterebbe per niente server già morti).
# stack_can: down può fermare anche i processi che npm lancia, cioè ci sono pgrep e ps e ps funziona; lo controlla una volta sola, alla prima
# occasione, e dice una volta sola cosa manca.
# stack_halt: i tre casi di down descritti sopra, per ogni server con un file .pid; il pid si toglie solo dopo aver fermato il processo o aver visto
# che non è il server. Prima di fermare un server controlla stack_can: senza, lascerebbe vivi i processi che npm lancia.
# stack_names e stack_url: i nomi dei servizi e l'indirizzo di controllo di uno. Sono le sole funzioni che leggono STACK_SERVICES.
# stack_report: dice cosa non va in un server, con le ultime righe del suo log.
# stack_tools: ci sono gli strumenti (curl, pgrep, ps che funziona e un modo di leggere la cartella di un processo); up lo chiede prima delle build.
# stack_free: nessun altro programma risponde già sugli indirizzi di controllo; up lo chiede subito prima di avviare. stack_ready: tutti i server
# rispondono e, subito dopo la risposta, sono ancora vivi, entro STACK_WAIT secondi; un server morto a qualunque giro, o che up non ha avviato,
# fa fallire l'attesa. Le chiamate a curl escludono il proxy (--noproxy): un http_proxy dell'ambiente non vale per 127.0.0.1.
SHELL_STACK = stack_alive() { case "$$1" in ''|*[!0-9]*|0) return 1;; esac; case "$$(ps -o stat= -p "$$1" 2>/dev/null)" in Z*) return 1;; esac; kill -0 "$$1" 2>/dev/null; }; \
  stack_tree() { echo "$$1"; for child in $$(pgrep -P "$$1" 2>/dev/null); do stack_tree "$$child"; done; }; \
  stack_gone() { for p in "$$@"; do if stack_alive "$$p"; then return 1; fi; done; return 0; }; \
  stack_cwd() { if [ -e "/proc/$$1/cwd" ]; then stat -L -c '%d %i' "/proc/$$1/cwd"; else echo $$(PATH="$$PATH:/usr/sbin" lsof -a -p "$$1" -d cwd -FDi | sed -n 's/^[Di]//p'); fi 2>/dev/null; }; \
  stack_read() { pid=; cwd=; { read -r pid cwd < $(STACK)/$$1.pid; } 2>/dev/null; }; \
  stack_started() { for file in $(STACK)/*.pid; do if [ -e "$$file" ]; then basename "$$file" .pid; fi; done; }; \
  stack_save() { for name in $$(stack_started); do stack_read "$$name"; [ -z "$$pid" ] || echo "$$pid $$(stack_cwd "$$pid")" > $(STACK)/$$name.pid; done; }; \
  stack_stop() { pids=$$(stack_tree "$$1"); kill $$pids 2>/dev/null; n=0; \
    while [ $$n -lt 50 ] && ! stack_gone $$pids; do sleep 0.2; n=$$((n + 1)); done; \
    if ! stack_gone $$pids; then for p in $$pids; do stack_alive "$$p" && kill -9 "$$p" 2>/dev/null; done; sleep 1; fi; \
    stack_gone $$pids; }; \
  stack_need() { for tool in "$$@"; do command -v "$$tool" >/dev/null || { echo "Manca il programma $$tool: il Makefile usa curl per controllare i server, pgrep e ps (pacchetto procps) per fermare anche i processi che npm lancia." >&2; return 1; }; done; }; \
  stack_psok() { [ -n "$$(ps -o stat= -p "$$$$" 2>/dev/null)" ] || { echo "Il programma ps di questo sistema non sa leggere lo stato di un processo (ps -o stat= -p): senza, il Makefile non riconosce i processi zombie e non sa se un server si è fermato. Con il ps di BusyBox (Alpine) installa il pacchetto procps." >&2; return 1; }; }; \
  stack_can() { [ -n "$$can" ] || { if stack_need pgrep ps && stack_psok; then can=yes; else can=no; fi; }; [ "$$can" = yes ]; }; \
  stack_halt() { failed=; for name in $$(stack_started); do \
    stack_read "$$name"; \
    if stack_alive "$$pid"; then \
      now=$$(stack_cwd "$$pid"); \
      if [ -z "$$now" ] || [ -z "$$cwd" ]; then echo "Non so se il processo $$pid è il server $$name: la sua cartella di lavoro non si legge, oppure up non l'aveva annotata. Non lo fermo e il suo pid resta in $(STACK)/$$name.pid: se è il server fermalo tu, poi rilancia." >&2; failed=1; continue; fi; \
      if [ "$$now" != "$$cwd" ]; then echo "Il processo $$pid non è il server $$name (la sua cartella di lavoro non è quella con cui il server è partito): non lo fermo e tolgo il pid. Se invece è il server e ha cambiato cartella da solo, fermalo tu." >&2; \
      elif ! stack_can; then echo "Non fermo il server $$name (processo $$pid) e il suo pid resta in $(STACK)/$$name.pid: installa i programmi che mancano, o fermalo tu, poi rilancia." >&2; failed=1; continue; \
      elif ! stack_stop "$$pid"; then echo "Il server $$name (processo $$pid) non si ferma: il suo pid resta in $(STACK)/$$name.pid." >&2; failed=1; continue; fi; \
    elif [ -n "$$pid" ]; then echo "Il server $$name (processo $$pid) non è più in esecuzione: tolgo il suo pid." >&2; fi; \
    rm -f $(STACK)/$$name.pid; \
  done; [ -z "$$failed" ]; }; \
  stack_names() { for entry in $(STACK_QUOTED); do echo "$${entry%%=*}"; done; }; \
  stack_url() { for entry in $(STACK_QUOTED); do if [ "$${entry%%=*}" = "$$1" ]; then echo "$$entry" | sed 's/^[^=]*=//'; fi; done; }; \
  stack_report() { echo "Il server $$1 $$2 Ultime righe di $(STACK)/$$1.log:" >&2; tail -n 20 $(STACK)/$$1.log >&2; }; \
  stack_tools() { stack_need curl pgrep ps && stack_psok || return 1; \
    [ -n "$$(stack_cwd "$$$$")" ] || { echo "Non riesco a leggere la cartella di lavoro di un processo (serve /proc oppure lsof): senza, down non potrebbe riconoscere i server e up non li avvia." >&2; return 1; }; }; \
  stack_free() { for name in $$(stack_names); do \
      if curl -s -o /dev/null --max-time 2 --noproxy '*' "$$(stack_url "$$name")"; then \
        echo "Sull'indirizzo del server $$name ($$(stack_url "$$name")) risponde già un altro programma: la porta è occupata e up non avvia nulla." >&2; return 1; \
      fi; \
    done; return 0; }; \
  stack_ready() { end=$$(( $$(date +%s) + $(STACK_WAIT) )); \
    while :; do \
      waiting=; \
      for name in $$(stack_names); do curl -fs -o /dev/null --max-time 2 --noproxy '*' "$$(stack_url "$$name")" || waiting="$$waiting $$name"; done; \
      for name in $$(stack_names); do \
        stack_read "$$name"; \
        [ -n "$$pid" ] || { echo "Il server $$name è nell'elenco STACK_SERVICES, ma up non lo ha avviato: manca $(STACK)/$$name.pid. L'elenco e le righe di up devono nominare gli stessi servizi." >&2; return 1; }; \
        stack_alive "$$pid" || { stack_report "$$name" "si è fermato dopo l'avvio (di solito una porta occupata da un altro programma, o un errore all'avvio)."; return 1; }; \
      done; \
      [ -z "$$waiting" ] && return 0; \
      [ "$$(date +%s)" -lt "$$end" ] || break; \
      sleep 1; \
    done; \
    for name in $$waiting; do stack_report "$$name" "non risponde su $$(stack_url "$$name") dopo $(STACK_WAIT) secondi."; done; return 1; }

# Un servizio ha una riga in install (npm ci) e due in up (build e avvio). Il nome dei suoi file .pid e .log è quello della sua voce in
# STACK_SERVICES.
install:
	cd backend && npm ci
	cd frontend && npm ci

build:
	cd backend && npm run build
	cd frontend && npm run build

test:
	cd backend && npm test
	cd frontend && npm test

e2e:
	factory architecture test .

up: down
	@$(SHELL_STACK); stack_tools
	mkdir -p $(STACK)
	cd backend && npm run build
	cd frontend && npm run build
	@$(SHELL_STACK); stack_free
	cd backend && (npm run start > ../$(STACK)/backend.log 2>&1 & echo $$! > ../$(STACK)/backend.pid)
	cd frontend && (npm run start > ../$(STACK)/frontend.log 2>&1 & echo $$! > ../$(STACK)/frontend.pid)
	@$(SHELL_STACK); stack_save; stack_ready || { stack_halt; exit 1; }

down:
	@$(SHELL_STACK); stack_halt
