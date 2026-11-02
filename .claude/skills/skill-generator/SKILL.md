---
name: skill-generator
description: Genera una nuova skill della fabbrica a partire da una descrizione in linguaggio naturale (nuovo stadio del metodo, skill di dominio per un cliente, procedura ricorrente). Usare quando l'utente vuole aggiungere o modificare una capacità della fabbrica.
---

# Skill-generator — la fabbrica che estende sé stessa

Una skill è metodo versionato: istruzioni che qualunque engine sa seguire. Questa skill ne genera altre.

## Procedura

1. **Capisci il mandato**: fatti dire (o deduci) — cosa deve saper fare la skill, QUANDO va attivata (trigger), cosa produce, per chi è (fabbrica interna o skill di dominio cliente).
2. **Controlla l'esistente**: leggi `skills/INDEX.md`. Se una skill copre già il caso al 70%, proponi di estenderla invece di duplicare.
3. **Scrivi** `skills/<nome-kebab>/SKILL.md` con questa forma:
   - Frontmatter: `name` (kebab, = cartella) e `description` — la description DEVE dire cosa fa E quando usarla, perché è l'unico testo che l'engine vede per decidere se attivarla.
   - Apertura: 1–2 righe di contesto (chi sei, qual è la posta in gioco).
   - `## Procedura`: passi numerati, imperativi, ognuno verificabile ("scrivi X", "esegui Y", mai "considera Z").
   - `## Regole` o `## Divieti`: i vincoli che evitano gli errori tipici del dominio.
   - Se la skill produce file: specifica percorso, formato e un esempio concreto.
4. **Autotest**: rileggi la skill impersonando un agente che non sa nulla: c'è un passo dove dovresti indovinare? Riscrivilo. Ogni "dipende" deve avere il criterio per decidere.
5. **Registra**: aggiungi la riga in `skills/INDEX.md` (nome, uso in una riga) e committa.

## Regole

- Una skill = uno scopo. Se la descrizione contiene "e inoltre", sono due skill.
- Breve: una skill lunga è una skill che l'engine seguirà male. Dice l'obiettivo, il contesto e i confini, non dettaglia passi che il modello sa fare da solo.
- Skill di dominio cliente (es. "documentazione modulo X di <cliente>") vanno in `profiles/<cliente>/skills/` nel fork del cliente, non nel kernel.
