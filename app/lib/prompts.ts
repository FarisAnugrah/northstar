import type { IntakeData } from "./intake-schema.ts";

/**
 * PRD section definitions + prompt templates.
 * Each section is generated independently so we can regenerate 1 section
 * without re-running the whole doc (see 06-ai-pipeline.md).
 */

export const PRD_SECTIONS = [
  "problem",
  "goals",
  "users",
  "success_metrics",
  "requirements",
  "out_of_scope",
  "timeline",
  "risks",
] as const;

export type PrdSectionKey = (typeof PRD_SECTIONS)[number];

export const SECTION_LABELS: Record<PrdSectionKey, string> = {
  problem: "Problem Statement",
  goals: "Goals",
  users: "Users & Personas",
  success_metrics: "Success Metrics",
  requirements: "Requirements",
  out_of_scope: "Out of Scope",
  timeline: "Timeline",
  risks: "Risks & Mitigations",
};

const SYSTEM_PROMPT = `You are a senior product manager writing a Product Requirements Document (PRD) for a B2B SaaS product. 
Write in clear, professional, concise English. Use Markdown for structure (## for section headings, - for bullets). 
Base everything ONLY on the intake information provided. Do not invent facts. If something is missing, say "To be determined" rather than fabricating.`;

export function buildSystemPrompt(intake: IntakeData): string {
  return `${SYSTEM_PROMPT}

PROJECT CONTEXT (from intake):
- Title: ${intake.problem.title}
- Problem: ${intake.problem.pain}
- Audience: ${intake.problem.audience}
- Users: ${intake.users.personas}
- Jobs to be done: ${intake.users.jobsToBeDone}
- Product goal: ${intake.goals.productGoal}
- Business goal: ${intake.goals.businessGoal}
- Success metrics: ${intake.metrics.successMetrics || "TBD"}
- Out of scope: ${intake.metrics.nonGoals || "TBD"}
- Constraints: ${intake.constraints.constraints || "None specified"}
- Assumptions: ${intake.constraints.assumptions || "None specified"}`;
}

export function buildSectionPrompt(
  key: PrdSectionKey,
  intake: IntakeData,
): string {
  switch (key) {
    case "problem":
      return `Write the "Problem Statement" section of the PRD.
Cover:
- The core problem this product solves
- Who experiences it and why it matters
- Current state / how it's solved today (if inferable from intake)
- Why now

Use the project context. Output as Markdown starting with "## Problem Statement".`;

    case "goals":
      return `Write the "Goals" section of the PRD.
Cover:
- Primary product goal (from intake)
- Business goal
- 3-5 specific, measurable objectives (SMART)
- How these goals align with business strategy

Output as Markdown starting with "## Goals".`;

    case "users":
      return `Write the "Users & Personas" section of the PRD.
Cover:
- Primary user personas (from intake, expand into 2-3 named personas if possible)
- Jobs to be done for each persona
- User pain points and needs

Output as Markdown starting with "## Users & Personas".`;

    case "success_metrics":
      return `Write the "Success Metrics" section of the PRD.
Cover:
- Primary metrics that define success (from intake if provided, else suggest North Star metric + 3-5 supporting metrics)
- Quantitative targets where possible
- Secondary / guardrail metrics
- Measurement approach (how/when measured)

Output as Markdown starting with "## Success Metrics".`;

    case "requirements":
      return `Write the "Requirements" section of the PRD.
Organize as a table or prioritized list:
- Functional requirements (labeled FR-1, FR-2, ...) with priority (Must / Should / Could)
- Non-functional requirements (performance, security, reliability) labeled NFR-1, NFR-2, ...
Keep requirements concrete and testable.

Output as Markdown starting with "## Requirements".`;

    case "out_of_scope":
      return `Write the "Out of Scope" section of the PRD.
List explicitly what is NOT included in this release, based on intake out-of-scope notes.
For each item, add 1 line explaining why it's excluded.

Output as Markdown starting with "## Out of Scope".`;

    case "timeline":
      return `Write the "Timeline" section of the PRD.
Provide a phased delivery timeline:
- Phase 1 (MVP): what's included, estimated duration
- Phase 2: what's included
- Phase 3+: future
Be realistic; if intake has constraints, reflect them. Use Markdown bullets.

Output as Markdown starting with "## Timeline".`;

    case "risks":
      return `Write the "Risks & Mitigations" section of the PRD.
Cover 3-6 risks, each with:
- Risk description
- Likelihood (High/Med/Low)
- Impact (High/Med/Low)
- Mitigation strategy

Output as Markdown starting with "## Risks & Mitigations".`;
  }
}
