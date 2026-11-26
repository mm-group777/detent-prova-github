# PROGRESS — prova-consegna

## Onda 0 - Genesi

- [x] **T0.1** PRD approvato e contesto minimo per partire | deps: -

## Onda 1 - Saluto

- [x] **T1.1** Funzione saluto con la sua prova | deps: T0.1 | verify: `node --test test/saluto.test.js`
  - Crea src/saluto.js (ESM) con `export function saluto(nome)` che ritorna "Ciao, <nome>!"; se nome è vuoto o non è una stringa ritorna "Ciao!".
  - Crea test/saluto.test.js con node:test e node:assert che prova i due casi. Nessuna dipendenza.

## Onda 2 - Somma

- [x] **T2.1** Funzione somma con la sua prova | deps: T1.1 | verify: `node --test test/somma.test.js`
  - Crea src/somma.js (ESM) con `export function somma(numeri)` che ritorna la somma di un array di numeri (0 se vuoto) e lancia TypeError se un elemento non è un numero finito.
  - Crea test/somma.test.js con node:test e node:assert che prova i tre casi. Nessuna dipendenza.
