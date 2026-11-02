---
name: memory
description: Cura la memoria operativa quando una chat riceve una correzione, emerge una preferenza durevole o una soluzione verificata sarà utile nelle sessioni future.
---

# Memory: ricordare soltanto ciò che cambia il lavoro futuro

La conversazione ricorda il turno corrente; `MEMORY.md` conserva conoscenza durevole del progetto; il journal conserva i fatti dei tentativi; le skill conservano il metodo trasversale e cambiano solo dopo una proposta e un gate umano.

## Procedura

1. Classifica ciò che hai imparato. Un dettaglio utile solo ora resta nella conversazione; una preferenza, correzione o trappola stabile del progetto va in `MEMORY.md`; una struttura o decisione architetturale in `CONTEXT.md`; un errore di task lo registra il runner; una regola valida in più progetti è un candidato per una skill, mai una modifica diretta.
2. Prima di scrivere rileggi `MEMORY.md`: consolida una voce esistente quando il significato coincide e rimuovi una regola superata invece di accumulare eccezioni.
3. Scrivi una frase operativa breve, contesto o trigger → comportamento verificato, tale che una sessione nuova possa agire senza ricostruire la storia.
4. Una lezione trasversale la aggiungi in `MEMORY.md` sotto `## Candidati trasversali` con una sola riga `- [skill:nome] problema → regola verificata`; la skill condivisa resta invariata finché una persona non approva.

## Regole

- `MEMORY.md` è breve: niente cronologia, transcript, output grezzo o duplicati. Solo fatti osservati, preferenze esplicite e soluzioni che hanno superato verify.
- Contratti, Blueprint, codice e verify prevalgono sempre sulla memoria.
- Credenziali, token, chiavi, dati personali e valori di ambiente non entrano mai nella memoria.
- Durante un task del loop non modificare `MEMORY.md` (è fuori dal Task Contract): usa il report finale, così il runner registra l'episodio senza violare lo scope.
