---
name: codestyle-generator
description: Crea o aggiorna un profilo di linee guida (stile di scrittura del codice + tecnologie da usare) tramite intervista, producendo profiles/<nome>/codestyle.md e stack.md che diventano vincolanti per il loop. Usare quando l'utente vuole definire come va scritto il codice o quali tecnologie usare, o per creare il profilo di un cliente.
---

# Codestyle-generator — dallo stile descritto alla linea guida vincolante

L'utente descrive come vuole il codice e con quali tecnologie; tu lo trasformi in un profilo che ogni task del loop rispetterà. È anche lo strumento di vendita: il profilo di un cliente = i suoi standard codificati.

## Procedura

1. **Intervista** (blocchi di max 4 domande, proponi sempre un default):
   - Tecnologie: linguaggi, framework, database, hosting preferiti — per tipo di progetto (web app, API, CLI…).
   - Struttura: come si organizzano moduli/cartelle? feature-based o layer-based?
   - Naming: lingua (italiano/inglese) per codice, commenti, UI.
   - Error handling: eccezioni o valori di ritorno? logging come?
   - Test: framework, dove stanno, cosa si testa sempre e cosa mai.
   - Stile: commenti (quando sì), lunghezza funzioni, principi cari (es. "poche dipendenze", "niente magia").
   - Vietato: librerie/pattern che non vuole mai vedere.
2. **Scrivi** `profiles/<nome>/codestyle.md`: regole brevi, imperative, con mini-esempio dove serve (giusto/sbagliato). Ogni regola deve essere applicabile da un agente senza interpretazione.
3. **Scrivi** `profiles/<nome>/stack.md`: tabella tipo-progetto → stack completo (framework, db, test, deploy), più le integrazioni MCP tipiche.
4. **Attiva**: nel progetto corrente imposta `project.yaml → profile: <nome>`; per default di fabbrica, `factory.yaml → defaults.profile`.
5. Committa.

## Regole

- Regole descrittive ("il codice deve essere pulito") sono vietate: solo regole operative ("funzioni sotto le 40 righe", "un componente per file").
- Massimo 40 regole in codestyle.md: oltre, l'engine ne ignorerà metà. Se l'utente ne vuole di più, dividi per tipo di progetto.
- In caso di conflitto la precedenza è: PRD del progetto > profilo > default della fabbrica. Scrivilo in testa al profilo.
- Aggiornare un profilo esistente: mai riscrivere da zero, mostra il diff delle regole cambiate (i progetti in corso lo usano).
