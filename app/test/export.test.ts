import assert from "node:assert/strict";
import { test } from "node:test";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toMarkdown, toDocx, toPdf, stripInline, type ExportSection } from "../lib/export.ts";

const sections: ExportSection[] = [
  { key: "problem", content: "## Problem Statement\n\nCustomers wait too long for updates." },
  { key: "goals", content: "## Goals\n\n- Reduce support load by 30%\n- Increase NPS" },
  {
    key: "success_metrics",
    content:
      "## Success Metrics\n\n| Metric | Target |\n|---|---|\n| **Ticket volume** | **-40%** |\n| CSAT | 4.0 |",
  },
];

test("markdown export starts with doc type + title", () => {
  const md = toMarkdown({ title: "Customer Portal", sections });
  assert.ok(md.startsWith("# BUSINESS REQUIREMENT DOCUMENT"));
  assert.ok(md.includes("## Customer Portal"));
  assert.ok(md.includes("## Problem Statement"));
});

test("docx export produces a valid .docx buffer", async () => {
  const buf = await toDocx({ title: "Customer Portal", sections });
  assert.ok(buf.length > 0);
  assert.equal(buf.subarray(0, 2).toString(), "PK");
});

test("pdf export produces a valid PDF buffer", async () => {
  const buf = await toPdf({ title: "Customer Portal", sections });
  assert.ok(buf.length > 0);
  assert.equal(buf.subarray(0, 5).toString(), "%PDF-");
});

test("docx contains real <w:tbl> table XML (not pipe text)", async () => {
  const buf = await toDocx({ title: "Customer Portal", sections });
  const dir = mkdtempSync(join(tmpdir(), "docx-test-"));
  const docxPath = join(dir, "test.docx");
  writeFileSync(docxPath, buf);

  const xml = execSync(
    `unzip -p "${docxPath}" word/document.xml`,
    { encoding: "utf8" },
  );

  // Real table element must exist
  assert.ok(xml.includes("<w:tbl>"), "DOCX must contain <w:tbl> table element");
  // Table cells must exist
  assert.ok(xml.includes("<w:tc>"), "DOCX must contain table cells");
  // Raw pipes from markdown table should NOT appear as literal text
  assert.ok(!xml.includes("| Metric |"), "no raw markdown pipes should leak");
  // Bold markers should be stripped from cell text
  assert.ok(!xml.includes("**"), "no literal ** should leak into DOCX");
  // Stripped bold text should still be present
  assert.ok(xml.includes("Ticket volume"), "cell content must survive");

  rmSync(dir, { recursive: true, force: true });
});

test("pdf export is non-trivial size (contains content)", async () => {
  const buf = await toPdf({ title: "Customer Portal", sections });
  // PDF streams are compressed; deep text verification needs parsing.
  // Size heuristic: a doc with title + 3 sections + table should be > 1KB.
  assert.ok(buf.length > 1000);
});

test("markdown export preserves tables (it's markdown)", () => {
  const md = toMarkdown({ title: "Customer Portal", sections });
  assert.ok(md.includes("| Metric | Target |"));
});

test("stripInline converts non-WinAnsi chars for PDF rendering", () => {
  const out = stripInline("A ≥ 40% — with → arrow and “quotes”");
  assert.ok(!out.includes("≥"), "≥ must be replaced");
  assert.ok(!out.includes("—"), "em dash must be replaced");
  assert.ok(!out.includes("→"), "arrow must be replaced");
  assert.ok(!out.includes("“"), "smart quote must be replaced");
  assert.ok(out.includes(">="), "≥ becomes >=");
  assert.ok(out.includes("->"), "→ becomes ->");
  assert.ok(out.includes(">= 40% - with"), "combined output sane");
});

test("stripInline removes markdown bold and code", () => {
  const out = stripInline("**bold** and `code` and [link](https://x)");
  assert.ok(!out.includes("**"));
  assert.ok(!out.includes("`"));
  assert.ok(!out.includes("["));
  assert.ok(out.includes("bold"));
  assert.ok(out.includes("code"));
  assert.ok(out.includes("link"));
});
