---
name: tech-research
description: Verifica un fatto tecnico quando manca conoscenza diretta. Usare quando un'altra skill (interviste, plan, macro-contract, implement-task) non è certa di un fatto: documentazione di una libreria, API di terzi, versioni, limiti.
---

# Tech research: dal dubbio alla fonte

Quando manca conoscenza diretta su un fatto, non indovinare e non chiedere alla persona ciò che si può verificare. Non andare a memoria quando esiste una fonte aggiornata.

1. Se il fatto riguarda una libreria con documentazione ufficiale, usa `context7`: `resolve-library-id` per trovare l'ID, poi `query-docs` per firma, versione e uso esatti.
2. Se `context7` non esiste, trova poco, o il fatto è generale (servizio esterno, API di terzi, changelog, limiti, deploy), cerca nel web con lo strumento di ricerca che hai e verifica su una fonte primaria (sito ufficiale, repository, changelog) prima di fidarti di blog e aggregatori.
3. Riporta il fatto a chi lo ha chiesto, con la fonte e la versione: l'esito è evidenza per una decisione, non la decisione. Un fatto non confermato da una fonte primaria va scritto come «da verificare», mai come vero.
