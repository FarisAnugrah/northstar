import type { IntakeData } from "./intake-schema.ts";

export type DocType = "BRD" | "PCR" | "PRD" | "SRS" | "FSD" | "TSD";

/**
 * Section definitions per document type.
 */
export const DOCUMENT_SECTIONS: Record<DocType, readonly string[]> = {
  BRD: ["background", "business_goals", "scope", "user_characteristics", "business_rules", "constraints"],
  PCR: ["change_description", "reason", "impact_analysis", "security_implications", "affected_systems"],
  PRD: ["problem", "goals", "users", "success_metrics", "requirements", "out_of_scope", "timeline", "risks"],
  SRS: ["introduction", "overall_description", "system_features", "external_interfaces", "non_functional"],
  FSD: ["functional_scope", "user_journeys", "use_cases", "data_validation", "error_handling"],
  TSD: ["architecture", "database_design", "api_specifications", "infrastructure", "security_standards"],
};

export const SECTION_LABELS: Record<string, string> = {
  // BRD
  background: "Latar Belakang & Pendahuluan",
  business_goals: "Tujuan Bisnis",
  scope: "Ruang Lingkup Bisnis",
  user_characteristics: "Karakteristik Pengguna",
  business_rules: "Aturan Bisnis (Business Rules)",
  constraints: "Batasan & Regulasi",
  // PCR
  change_description: "Deskripsi Perubahan",
  reason: "Alasan Perubahan & Justifikasi",
  impact_analysis: "Analisis Dampak (Scope, Schedule, Budget)",
  security_implications: "Implikasi Keamanan & Kepatuhan",
  affected_systems: "Sistem yang Terpengaruh",
  // PRD
  problem: "Problem Statement",
  goals: "Goals",
  users: "Users & Personas",
  success_metrics: "Success Metrics",
  requirements: "Requirements",
  out_of_scope: "Out of Scope",
  timeline: "Timeline",
  risks: "Risks & Mitigations",
  // SRS
  introduction: "Pengantar & Tujuan",
  overall_description: "Deskripsi Umum Sistem",
  system_features: "Fitur Utama Sistem",
  external_interfaces: "Antarmuka Eksternal (UI, API, Hardware)",
  non_functional: "Kebutuhan Non-Fungsional",
  // FSD
  functional_scope: "Lingkup Fungsional",
  user_journeys: "Alur Pengguna (User Journeys)",
  use_cases: "Use Cases & Skenario Detail",
  data_validation: "Aturan Validasi Data",
  error_handling: "Penanganan Error & Edge Cases",
  // TSD
  architecture: "Arsitektur Teknis & Sistem",
  database_design: "Rancangan Database & Skema Data",
  api_specifications: "Spesifikasi API & Integrasi",
  infrastructure: "Infrastruktur & Deployment",
  security_standards: "Standar Keamanan & Enkripsi",
};

export function getSystemPrompt(docType: DocType): string {
  return `You are a senior product manager and system architect writing a ${docType} (Business Requirement Document / Product Specification / Tech Spec) for a corporate B2B SaaS platform.
Write in clear, professional, concise English. Use Markdown for structure (## for section headings, - for bullets).
Base everything ONLY on the intake information provided. Do not invent facts. If something is missing, say "To be determined" rather than fabricating.`;
}

