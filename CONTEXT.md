# CONTEXT — prova-consegna

Mappa del progetto per chi arriva con contesto vuoto (umano o agente). La compila la skill `scaffold`; la aggiorna chi cambia la struttura.

## Cos'è questo progetto

(1–3 righe dal PRD, dopo la genesi.)

## Struttura

```
(albero cartelle con una riga di spiegazione ciascuna)
```

## Comandi

I comandi per installare, costruire, provare e avviare il progetto stanno nella ricetta dell'ambiente in `blueprint/deployment.yaml` (schema 3) e si controllano con `factory env check`.

## Convenzioni attive

(riassunto operativo dal profilo: naming, struttura moduli, error handling, test)

## Dove si aggiunge cosa

(es. "nuova pagina → …", "nuovo endpoint → …", "nuova migrazione → …")

## Connessione al database

(solo il nome della variabile, `DATABASE_URL`, e dove sta, `.env.example`. Mai un URL con utente e password in questo file, nemmeno locale: il controllo dei segreti rifiuta il commit.)

## Decisioni e motivi

| Data | Decisione | Perché |
|---|---|---|
