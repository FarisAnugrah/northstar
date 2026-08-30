import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeMarkdown } from "../lib/markdown-utils.ts";

test("normalizes bullet + bold into proper list item", () => {
  const out = normalizeMarkdown("• **Risk:** something bad");
  assert.equal(out, "- **Risk:** something bad");
});

test("removes stray bold-only lines", () => {
  const out = normalizeMarkdown("text\n**\nmore");
  // removed line leaves a blank line -> paragraph break (valid markdown)
  assert.equal(out, "text\n\nmore");
});

test("drops merge markers (>>)", () => {
  const out = normalizeMarkdown("line one\n>> old text\nline two");
  assert.equal(out, "line one\n\nline two");
});

test("keeps valid content and strips only the leading heading", () => {
  const out = normalizeMarkdown("## Heading\n\n- item\n\n**bold** text");
  assert.equal(out, "- item\n\n**bold** text");
});

test("strips leading section heading (card already shows it)", () => {
  const out = normalizeMarkdown("## Problem Statement\n\nCustomers wait for updates.");
  assert.equal(out, "Customers wait for updates.");
});
