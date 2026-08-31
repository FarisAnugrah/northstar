"use client";

import { useState } from "react";
import { IntakeForm } from "./intake-form";
import { IntakeViewer } from "./intake-viewer";
import { PrdGenerator } from "./prd-generator";
import type { IntakeData } from "@/lib/intake-schema";
import type { DocType } from "@/lib/prompts";

type Tab = "overview" | "intake" | "docs";

interface InitialSection {
  key: string;
  content: string;
  done: boolean;
}

export interface ExistingDoc {
  docType: DocType;
  status: string;
  updatedAt: string;
}

const DOC_TYPES: { key: DocType; name: string; desc: string }[] = [
  { key: "BRD", name: "BRD", desc: "Business Requirements Document" },
  { key: "PCR", name: "PCR", desc: "Project Change Request" },
  { key: "PRD", name: "PRD", desc: "Product Requirements Document" },
  { key: "SRS", name: "SRS", desc: "Software Requirements Specification" },
  { key: "FSD", name: "FSD", desc: "Functional Specification Document" },
  { key: "TSD", name: "TSD", desc: "Technical Specification Document" },
];

export function ProjectTabs({
  projectId,
  projectName,
  initialIntake,
  hasIntake,
  initialSections,
  meta,
  editorData,
  existingDocs,
  hasAnyDoc,
}: {
  projectId: string;
  projectName: string;
  initialIntake: IntakeData;
  hasIntake: boolean;
  initialSections?: InitialSection[];
  meta?: { company: string; division: string; team: string[] };
  editorData?: {
    prdId: string;
    prdStatus: string;
    canApprove: boolean;
    currentUserId: string;
    currentVersionNo: number;
    sections: { id: string; key: string; content: string }[];
  };
  existingDocs: ExistingDoc[];
  hasAnyDoc: boolean;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [intake, setIntake] = useState<IntakeData>(initialIntake);
  const [isSaved, setIsSaved] = useState(hasIntake);
  // Which doc type is active in the docs tab (default: first existing doc, or PRD)
  const [selectedDoc, setSelectedDoc] = useState<DocType>(
    existingDocs[0]?.docType ?? "PRD",
  );

  const activeDocMeta = existingDocs.find((d) => d.docType === selectedDoc);
  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "intake", label: "Intake", badge: isSaved ? "saved" : undefined },
    {
      key: "docs",
      label: "Documents",
      badge: hasAnyDoc ? `${existingDocs.length} doc${existingDocs.length > 1 ? "s" : ""}` : "not started",
    },
  ];

  return (
    <div className="mt-8">
      <nav className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors -mb-px ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {t.badge && (
              <span
                className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full ${
                  t.badge === "saved" || (t.badge.startsWith("1") || t.badge.startsWith("2") || /\d doc/.test(t.badge))
                    ? "bg-accent-emerald/15 text-accent-emerald"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="rounded-3xl bg-surface p-8 shadow-soft">
            <h2 className="text-xl font-bold">Project Overview</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                This is the starting point for your{" "}
                <span className="font-semibold text-foreground">BRD</span>,{" "}
                <span className="font-semibold text-foreground">PCR</span>,{" "}
                <span className="font-semibold text-foreground">PRD</span>,{" "}
                <span className="font-semibold text-foreground">SRS</span>,{" "}
                <span className="font-semibold text-foreground">FSD</span>, and{" "}
                <span className="font-semibold text-foreground">TSD</span>.
              </p>
              <p>
                Start by filling in the{" "}
                <button
                  onClick={() => setTab("intake")}
                  className="text-primary hover:underline font-medium"
                >
                  Intake
                </button>{" "}
                tab — this tells our AI about your project. Then pick a document
                type to generate.
              </p>
            </div>
          </div>
        )}

        {tab === "intake" && (
          <IntakeForm
            projectId={projectId}
            initialIntake={intake}
            onSaved={(data) => {
              setIntake(data);
              setIsSaved(true);
            }}
          />
        )}

        {tab === "docs" && (
          <div className="space-y-6">
            {/* Doc type selector */}
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((dt) => {
                const existing = existingDocs.find((d) => d.docType === dt.key);
                const isActive = selectedDoc === dt.key;
                return (
                  <button
                    key={dt.key}
                    onClick={() => setSelectedDoc(dt.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-soft"
                        : existing
                          ? "bg-surface border-border hover:border-primary/40"
                          : "bg-surface/50 border-dashed border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {dt.name}
                    {existing && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent-emerald" />
                    )}
                  </button>
                  );
              })}
            </div>

            {/* Description of selected doc type */}
            <p className="text-sm text-muted-foreground">
              {DOC_TYPES.find((dt) => dt.key === selectedDoc)?.desc}
              {activeDocMeta && (
                <span className="ml-2 text-accent-emerald">
                  • {activeDocMeta.status === "ready" ? "Ready" : activeDocMeta.status}
                </span>
              )}
            </p>

            {/* Generator / editor for the selected docType */}
            <PrdGenerator
              key={selectedDoc}
              projectId={projectId}
              projectName={projectName}
              docType={selectedDoc}
              hasIntake={isSaved}
              initialSections={initialSections}
              meta={meta}
              editorData={activeDocMeta ? editorData : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
