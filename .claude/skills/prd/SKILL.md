---
name: prd
description: Genera il PRD del progetto a partire da BRIEF.md e lo sottopone al gate umano. Usare dopo la skill intake, nella genesi di un progetto.
---

# PRD: dal brief ai requisiti

Trasforma `BRIEF.md` in `PRD.md`, il documento che il piano e il loop tratteranno come verità. GATE UMANO: il PRD non è valido finché la persona non lo approva.

## Struttura (modello in `templates/project-state/PRD.md`)

Problema (3 righe dal brief); Utenti e ruoli; Funzionalità in MoSCoW (Must, Should, Could, Won't esplicito), dove ogni Must ha 1-3 criteri di accettazione misurabili («l'utente può X e vede Y»); 2-3 Flussi chiave; Vincoli tecnici (integrazioni, MCP, dati, deploy: lo stack NON si decide qui); Criteri di accettazione del progetto, ognuno verificabile da un test o da un comando.

## Procedura

1. Leggi `BRIEF.md`, le fonti `blueprint/*.yaml`, `architecture.yaml` e il profilo attivo (`project.yaml → profile`).
2. Scrivi `PRD.md`. Dove il brief tace, decidi tu il default e marcalo `(default proposto)`. Aggiorna `blueprint/objectives.yaml` e `blueprint/acceptance.yaml` con ID stabili (e deployment e security se emergono vincoli) e ricompila `architecture.yaml`, che può restare `draft` fino allo scaffold.
3. Presenta alla persona un riassunto in 10 righe (Must, Won't, criteri di accettazione, default proposti) e attendi l'approvazione. Con modifiche aggiorna PRD e fonti, ricompila e ripresenta; approvato, scrivi in fondo al PRD `Stato: approvato (data)` e passa a `plan`.

## Regole

- Un PRD che non si può testare è sbagliato: ogni Must senza criterio misurabile va riscritto.
- I Won't proteggono il loop dallo scope creep quanto i Must.
- Massimo 2 pagine: il dettaglio implementativo vive nei task.
