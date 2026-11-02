/**
 * Esclude soltanto l'errore Chromium prodotto dalla stessa response 4xx firmata e osservata.
 * Un 5xx, un host diverso o una console senza response correlata restano errori.
 */
export function expectedRefusalConsole(failure, responses, journey) {
  if (failure?.kind !== 'console-error' || !journey || typeof failure.url !== 'string') return false;
  const match = String(failure.detail ?? '').match(/^Failed to load resource: the server responded with a status of (401|403|409|422)(?: |$)/i);
  if (!match) return false;
  const status = Number(match[1]);
  let location;
  try { location = new URL(failure.url); } catch { return false; }
  if (!journey.apiHosts.includes(location.host)) return false;
  return responses.some(response => {
    if (response.status !== status) return false;
    let responseUrl;
    try { responseUrl = new URL(response.url); } catch { return false; }
    if (responseUrl.origin !== location.origin || responseUrl.pathname !== location.pathname) return false;
    return journey.operations.some(operation => operation.method === response.method
      && operation.expectedStatuses.includes(status)
      && matchesOpenApiPath(operation.path, responseUrl.pathname));
  });
}

function matchesOpenApiPath(template, actual) {
  const pattern = template.split('/').map(segment => /^\{[^}]+\}$/.test(segment) ? '[^/]+' : escapeRegExp(segment)).join('/');
  return new RegExp(`^${pattern}$`).test(actual);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
