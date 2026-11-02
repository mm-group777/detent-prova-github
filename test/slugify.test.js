"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify } = require("../src/slugify.js");

test("titolo normale", () => {
  assert.equal(slugify("Ciao Mondo"), "ciao-mondo");
});

test("accenti", () => {
  assert.equal(slugify("Città e Perché"), "citta-e-perche");
});

test("simboli con spazi ripetuti", () => {
  assert.equal(slugify("  Città  Perché -- Mondo!!  "), "citta-perche-mondo");
});

test("input vuoto", () => {
  assert.equal(slugify(""), "");
});
