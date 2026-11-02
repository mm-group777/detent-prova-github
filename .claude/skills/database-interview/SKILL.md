---
name: database-interview
description: Intervista tecnica per creare o aggiornare blueprint/database.yaml con tecnologia, ambienti, connessioni, schema, relazioni, invarianti, migrazioni e test reali. Usare quando un progetto nuovo o esistente usa persistenza, quando lo schema non è documentato o prima di una modifica dati significativa.
---

# Database interview

Trattare `blueprint/database.yaml` come progetto versionato del database e fonte di verità per migrazioni, backend e test strutturali.

## Ricognizione

Ispezionare ORM/schema, migrazioni, seed, Compose, `.env.example`, query e test di integrazione. Ricostruire tabelle, colonne, tipi, nullability, default, chiavi, indici e relazioni dal codice. Non leggere o riportare valori di segreti: registrare solo nomi di variabili o riferimenti. Per versioni del motore, estensioni o fatti di cui non si ha conoscenza diretta usare `$tech-research`.

Presentare prima:

- fatti osservati;
- divergenze tra modelli, migrazioni e database dichiarato;
- elementi che richiedono conferma.

## Intervista

Per ogni tema proporre una risposta raccomandata con esempio e trade-off. Coprire:

1. motore, versione, estensioni e motivo della scelta;
2. posizione per ambiente: locale, container, servizio online o gestito;
3. ownership, `connection_env`, pool, TLS e confini di rete; lo stesso riferimento deve comparire come `via_env` nella connessione database di `architecture.yaml`; per PostgreSQL il ruolo applicativo è `NOSUPERUSER NOCREATEROLE`, proprietario del proprio schema e senza membership in `pg_execute_server_program`, `pg_read_server_files` o `pg_write_server_files`;
4. entità e tabelle, includendo per ogni colonna tipo, nullability, default, PK/FK/unique/check;
5. cardinalità, azioni `ON DELETE/UPDATE` e confini transazionali;
6. invarianti che devono vivere nel DB e invarianti applicative;
7. access pattern, indici, ordinamenti e query critiche;
8. volume, crescita, concorrenza, isolamento e idempotenza;
9. tool e percorso migrazioni, compatibilità, rollback e backfill;
10. seed, retention, cancellazione, backup, restore e disaster recovery;
11. permessi, dati sensibili, audit e cifratura;
12. prove: schema test, migrazione da zero, upgrade, insert→select reale e restore test.

Per PostgreSQL separare il bootstrap amministrativo dalla connessione applicativa: `DATABASE_URL` resta al ruolo dell'app e delle migrazioni DDL ordinarie; `DATABASE_BOOTSTRAP_URL` vive solo nella `.env.local` radice, mai nella `.env` comune, in `project.yaml env` e non negli `env_files` globali. Un figlio bootstrap di `lifecycle.setup` legge il file con il parser del progetto, consegna il valore solo al comando amministrativo e termina; crea ruolo e database solo se mancano, così da poter girare più volte di seguito con lo stesso esito. Prima di creare `.env.local` o inserire valori bootstrap esegui `git check-ignore -q -- .env.local`; se non è ignorato o è già tracciato, fermati, registra la domanda in `QUESTIONS.md` e chiedi un aggiornamento esplicito di `.gitignore`. Non scrivere credenziali, non aggiornare automaticamente `.gitignore` e non mutare altri file legacy. `lifecycle.start`, healthcheck, connessioni e suite non ricevono bootstrap. La verifica dei privilegi misura i flag `NOSUPERUSER NOCREATEROLE` e le tre membership `pg_execute_server_program`, `pg_read_server_files`, `pg_write_server_files`: una sola membership privilegiata invalida il modello.

Aggiornare progressivamente `database.yaml`, mantenendo `status: draft` finché restano decisioni aperte. Usare ID stabili per tabelle, relazioni e invarianti quando il formato li prevede.

## Modificare un database esistente

Non applicare DDL silenziosamente. Prima mostrare allo sviluppatore:

- differenza proposta rispetto alla revisione corrente;
- impatto su dati, backend, API, test e deployment;
- strategia di migrazione/backfill e compatibilità;
- rischio distruttivo e piano di rollback.

Dopo conferma, incrementare `blueprint/database.yaml → revision`, aggiornare il contratto e far dichiarare la modifica nel `database_impact` del Macro Contract. In sviluppo/test, l'approvazione del Macro Contract autorizza migrazione, backend e test correlati; staging/produzione richiedono un gate umano di release separato.

Una migrazione che cancella o riscrive i dati già salvati non la vede nessuna prova che crea i dati dopo averla applicata. Per una modifica allo schema scrivi quindi una prova di aggiornamento, accanto agli altri test del database (quelli del `migration_test` di `database.yaml`): su un database creato dalla prova applica le migrazioni fino alla penultima, inserisci righe con valori riconoscibili in ogni colonna che l'ultima tocca, applica l'ultima e rileggi. Ogni valore c'è ancora o è cambiato come il contratto dichiara. Con Prisma basta far girare `prisma migrate deploy` su una copia della cartella `prisma/` senza l'ultima migrazione, inserire le righe, rimettere l'ultima e rilanciare lo stesso comando; con altri strumenti vale lo stesso schema. Togliere o ricreare una colonna (anche copiando i dati) conta come distruttivo e va dichiarato come tale.

Portare a `ready` solo se i comandi di migrazione e verifica sono eseguibili. Ricompilare infine con `factory blueprint compile .`.
