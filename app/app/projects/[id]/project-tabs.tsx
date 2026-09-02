import { FileText, ChevronLeft, Calendar, ShieldCheck, HardDrive, LayoutTemplate, Briefcase } from "lucide-react";
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


const DOC_ICONS: Record<DocType, any> = {
  BRD: Briefcase,
  PCR: Calendar,
  PRD: LayoutTemplate,
  SRS: ShieldCheck,
  FSD: FileText,
  TSD: HardDrive,
};
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
  // null means we are in the grid view choosing a doc type
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);

  const activeDocMeta = selectedDoc ? existingDocs.find((d) => d.docType === selectedDoc) : undefined;
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
            {!selectedDoc ? (
              // Grid View
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Select Document Type</h2>
                  <p className="text-muted-foreground mt-1">Choose the type of specification you want to generate or edit.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DOC_TYPES.map((dt) => {
                    const existing = existingDocs.find((d) => d.docType === dt.key);
                    const Icon = DOC_ICONS[dt.key];
                    return (
                      <button
                        key={dt.key}
                        onClick={() => setSelectedDoc(dt.key)}
                        className={`text-left group relative p-6 rounded-2xl border transition-all hover:shadow-lift ${
                          existing 
                            ? "bg-surface border-border hover:border-primary/50" 
                            : "bg-surface/40 border-dashed border-border/80 hover:border-primary/50 hover:bg-surface"
                        }`}
                      >
                        {existing && (
                          <span className="absolute top-4 right-4 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
                          </span>
                        )}
                        <div className={`p-3 w-fit rounded-xl mb-4 ${existing ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">{dt.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{dt.desc}</p>
                        
                        {existing && (
                          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-emerald/10 text-accent-emerald text-xs font-medium capitalize">
                            {existing.status === 'ready' ? 'Ready' : existing.status.replace('_', ' ')}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Generator / Editor View
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to document types
                </button>

                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedDoc}</h2>
                    <p className="text-muted-foreground mt-1">
                      {DOC_TYPES.find((dt) => dt.key === selectedDoc)?.desc}
                      {activeDocMeta && (
                        <span className="ml-2 text-accent-emerald font-medium capitalize">
                          • {activeDocMeta.status === "ready" ? "Ready" : activeDocMeta.status.replace('_', ' ')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

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
        )}
      </div>
    </div>
  );
}
