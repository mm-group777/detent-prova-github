# Formato di `ONBOARDING.yaml`

File nella radice del repository. È un contratto di parsing, come `PROGRESS.md`: l'app lo legge e lo mostra alla persona nella schermata delle conferme. Chiavi, nomi delle classi e forma non si cambiano e non si traducono. Le chiavi di primo livello sono `version`, `generated_by`, `items` e la sola facoltativa `skills`: un'altra chiave, o una chiave obbligatoria mancante, rende il file illeggibile.

Cosa NON è una voce. Gli strumenti e i prerequisiti (programmi da avere, servizi, ambienti da preparare, Docker acceso) non si scrivono come voci: stanno come `tools` nella ricetta di `blueprint/deployment.yaml` ([ricetta.md](ricetta.md)). Non esiste una classe `prerequisite`. La scelta del motore e del modello (gli agenti del progetto) non la scrive l'agente: la propone l'app.

```yaml
version: 1
generated_by: adopt-interview
items:
  - id: C01
    class: domanda
    topic: "Perimetro del contratto (campione)"
    question: "Il contratto descrive 5 tabelle su circa 100 e 4 operazioni API: va bene come campione?"
    recommended: "Accettare il campione e ampliarlo con i primi lavori che toccano le altre parti."
    evidence:
      - docs/architecture.md
      - src/models/
    applied_in:
      - blueprint/database.yaml
      - blueprint/backend.yaml
      - blueprint/api.yaml
  - id: C02
    class: domanda
    topic: "Versione del database"
    question: "Le fonti indicano versioni diverse: quale deve essere il riferimento?"
    recommended: "16, usata dallo script di provisioning del sistema operativo di riferimento."
    evidence:
      - scripts/provision.py
      - Dockerfile
    applied_in:
      - blueprint/database.yaml
    decision:
      inputs:
        - id: version
          label: "Versione PostgreSQL di riferimento"
          target:
            file: blueprint/database.yaml
            path: [technology, version]
            expected_exists: true
            expected: undecided
          options:
            - id: provisioned
              label: "PostgreSQL 16, usata dal provisioning principale"
              value: "16"
              evidence: [scripts/provision.py]
            - id: container
              label: "PostgreSQL 18, usata dal contenitore di sviluppo"
              value: "18"
              evidence: [Dockerfile]
          allow_custom: true
skills:
  - name: progetto-prove
    path: .factory/proposals/skills/progetto-prove
    purpose: "Come si scrivono e si lanciano le prove di questo progetto."
```

## Chiavi

- `version`: sempre `1`. `generated_by`: sempre `adopt-interview`. `items`: lista, mai vuota.
- `id`: `C01`, `C02`, ... in ordine, senza buchi né doppioni. La prima voce, `C01`, è sempre il riepilogo del perimetro (campione dichiarato), con classe `domanda`.
- `class`: uno tra `decisa-per-i-controlli`, `convenzione`, `domanda`, `evidenza`.
- `topic`: titolo breve. `question`: la domanda alla persona, una riga. `recommended`: la risposta consigliata, una riga.
- `evidence`: lista di percorsi di file consultati, relativi alla radice del repository. Vuota è ammesso solo per `domanda`.
- `applied_in`: lista dei file `blueprint/*.yaml` o `architecture.yaml` dove il valore è scritto (per una `domanda` lasciata `undecided`, dove il campo resta aperto). Vuota solo se la voce non tocca nessun file.
- `decision` (facoltativa, solo su `domanda`): come l'app applica la risposta senza rilanciare l'agente. Ogni `inputs` ha un `id` breve, una `label` per la persona, un solo `target`, le `options` ricavate dalle evidenze e `allow_custom`. Non scriverla quando la domanda chiede solo una conferma editoriale o non sai indicare con precisione il campo da aggiornare.
- `target.file` è `architecture.yaml` o un file `blueprint/*.yaml` già elencato in `applied_in`; `target.path` è il percorso delle chiavi YAML. Per una voce dentro una lista usa il suo indice numerico solo se quella voce esiste già: l'app non inventa liste né indici. `expected_exists: true` richiede anche `expected`, uguale al valore attuale; `expected_exists: false` dichiara che la chiave non esiste e non porta `expected`. In questo modo l'app rifiuta una risposta se il file è cambiato nel frattempo. I campi intermedi a oggetto possono mancare, ma la risposta non sostituisce mai un campo esistente diverso da `expected`.
- Ogni proposta ha soltanto `id`, `label`, `value`, `evidence`. `evidence` è un sottoinsieme non vuoto delle evidenze della domanda e prova proprio quel valore. `value` è uno scalare YAML o una lista di testi; i comandi di `lifecycle.start` e `lifecycle.stop` sono sempre stringhe, perché questo è il tipo del contratto. `allow_custom: true` aggiunge una risposta testuale libera per le decisioni che le fonti non coprono. Mai mettere in un'opzione credenziali, valori di `.env` o testo non ricavato dalle evidenze.
- Una proposta con valore vuoto (lista `[]` o testo `""`) non è una scelta vera: se è l'unica proposta della domanda, l'input ha `allow_custom: true`, così la persona può scrivere la risposta (per esempio i responsabili del progetto, quando nessun file li nomina). Mai `allow_custom: false` con le sole proposte vuote.

