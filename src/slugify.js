"use strict";

const DIACRITICS = /[\u0300-\u036f]/g;

function slugify(input) {
  if (typeof input !== "string") {
    throw new TypeError("slugify richiede una stringa");
  }

  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = { slugify };
