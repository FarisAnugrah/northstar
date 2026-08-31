import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DOCUMENT_SECTIONS,
  SECTION_LABELS,
  buildSectionPrompt,
  buildSystemPrompt,
} from "../lib/prompts.ts";
import { emptyIntake, type IntakeData } from "../lib/intake-schema.ts";

const PRD_SECTIONS = DOCUMENT_SECTIONS.PRD;

const sample: IntakeData = {
  ...emptyIntake,
  problem: {
    title: "Customer Portal",
    pain: "Customers wait days for status updates",
    audience: "B2B SaaS customers",
  },
  users: {
    personas: "Operations manager, Customer support agent",
    jobsToBeDone: "Track ticket status without emailing support",
  },
  goals: {
    productGoal: "Reduce support load by 30%",
    businessGoal: "Increase NPS by 10 points",
  },
};

test("PRD has exactly 8 sections in fixed order", () => {
  assert.equal(PRD_SECTIONS.length, 8);
  assert.equal(PRD_SECTIONS[0], "problem");
  assert.equal(PRD_SECTIONS[7], "risks");
});

test("every section has a human label", () => {
  for (const key of PRD_SECTIONS) {
    assert.ok(SECTION_LABELS[key].length > 0, `missing label for ${key}`);
  }
});

test("system prompt embeds intake context", () => {
  const sys = buildSystemPrompt(sample);
  assert.ok(sys.includes("Customer Portal"));
  assert.ok(sys.includes("B2B SaaS customers"));
});

test("section prompts are distinct and reference intake", () => {
  const prompts = PRD_SECTIONS.map((key) => buildSectionPrompt(key, sample));
  const unique = new Set(prompts);
  assert.equal(unique.size, PRD_SECTIONS.length, "all prompts must differ");
  for (const p of prompts) {
    assert.ok(p.includes("Markdown"), `expect markdown instruction`);
  }
});

test("section prompt covers all key types", () => {
  for (const key of PRD_SECTIONS) {
    const p = buildSectionPrompt(key, sample);
    assert.ok(p.length > 50, `${key} prompt too short`);
  }
});