```yaml
          options:
            - id: nessuno
              label: "Nessuno indicato nei file"
              value: ""
              evidence: [README.md]
          allow_custom: true
```
- `applied` dentro un input è riservato all'app: dopo controlli rossi conserva la proposta o il testo già applicato, così la persona può correggerlo. Non scriverlo tu.
- Una domanda può avere più input, per esempio `start` e `stop`, ciascuno col suo target. Due input non possono scrivere lo stesso campo né campi sovrapposti, dove uno contiene l'altro. Per un lifecycle assente usa due target con `expected_exists: false`, `path: [lifecycle, start]` e `path: [lifecycle, stop]`: l'app crea la struttura padre senza sostituire altre chiavi. Lo stop proposto deve fermare solo il PID scritto dallo start, come in [ciclo-di-vita.md](ciclo-di-vita.md).
- `resolved` è riservato all'app: dopo controlli verdi sostituisce `decision` e conserva id, label e risposta effettivamente applicata. Non scriverlo tu e non lasciare insieme `decision` e `resolved`.
- Ogni testo su una sola riga, tra virgolette doppie (nei testi compaiono due punti e apici). Percorsi senza virgolette. Niente valori sensibili: solo nomi di variabili.
- `skills` (facoltativa, può mancare o essere vuota): le skill del progetto che hai scritto e che hanno passato `factory skill lint` ([skill-proposte.md](skill-proposte.md)); se `factory` non è disponibile (uscita 127) elenca comunque quelle che hai scritto secondo la forma fissa: le controlla chi ti ha lanciato. Al massimo 2 voci, ognuna con le sole chiavi `name` (`progetto-...`, uguale alla cartella), `path` (esattamente `.factory/proposals/skills/<name>`) e `purpose` (una riga, tra virgolette doppie, al massimo 200 caratteri, in italiano semplice). Non sono voci da confermare: la persona legge il testo vero della skill. Una skill cancellata perché il controllo la rifiutava non compare qui: diventa una `domanda`.

## Le classi

