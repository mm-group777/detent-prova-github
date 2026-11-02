import { relative } from 'node:path';
import { expect, test as base } from '@playwright/test';
import { classifyOperationResponse } from './system-evidence.mjs';
import { expectedRefusalConsole } from './system-refusal.independent-v1.mjs';

type RuntimeFailure = {
  kind: 'http-5xx' | 'page-error' | 'console-error' | 'api-non-success';
  detail: string;
  url?: string;
  status?: number;
};

type RuntimeJourney = {
  name: string;
  requiredInputs: string[];
  requiredActions: string[];
  expectedOutcomes: string[];
  operations: RuntimeOperation[];
  apiHosts: string[];
};

type RuntimeOperation = {
  id: string;
  method: string;
  path: string;
  expectedStatuses: number[];
};

type RuntimeContract = {
  schemaVersion: 1;
  specs: Record<string, RuntimeJourney>;
};

type SystemEvidence = {
  input(name: string, operation: PromiseLike<unknown>): Promise<void>;
  action(name: string, operation: PromiseLike<unknown>): Promise<void>;
  outcome(name: string, operation: PromiseLike<unknown>): Promise<void>;
};

type ObservedResponse = { method: string; url: string; status: number };

const runtimeContract = readRuntimeContract();

export const test = base.extend<{ system: SystemEvidence }>({
  page: async ({ page }, use, testInfo) => {
    const journey = runtimeJourney(testInfo.file, testInfo.title);
    const failures: RuntimeFailure[] = [];
    const responses: ObservedResponse[] = [];
    page.on('response', response => {
      responses.push({ method: response.request().method().toUpperCase(), url: response.url(), status: response.status() });
      if (response.status() >= 500) failures.push({ kind: 'http-5xx', detail: `${response.request().method()} ${response.url()} → ${response.status()}` });
    });
    page.on('pageerror', error => failures.push({ kind: 'page-error', detail: error.message }));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      failures.push({ kind: 'console-error', detail: message.text(), url: message.location().url });
    });

    await use(page);

    const unexpected = failures.filter(failure => !expectedRefusalConsole(failure, responses, journey));
    if (unexpected.length > 0) {
      await testInfo.attach('runtime-failures.json', {
        body: Buffer.from(JSON.stringify(unexpected, null, 2)),
        contentType: 'application/json',
      });
    }
    expect(unexpected, 'Il journey ha prodotto errori runtime non ammessi.').toEqual([]);
  },
  system: [async ({ page }, use, testInfo) => {
    const journey = runtimeJourney(testInfo.file, testInfo.title);
    const requiredInputs = new Set<string>();
    const requiredActions = new Set<string>();
    const expectedOutcomes = new Set<string>();
    const operations = new Set<string>();
    const apiFailures: RuntimeFailure[] = [];
    page.on('response', response => {
      if (!journey) return;
      const method = response.request().method().toUpperCase();
      const url = new URL(response.url());
      if (!journey.apiHosts.includes(url.host)) return;
      for (const operation of journey.operations) {
        if (operation.method !== method || !matchesOpenApiPath(operation.path, url.pathname)) continue;
        const classification = classifyOperationResponse(operation, response.status());
        if (classification.accepted) operations.add(operation.id);
        else apiFailures.push({ kind: 'api-non-success', detail: `${operation.id}: ${method} ${url.pathname} → ${response.status()}` });
      }
    });
    const system: SystemEvidence = {
      input: async (name, operation) => { await operation; requiredInputs.add(name); },
      action: async (name, operation) => { await operation; requiredActions.add(name); },
      outcome: async (name, operation) => { await operation; expectedOutcomes.add(name); },
    };

    await use(system);

    if (!journey) return;
    const evidence = {
      requiredInputs: [...requiredInputs], requiredActions: [...requiredActions], expectedOutcomes: [...expectedOutcomes], operations: [...operations], apiFailures,
    };
    await testInfo.attach('system-e2e-evidence.json', {
      body: Buffer.from(JSON.stringify({ journey: journey.name, ...evidence }, null, 2)),
      contentType: 'application/json',
    });
    expect(contractDifference(journey.requiredInputs, evidence.requiredInputs), 'Campi system E2E non eseguiti o non dichiarati.').toEqual({ missing: [], unexpected: [] });
    expect(contractDifference(journey.requiredActions, evidence.requiredActions), 'Azioni system E2E non eseguite o non dichiarate.').toEqual({ missing: [], unexpected: [] });
    expect(contractDifference(journey.expectedOutcomes, evidence.expectedOutcomes), 'Outcome system E2E non asseriti o non dichiarati.').toEqual({ missing: [], unexpected: [] });
    expect(evidence.apiFailures, 'Le API interne attraversate hanno restituito status non ammessi dal contratto OpenAPI.').toEqual([]);
    expect(contractDifference(journey.operations.map(operation => operation.id), evidence.operations), 'OperationId OpenAPI non attraversate dal browser.').toEqual({ missing: [], unexpected: [] });
  }, { auto: true }],
});

export { expect };

function readRuntimeContract(): RuntimeContract | undefined {
  const source = process.env.FACTORY_SYSTEM_E2E_CONTRACT;
  if (!source) return undefined;
  const value = JSON.parse(source) as RuntimeContract;
  if (value.schemaVersion !== 1 || typeof value.specs !== 'object' || value.specs === null) throw new Error('FACTORY_SYSTEM_E2E_CONTRACT non è un contratto runtime supportato.');
  return value;
}

function runtimeJourney(file: string, title: string): RuntimeJourney | undefined {
  if (!runtimeContract) return undefined;
  const spec = relative(process.cwd(), file).replaceAll('\\', '/');
  const journey = runtimeContract.specs[spec];
  if (!journey) throw new Error(`${spec}: manca nel contratto runtime iniettato dal runner.`);
  const marker = `[journey:${journey.name}]`;
  if (!title.includes(marker)) throw new Error(`${spec}: il titolo del test deve contenere ${marker}.`);
  return journey;
}

function contractDifference(expected: string[], actual: string[]): { missing: string[]; unexpected: string[] } {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return { missing: expected.filter(value => !actualSet.has(value)), unexpected: actual.filter(value => !expectedSet.has(value)) };
}

function matchesOpenApiPath(template: string, actual: string): boolean {
  const pattern = template.split('/').map(segment => /^\{[^}]+\}$/.test(segment) ? '[^/]+' : escapeRegExp(segment)).join('/');
  return new RegExp(`^${pattern}$`).test(actual);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
