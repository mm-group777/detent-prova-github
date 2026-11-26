import { test } from 'node:test';
import assert from 'node:assert/strict';

import { saluto } from '../src/saluto.js';

test('saluta una persona per nome', () => {
  assert.equal(saluto('Marco'), 'Ciao, Marco!');
});

test('saluta senza nome quando il nome manca o è vuoto', () => {
  assert.equal(saluto(''), 'Ciao!');
  assert.equal(saluto(undefined), 'Ciao!');
});