export function buildSystemPrompt(intake: IntakeData, docType: DocType = "PRD"): string {
  return `${getSystemPrompt(docType)}

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
  key: string,
  intake: IntakeData,
  docType: DocType = "PRD",
): string {
  const label = SECTION_LABELS[key] ?? key;
  const commonInstruction = `Output as Markdown starting with "## ${label}". Base it strictly on the project context. Do not hallucinate.`;

  // PRD
  if (docType === "PRD") {
    switch (key) {
      case "problem":
        return `Write the "Problem Statement" section. Cover the core problem this product solves, who experiences it, why it matters, current workarounds, and why now. ${commonInstruction}`;
      case "goals":
        return `Write the "Goals" section. Cover primary product goals, business goals, 3-5 SMART objectives, and strategy alignment. ${commonInstruction}`;
      case "users":
        return `Write the "Users & Personas" section. Cover primary user personas (expand to 2-3 named personas if possible), jobs to be done, and needs. ${commonInstruction}`;
      case "success_metrics":
        return `Write the "Success Metrics" section. Cover success metrics, targets, guardrail metrics, and measurement approach. ${commonInstruction}`;
      case "requirements":
        return `Write the "Requirements" section. Organize as a table or list: functional requirements (FR-1, FR-2...) with priorities (Must/Should/Could) and non-functional requirements (NFR-1, NFR-2...). ${commonInstruction}`;
      case "out_of_scope":
        return `Write the "Out of Scope" section. List exclusions with brief justifications. ${commonInstruction}`;
      case "timeline":
        return `Write the "Timeline" section. Provide a phased timeline (Phase 1 MVP, Phase 2, etc.) factoring in constraints. ${commonInstruction}`;
      case "risks":
        return `Write the "Risks & Mitigations" section. Cover 3-6 risks with Likelihood, Impact, and Mitigation strategies. ${commonInstruction}`;
    }
  }

  // BRD
  if (docType === "BRD") {
    switch (key) {
      case "background":
        return `Write the "Latar Belakang & Pendahuluan" section of the BRD. Describe the business context, current market opportunity, and the business rationale for initiating the project. ${commonInstruction}`;
      case "business_goals":
        return `Write the "Tujuan Bisnis" section of the BRD. Detail the strategic business goals, cost benefits, target return on investment, and KPIs. ${commonInstruction}`;
      case "scope":
        return `Write the "Ruang Lingkup Bisnis" section of the BRD. Outline the business functions impacted, key stakeholders, and in-scope vs out-of-scope business areas. ${commonInstruction}`;
      case "user_characteristics":
        return `Write the "Karakteristik Pengguna" section of the BRD. Describe the target business users, roles, departments involved, and user profiles. ${commonInstruction}`;
      case "business_rules":
        return `Write the "Aturan Bisnis (Business Rules)" section of the BRD. Outline the key logical business rules, policies, and calculations the system must enforce. ${commonInstruction}`;
      case "constraints":
        return `Write the "Batasan & Regulasi" section of the BRD. Detail regulatory, compliance, tax, legal, or industry-specific constraints. ${commonInstruction}`;
    }
  }

  // PCR
  if (docType === "PCR") {
    switch (key) {
      case "change_description":
        return `Write the "Deskripsi Perubahan" section of the PCR. Detail what is being requested, current system state, and proposed changes. ${commonInstruction}`;
      case "reason":
        return `Write the "Alasan Perubahan & Justifikasi" section. Explain why the change is necessary, customer request details, or market adjustments. ${commonInstruction}`;
      case "impact_analysis":
        return `Write the "Analisis Dampak" section. Assess impact on project scope, timeline (schedule), budget, and resource allocation. Use a summary table if possible. ${commonInstruction}`;
      case "security_implications":
        return `Write the "Implikasi Keamanan & Kepatuhan" section. Detail any new security risks, encryption updates, or regulatory compliance rules triggered by this change. ${commonInstruction}`;
      case "affected_systems":
        return `Write the "Sistem yang Terpengaruh" section. List other modules, third-party APIs, or integrations that need modification. ${commonInstruction}`;
    }
  }

  // SRS
  if (docType === "SRS") {
    switch (key) {
      case "introduction":
        return `Write the "Pengantar & Tujuan" section of the SRS. Explain the purpose of this specification document, product scope, and references. ${commonInstruction}`;
      case "overall_description":
        return `Write the "Deskripsi Umum Sistem" section. Detail product perspective, system functions, user classes, design constraints, and assumptions. ${commonInstruction}`;
      case "system_features":
        return `Write the "Fitur Utama Sistem" section. List the core system features, inputs, actions, and expected outputs. ${commonInstruction}`;
      case "external_interfaces":
        return `Write the "Antarmuka Eksternal" section. Detail user interface designs, API requirements, hardware requirements, and communication protocols. ${commonInstruction}`;
      case "non_functional":
        return `Write the "Kebutuhan Non-Fungsional" section. Define requirements for security, reliability, availability, performance, and maintainability. ${commonInstruction}`;
    }
  }

  // FSD
  if (docType === "FSD") {
    switch (key) {
      case "functional_scope":
        return `Write the "Lingkup Fungsional" section of the FSD. Detail functional specifications, user roles, permissions matrix, and feature details. ${commonInstruction}`;
      case "user_journeys":
        return `Write the "Alur Pengguna (User Journeys)" section. Step through the user flows for key user goals. ${commonInstruction}`;
      case "use_cases":
        return `Write the "Use Cases & Skenario Detail" section. Detail use cases with preconditions, main flow, alternative flows, and postconditions. ${commonInstruction}`;
      case "data_validation":
        return `Write the "Aturan Validasi Data" section. Outline input field validations, formatting rules, mandatory inputs, and standard UI validation rules. ${commonInstruction}`;
      case "error_handling":
        return `Write the "Penanganan Error & Edge Cases" section. Define error states, error messages, recovery steps, and fallback behaviors. ${commonInstruction}`;
    }
  }

  // TSD
  if (docType === "TSD") {
    switch (key) {
      case "architecture":
        return `Write the "Arsitektur Teknis & Sistem" section of the TSD. Detail system topology, technology stack, microservices/monolith architecture, and design patterns. ${commonInstruction}`;
      case "database_design":
        return `Write the "Rancangan Database & Skema Data" section. Outline entity relationship (ERD) mapping, table definitions, key data fields, indexes, and caching. ${commonInstruction}`;
      case "api_specifications":
        return `Write the "Spesifikasi API & Integrasi" section. Outline REST/GraphQL endpoints, payload structures, headers, authentication, and webhooks. ${commonInstruction}`;
      case "infrastructure":
        return `Write the "Infrastruktur & Deployment" section. Detail cloud provider services, containers, orchestrators, CI/CD pipeline, and backup strategy. ${commonInstruction}`;
      case "security_standards":
        return `Write the "Standar Keamanan & Enkripsi" section. Detail cryptographic algorithms, token management, network security (WAF, VPC), and vulnerability mitigation. ${commonInstruction}`;
    }
  }

  return `Write the "${label}" section of this ${docType} document. ${commonInstruction}`;
}
