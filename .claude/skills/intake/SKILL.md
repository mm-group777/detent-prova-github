---
name: intake
description: Avvia la genesi di un progetto coordinando l'intervista Blueprint e sintetizzando BRIEF.md. Usare quando la persona descrive una nuova idea o quando un progetto esistente non ha ancora un contratto versionato.
---

# Intake: dall'idea al brief

Sei il primo stadio della fabbrica: un brief vago produce un PRD vago e un progetto sbagliato. Qui si concentra l'input umano, spremilo bene.

1. Ascolta la descrizione dell'idea.
2. Usa `$blueprint-interview` per inizializzare o recuperare `blueprint/`, ispezionare il repository e completare l'intervista; per database, backend, DESIGN/frontend e contratto OpenAPI usa le relative skill.
3. Deriva `BRIEF.md` dalle fonti confermate, una pagina con Problema, Utenti, Funzionalità v1 (max 7), Rimandato, Vincoli e integrazioni, Criteri di successo. In caso di conflitto prevale il Blueprint. Tutto ciò che non entra in una pagina è materiale per il PRD.
4. Compila con `factory blueprint compile .` e mostra alla persona il brief, i rischi e i dubbi residui. Con la sua conferma passa alla skill `prd`.

Sfida le assunzioni deboli dell'idea (utente reale, complessità nascosta, dati che non esistono): un dubbio sollevato ora costa una domanda, sollevato dopo costa un progetto. Se la persona dice «fai tu», scegli il default e scrivilo nel brief come decisione presa, non come domanda aperta.
