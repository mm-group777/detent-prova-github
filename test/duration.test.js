const { test } = require('node:test');
const assert = require('node:assert/strict');

const { formatDuration } = require('../src/duration.js');

test('formats seconds below a minute', () => {
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(45), '45s');
});

test('formats minutes and seconds', () => {
  assert.equal(formatDuration(60), '1m 00s');
  assert.equal(formatDuration(125), '2m 05s');
});

test('formats hours, minutes and seconds', () => {
  assert.equal(formatDuration(3600), '1h 00m 00s');
  assert.equal(formatDuration(3725), '1h 02m 05s');
});

test('floors decimal values before formatting', () => {
  assert.equal(formatDuration(59.9), '59s');
  assert.equal(formatDuration(125.99), '2m 05s');
});

test('rejects negative numbers', () => {
  assert.throws(() => formatDuration(-1), TypeError);
});

test('rejects NaN and Infinity', () => {
  assert.throws(() => formatDuration(Number.NaN), TypeError);
  assert.throws(() => formatDuration(Number.POSITIVE_INFINITY), TypeError);
});

test('rejects non-numeric values', () => {
  assert.throws(() => formatDuration('abc'), TypeError);
  assert.throws(() => formatDuration(null), TypeError);
  assert.throws(() => formatDuration(undefined), TypeError);
});
