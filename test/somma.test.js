import { test } from 'node:test';
import assert from 'node:assert/strict';

import { somma } from '../src/somma.js';

test('somma un elenco di numeri', () => {
  assert.equal(somma([1, 2, 3]), 6);
  assert.equal(somma([-4, 4]), 0);
  assert.equal(somma([1.5, 2.5]), 4);
});

test('somma zero quando l\'elenco è vuoto', () => {
  assert.equal(somma([]), 0);
});

test('lancia TypeError se un elemento non è un numero finito', () => {
  assert.throws(() => somma([1, 'due', 3]), TypeError);
  assert.throws(() => somma([1, Infinity]), TypeError);
  assert.throws(() => somma([NaN]), TypeError);
});
