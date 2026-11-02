---
name: task-case-coverage
description: Prima di scrivere codice elenca i casi limite che contano per il task e coprili con test. Usare quando si prepara o si implementa un task.
---

# Task case coverage

Prima di implementare, leggi il task e il codice che tocca e individua i casi che possono rompere quel comportamento: il percorso normale, input vuoto o non valido, permesso negato, stati di caricamento e di errore, ripetizione dell'azione, confini del contratto. Non servono un numero fisso né una tabella: conta coprire con test quelli che il task può davvero rompere. Non inventare requisiti di prodotto che le fonti non contengono: se manca una decisione, scrivila in `QUESTIONS.md`.

Contano anche i confini che le fonti fissano (Blueprint, PRD, criteri di accettazione) sulle entità che il task tocca: un limite, l'ordine di un elenco, l'identificativo di una riga nuova dopo una cancellazione, il nome di un campo, il testo di un messaggio. Ognuno ha una prova nominata anche quando il task non lo cambia: è il caso che una modifica vicina rompe senza che nessuno se ne accorga.

Per ogni confine scegli il caso in cui la regola giusta e la sbagliata più vicina danno risultati diversi: dopo una cancellazione si cancella una riga in mezzo, non l'ultima (con l'ultima «massimo più uno» e «quante righe più uno» coincidono); un limite si prova sul valore e su quello subito dopo; un ordine con almeno tre elementi inseriti fuori ordine.
