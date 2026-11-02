---
name: prepare-human-review
description: Scrive le checklist del gate umano (`### Test utente`) per persone non tecniche. Usare nella pianificazione di ogni Onda/Blocco, quando un report `TEST-RESULTS/<blocco>.md` risulta scarno o cita file e comandi, e quando si corregge un collaudo non eseguibile.
---

# Preparare il collaudo umano

Scrivi da 2 a 7 prove manuali che una persona che non conosce Terminale, repository o architettura sa eseguire sul prodotto reale. Il runner le trasforma in una guida dentro `TEST-RESULTS/<blocco>.md` solo dopo aver verificato che i file richiesti esistano.

## Procedura

1. Leggi PRD, Blueprint, `architecture.yaml`, `CONTEXT.md`, task e verify del blocco, e usa solo schermate, dati, file e comandi che il progetto prevede davvero. Se esiste già `TEST-RESULTS/<blocco>.md`, leggilo (note dei KO comprese) senza modificarlo: appartiene al runner.
2. Separa ciò che i test automatici dimostrano già da ciò che richiede giudizio umano (comprensibilità, resa visiva, percorso percepito): il giudizio umano si scrive nell'Evidenza, mai come Risultato atteso. Non chiedere di ripetere test già verdi senza una ragione percettiva o di integrazione.
3. Scrivi ogni prova nel formato sotto, con ID stabili `U<onda>.<numero>`, frasi brevi e imperative, un'azione per riga, con etichette dell'interfaccia, dati da inserire e punto di arrivo espliciti. Rileggi tutto fingendo di non conoscere il progetto.
4. Un `Comando N` che non chiede la persona (parte, finisce e stampa un esito) lo deve aver lanciato qualcuno prima della consegna. Se il prodotto c'è già (un blocco aggiunto, la correzione di un KO), lancialo tu e riporta le righe che hai visto, con comando ed esito, nell'Evidence del task se dichiara un `file:<path>`, altrimenti nel messaggio del commit: l'`Evidenza N` del Test utente è della persona e `PROGRESS.md` non si tocca. Se il prodotto non c'è ancora, il comando entra nello script e2e del blocco (`macro-contract`) e lo lancia il collaudo.
5. Se il prodotto dichiara un ciclo di vita e delle journey, prima di consegnare lancia setup, avvio e journey come le lancia il collaudo (`factory architecture test .`), da un database vuoto, e scrivi l'esito nello stesso posto. I servizi li accende il collaudo (vedi `scaffold`): un servizio che non parte o una journey che non passa si correggono prima di consegnare. Nei blocchi prima del finale una journey di un flusso che nessun task chiuso ha ancora costruito può restare rossa: scrivila nell'esito con il task che la costruirà, non scrivere codice fuori dai task per farla passare.

## Formato obbligatorio

```markdown
### Test utente

- [ ] **U2.1** Avvia il prodotto con i dati dimostrativi
  - Scopo: verificare che una persona riesca a preparare il prodotto e riconoscere i dati caricati.
  - Precondizione 1: apri l'applicazione Terminale e posizionati nella cartella principale del progetto.
  - File richiesto 1: `Makefile`
  - Comando 1: `make seed-demo`
  - Azione 1: copia il comando indicato sopra, incollalo nel Terminale e premi Invio.
  - Azione 2: attendi che il Terminale mostri il messaggio conclusivo e torni disponibile; se appare un errore, non proseguire.
  - Azione 3: apri nel browser l'indirizzo locale del prodotto e seleziona Ordini dal menu principale.
  - Risultato atteso 1: la pagina mostra il titolo "Elenco ordini".
  - Risultato atteso 2: compare nell'elenco la riga "Ordine #12".
  - Evidenza 1: annota il numero dell'ordine visualizzato e conserva uno screenshot senza password o dati sensibili.
- [ ] **U2.2** Verifica la persistenza dopo il ricaricamento
  - Scopo: controllare che i dati restino disponibili dopo una nuova lettura.
  - Precondizione 1: completa U2.1 senza errori e lascia aperta la pagina dell'elenco ordini.
  - Azione 1: premi il pulsante di ricarica del browser e attendi che l'indicatore di caricamento scompaia.
  - Risultato atteso 1: compare ancora nell'elenco la riga "Ordine #12".
  - Evidenza 1: annota qualunque dato scomparso o cambiato e il momento esatto in cui accade.
```

Campi ammessi: `Scopo`, `Precondizione N`, `File richiesto N`, `Comando N`, `Azione N`, `Risultato atteso N`, `Evidenza N`. Non inventare altri campi: il parser è fail-closed.

## File e comandi

- Ogni file citato è un `File richiesto N` con percorso relativo interno al progetto (mai assoluto, `..` o glob). Ogni comando per la persona è un `Comando N`.
- Il runner non esegue i comandi umani e non li cerca nel PATH: li lancia la persona, e se uno non parte lo vede nel test e dà KO. Se un file richiesto manca, il report non viene creato e il checkpoint del blocco si riapre.

## Risultati attesi e KO

- Un Risultato atteso è una frase con un solo fatto osservabile, con esito certo per chiunque lo verifichi: un testo, un elemento presente o assente, un numero. Il testo della schermata sta tra virgolette, identico a come lo mostra il prodotto; mai un dato digitato dalla persona (dopo aver digitato Marta, "Ciao Marta" non dimostra il prodotto). Un negativo ha una sola clausola e il testo negato tra virgolette.
- Ciò che non si osserva con certezza (fedeltà a una bozza, layout, colori, focus, tempi, giudizi estetici, strumenti per sviluppatori) va nell'Evidenza, per esempio «apri la schermata reale accanto al file della bozza e annota le differenze di layout, colori e tipografia».
- Ogni azione ha almeno un risultato collegato. Ogni KO deve essere riproducibile: ID, numero dell'azione, dati usati, risultato ottenuto e atteso. Nessun segreto reale nel piano o nel report: indica dove trovare credenziali demo sicure.
