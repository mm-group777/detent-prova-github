/**
 * Classifica una response interna rispetto al contratto della singola journey.
 * I 5xx restano sempre errori di sistema, anche davanti a un contratto manomesso.
 *
 * @param {{ expectedStatuses: number[] }} operation
 * @param {number} status
 * @returns {{ accepted: true } | { accepted: false, reason: 'server-error' | 'unexpected-status' }}
 */
export function classifyOperationResponse(operation, status) {
  if (status >= 500) return { accepted: false, reason: 'server-error' };
  if (operation.expectedStatuses.includes(status)) return { accepted: true };
  return { accepted: false, reason: 'unexpected-status' };
}
