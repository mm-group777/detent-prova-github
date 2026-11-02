# PRD — detent-prova-github

Stato: approvato (2026-11-02, dalla persona in Detent)

## Problema

Serve un repository reale su cui verificare l'integrazione GitHub di Detent senza rischiare progetti veri.

## Utenti

Il team Detent che collauda l'integrazione GitHub. I file non nominano le persone: da confermare.

## Funzionalità

### Must (v1, ognuna con criteri di accettazione misurabili)

- Creare un branch sul repository di prova.
- Aprire una pull request verso il ramo di sviluppo.
- Eseguire i check dichiarati sulla pull request.
- Richiedere la firma prima del merge.

Queste funzionalità sono descritte dal README.md, ma nessun test o comando del repository le verifica oggi.

### Should / Could

Nessuna indicata nei file.

### Won't (esplicitamente fuori scope)

- Fornire un'applicazione eseguibile: nel progetto non c'è codice applicativo, né backend, né frontend, né database.

## Flussi chiave

1. Si crea un branch e si apre una pull request.
2. I check partono sulla pull request.
3. La firma viene richiesta prima del merge.
4. Il merge avviene solo dopo la firma.

## Vincoli tecnici e integrazioni (MCP inclusi)

- Il progetto usa Git e GitHub; il remote è dichiarato in `.git/config`.
- Non ci sono dipendenze applicative, database, servizi o variabili d'ambiente richieste.
- Le uniche istruzioni per gli agenti presenti sono quelle della fabbrica (`AGENT.md`); non ci sono file `AGENTS.md` o `CLAUDE.md` della persona.

## Criteri di accettazione del progetto

- [ ] AC-001: data una pull request verso il ramo di sviluppo, i check dichiarati girano e il merge richiede la firma (nessuna prova automatica presente nel repository).
