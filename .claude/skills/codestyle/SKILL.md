---
name: codestyle
description: Linee guida vincolanti di questo progetto (profilo default). Usare SEMPRE quando si modifica codice.
---

# Linee guida di scrittura — profilo default

Precedenza in caso di conflitto: PRD del progetto > questo profilo > default della fabbrica.
(Profilo di esempio: rigeneralo o creane uno tuo con la skill `codestyle-generator`.)

## Linguaggio e naming

1. Codice e identificatori in inglese; UI e testi utente in italiano.
2. TypeScript strict dove c'è JS; tipi espliciti sulle firme pubbliche, inferenza all'interno.
3. Nomi che dicono il ruolo: `invoiceTotal`, non `data2`. Niente abbreviazioni salvo convenzioni note (id, url).
4. File kebab-case, componenti/classi PascalCase, funzioni/variabili camelCase.

## Struttura

5. Organizzazione feature-based: la cartella di una funzionalità contiene UI, logica e test di quella funzionalità.
6. Un modulo = uno scopo; oltre le ~300 righe valuta lo split.
7. Funzioni sotto le ~40 righe; se serve un commento per separare sezioni, sono due funzioni.
8. Dipendenze: prima la libreria standard, poi ciò che è già nel progetto, solo alla fine una dipendenza nuova (annotata in CONTEXT.md con motivo).

## Error handling e logging

9. Fallire presto e forte in sviluppo; messaggi d'errore con contesto ("cosa stavo facendo, con quale input").
10. Mai `catch` vuoti o che inghiottono l'errore; se non sai gestirlo, rilancia.
11. Log strutturati sul server, niente `console.log` residui nel client. Nei log mai variabili d'ambiente, credenziali, nomi di persone o email.

## Test

12. Ogni modulo di logica ha test unitari accanto (`*.test.ts` nella stessa cartella).
13. I flussi del PRD hanno almeno un test end-to-end.
14. I test testano comportamento, non implementazione: rinominare una funzione privata non deve rompere test.

## Stile

15. Niente commenti che ripetono il codice; un commento spiega solo un vincolo non ovvio o un perché.
16. Niente TODO nel codice: le cose da fare stanno in PROGRESS.md o QUESTIONS.md.
17. Formattazione delegata al formatter del progetto (prettier/equivalente), mai a mano.
18. Commit convenzionali: `<ID task>: <titolo>` nel loop; `feat|fix|chore: …` fuori.
19. YAGNI: niente astrazioni o parametri per bisogni futuri ipotetici; si generalizza alla seconda occorrenza reale, non alla prima immaginata.
20. Il linter del progetto passa, se il progetto ne ha uno configurato.
