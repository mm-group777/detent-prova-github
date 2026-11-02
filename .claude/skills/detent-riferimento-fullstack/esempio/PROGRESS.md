# Piano di riferimento

Esempio completo e minimo di progetto con interfaccia: una route, un flusso, un'operazione API, tre task. Nessuna approvazione del runner è stata eseguita.

## Blocco 0 - Genesi

- [ ] **T0.1** Intervista da confermare | deps: -
- [ ] **T0.2** PRD approvato dalla persona | deps: T0.1
- [ ] **T0.3** Piano approvato con gate umano | deps: T0.2
- [ ] **T0.4** Scaffold verificato | deps: T0.3

## Blocco 1 - Prenotazione online

- [ ] **T1.1** Operazione prenotaSlot sul server | deps: - | verify: `cd backend && npm test -- src/bookings`
  - Cartelle ammesse: `backend/src/**`, `backend/package.json`, `backend/package-lock.json`
  - Operazione prenotaSlot in backend/src/bookings, con archivio in memoria e contract test sulla specifica OpenAPI
- [ ] **T1.2** Pagina di prenotazione | deps: - | verify: `cd frontend && npm test -- src/features/booking`
  - Cartelle ammesse: `frontend/src/**`, `frontend/package.json`, `frontend/package-lock.json`
  - Route RT-prenota in frontend/src/app/prenota e funzione in frontend/src/features/booking; riferimento visivo DESIGN/prenotazione.html (design_ref della route), la fedeltà alla bozza fa parte del fatto
- [ ] **T1.3** Prenotazione dalla pagina al server | deps: T1.1, T1.2 | verify: `cd frontend && npm test -- src/integration`
  - Cartelle ammesse: `frontend/src/**`, `backend/src/**`, `tests/system-e2e/prenota.spec.ts`
  - Test di integrazione in frontend/src/integration (il client reale contro il server reale); lo spec di sistema lo percorre il collaudo finale del blocco, non questo verify

### Test utente

- [ ] **U1.1** Prenota uno slot libero dalla pagina
  - Scopo: verificare a mano AC-001 sul prodotto avviato
  - Precondizione 1: apri l'applicazione Terminale e posizionati nella cartella principale del progetto
  - File richiesto 1: `Makefile`
  - Comando 1: `make up`
  - Controllo comando 1: `test -f Makefile && make -n up`
  - Azione 1: copia il comando indicato sopra, incollalo nel Terminale e premi Invio; attendi che il Terminale torni disponibile
  - Azione 2: apri nel browser l'indirizzo http://127.0.0.1:3000/prenota
  - Azione 3: scrivi 18:00 nel campo Slot e premi Prenota una sola volta
  - Risultato atteso 1: la pagina si apre senza schermate bianche né messaggi di errore
  - Risultato atteso 2: compare il messaggio Prenotazione confermata
  - Evidenza 1: annota lo slot prenotato e conserva uno screenshot senza dati sensibili
- [ ] **U1.2** Prova a prenotare due volte lo stesso slot
  - Scopo: verificare a mano AC-002 sul prodotto avviato
  - Precondizione 1: completa U1.1 senza errori e lascia aperta la pagina di prenotazione
  - Azione 1: scrivi di nuovo 18:00 nel campo Slot e premi Prenota
  - Risultato atteso 1: al posto della conferma compare un messaggio di errore che dice che lo slot non è disponibile
  - Evidenza 1: annota il messaggio mostrato e conserva uno screenshot senza dati sensibili