- `decisa-per-i-controlli`: valore scelto da te solo per far passare un controllo del kernel, senza evidenza che lo imponga. Esempi: una versione scelta fra più possibili, un nome (id, journey, ambiente) scelto da te perché il formato lo impone, l'accesso dell'agente impostato a `none`, la cartella di design puntata a una cartella esistente. Nella raccomandazione dì quali erano le alternative e perché hai scelto quella.
- `convenzione`: valore ricavato da una regola del progetto (regole, skill, guida per i contributori) o dal comando usuale di uno strumento, ma non da un file che lo dichiara. Esempi: lo scheletro del flusso Git della fabbrica in `blueprint/git.yaml`, quando il repository lavora in un altro modo; i passi della ricetta con `status: convention` (una sola voce per tutti).
- `domanda`: ciò che non hai potuto ricavare o che i file contraddicono. Il campo resta `undecided` o vuoto. Se sai identificare il campo esatto e almeno una risposta provata, aggiungi `decision`; se serve una scelta che nessun file prova, aggiungi l'input col testo libero. Anche un controllo rimasto rosso e un ostacolo del kernel sono `domanda`, con topic che comincia per "Controllo rosso: " o "Ostacolo del kernel: ".
- `evidenza`: ciò che hai ricavato con prova. Voce breve, un riepilogo per area (database, backend, API, frontend, test, infrastruttura, deploy, sicurezza), mai una per riga di un file.

## Esempio: istruzioni agli assistenti

Le regole compatibili di un file di istruzioni agli assistenti hanno una sola voce `convenzione`; ogni file con regole in contrasto col metodo ha una voce `domanda`, con file e riga ricavati dal file vero. Entrambe con `applied_in` vuoto e senza `decision`: nessun campo dei contratti cambia. Il testo parla alla persona (si dice «progetto») e riassume in poche parole, non copia ([istruzioni-agenti.md](istruzioni-agenti.md)).

```yaml
  - id: C09
    class: convenzione
    topic: "Convenzioni dichiarate dal progetto per gli assistenti"
    question: "Lo stile del codice e i nomi scritti in AGENTS.md (righe 12 e 15) sono riportati in CONTEXT.md come convenzioni del progetto: vanno bene?"
    recommended: "Confermarle: coincidono con la configurazione di stile che il progetto già usa."
    evidence:
      - AGENTS.md
      - .prettierrc.js
    applied_in: []
  - id: C10
    class: domanda
    topic: "Istruzioni agli assistenti in contrasto con il metodo: AGENTS.md"
    question: "AGENTS.md chiede di annullare ogni modifica oltre 10 righe e di avvisare la persona (righe 26 e 32); gli agenti di lavoro leggono il file da soli, quindi il limite resterebbe attivo. Come si procede?"
    recommended: "Decidere prima di avviare il lavoro: la fabbrica non modifica il file, quindi o lo adatti tu o accetti il limite."
    evidence:
      - AGENTS.md
    applied_in: []
```

## Come tenerlo vero

- Poche voci `decisa-per-i-controlli` e `domanda`: in totale di norma meno di 12. Raggruppa le affini (una voce sulle porte, non una per porta) e tieni quelle che cambiano il significato del contratto.
- Se hai scritto un valore e non sai citare il file che lo prova, non è un'`evidenza`: è una `convenzione`, una `decisa-per-i-controlli` o va tolto.
- Se un valore è contraddetto da un altro file (versioni diverse, comando diverso), non scegliere: `domanda`, con entrambi i percorsi in `evidence`.
- Per ogni `domanda` che lascia un campo `undecided` o assente, prova a scrivere la `decision` strutturata. Le label parlano della scelta umana, non di YAML. Le opzioni coprono solo i candidati osservati nei file; non trasformare la raccomandazione in un valore se non ha evidenza.
- Per la ricetta dell'ambiente: una `evidenza` di riepilogo, una `convenzione`, e una `domanda` per ogni passo `not_found` che conta (soprattutto la prova), per le sequenze di shell non riducibili e per le prove lasciate fuori dalla regressione. Se un file di istruzioni agli assistenti ha regole in contrasto con il metodo, una `domanda` per file ([istruzioni-agenti.md](istruzioni-agenti.md)).
- Il perimetro (`C01`) dice in chiaro cosa è dentro il campione e cosa no, con i numeri veri che hai contato.
- Rileggi il file prima di chiudere: classi scritte esatte, id progressivi, `evidence` non vuota fuori da `domanda`, ogni percorso citato esiste davvero. Se c'è un parser YAML nell'ambiente, fallo leggere.
