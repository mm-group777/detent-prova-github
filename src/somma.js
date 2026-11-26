export function somma(numeri) {
  let totale = 0;
  for (const numero of numeri) {
    if (typeof numero !== 'number' || !Number.isFinite(numero)) {
      throw new TypeError(`Somma richiede numeri finiti, ricevuto: ${String(numero)}`);
    }
    totale += numero;
  }
  return totale;
}
