---
name: debug
description: Metodo per diagnosticare un verify rosso o un bug: riprodurre, isolare, trovare la causa radice, correggere con un test di regressione. Usare quando un test fallisce o un comportamento è inatteso e la causa non è ovvia. Mai procedere a tentativi.
---

# Debug: dalla superstizione alla causa radice

Cambiare cose a caso finché il test passa produce codice che nessuno capisce, nemmeno tu tra un'ora. Quattro fasi, in ordine.

1. **Riproduci.** Trova il comando minimo e deterministico che mostra il fallimento. Se non è riproducibile, prima rendilo riproducibile (log, seed e orari fissi, concorrenza isolata).
2. **Isola.** Riduci finché il fallimento resta: input minimo, componente minimo, test più piccolo che fallisce. Per una regressione usa `git bisect`.
3. **Causa radice.** Spiega PERCHÉ fallisce, non solo DOVE, finché arrivi a un fatto verificabile: la spiegazione deve rendere ovvio il comportamento osservato. Se contiene «per qualche motivo», non è la causa.
4. **Correggi.** Test di regressione che fallisce esattamente per quella causa, fix minimo che lo fa passare, suite completa verde. Se la causa era una trappola del progetto, una riga in `CONTEXT.md`.

## Divieti

- Modifiche multiple «per vedere se passa», fix che non sai spiegare.
- Nascondere il problema: `catch` che inghiotte, sleep o retry per una flakiness senza causa, test indebolito per farlo passare (ammesso solo se contraddice il PRD, annotato in `CONTEXT.md`).
- Dichiarare risolto senza rosso riprodotto prima e verde dopo.

## Se resti fermo

Due giri completi senza causa radice: annota la diagnosi (riproduzione, cosa hai isolato, ipotesi escluse) nel sotto-bullet del task e chiudi la sessione; il runner conta il tentativo e blocca il task da sé al tetto di tentativi. Se la causa è una decisione di prodotto, scrivi la domanda in `QUESTIONS.md` e marca il task `[!]`. Una diagnosi onesta vale più di un fix superstizioso.
