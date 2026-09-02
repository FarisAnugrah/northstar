"use client";

import { useState } from "react";
import { IntakeForm } from "./intake-form";
import { IntakeViewer } from "./intake-viewer";
import { PrdGenerator } from "./prd-generator";
import type { IntakeData } from "@/lib/intake-schema";
import type { DocType } from "@/lib/prompts";
import { FileText, ChevronLeft, Calendar, ShieldCheck, HardDrive, LayoutTemplate, Briefcase, CheckCircle2, Circle } from "lucide-react";

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

const DOC_ICONS: Record<DocType, any> = {
  BRD: Briefcase,
  PCR: Calendar,
  PRD: LayoutTemplate,
  SRS: ShieldCheck,
  FSD: FileText,
  TSD: HardDrive,
};

export function ProjectPipeline({
  projectId,
  projectName,
  initialIntake,
  hasIntake,
  initialSections,
  meta,
  editorData,
  existingDocs,
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
}) {
  const [intake, setIntake] = useState<IntakeData>(initialIntake);
  const [isSaved, setIsSaved] = useState(hasIntake);
  const [isEditingIntake, setIsEditingIntake] = useState(!hasIntake);
  
  // Default to null, or latest if we just landed
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(
    existingDocs[0]?.docType ?? null,
  );

  const activeDocMeta = selectedDoc ? existingDocs.find((d) => d.docType === selectedDoc) : undefined;

  return (
    <div className="mt-8 space-y-12">
      {/* STEP 1: PROJECT CONTEXT */}
      <section className="relative">
        <div className="flex items-center gap-3 mb-6">
          {isSaved && !isEditingIntake ? (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
          <h2 className="text-2xl font-bold tracking-tight">1. Project Context</h2>
          {isSaved && !isEditingIntake && (
            <button 
              
              className="ml-auto text-sm text-primary hover:underline font-medium"
            >
              Edit Context
            </button>
          )}
        </div>

        <div className={`transition-all duration-500 ease-in-out ${!isSaved || isEditingIntake ? 'opacity-100 relative z-10' : 'opacity-70'}`}>
          {isSaved && !isEditingIntake ? (
            <div className="bg-surface border rounded-3xl p-6 shadow-soft" >
               <IntakeViewer intake={intake} onEdit={() => setIsEditingIntake(true)} />
            </div>
          ) : (
            <div className="bg-surface border rounded-3xl p-8 shadow-soft relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
               <IntakeForm
                 projectId={projectId}
                 initialIntake={intake}
                 onSaved={(data) => {
                   setIntake(data);
                   setIsSaved(true);
                   setIsEditingIntake(false);
                 }}
               />
            </div>
          )}
        </div>
      </section>

      {/* STEP 2 & 3: DOCUMENT GENERATION */}
      <section className={`relative transition-all duration-500 ${!isSaved ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-6">
          {selectedDoc ? (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
          <h2 className="text-2xl font-bold tracking-tight">2. Documents</h2>
        </div>

        <div className="bg-surface/50 border rounded-3xl p-8 shadow-soft">
          {!selectedDoc ? (
            // Grid View
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Select Document Type</h3>
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
                          : "bg-surface border-dashed border-border/80 hover:border-primary/50"
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
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors -ml-3"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to document types
              </button>

              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    {(() => {
                      const Icon = DOC_ICONS[selectedDoc];
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{selectedDoc} <span className="text-muted-foreground font-normal">| {DOC_TYPES.find((dt) => dt.key === selectedDoc)?.name}</span></h2>
                    {activeDocMeta && (
                      <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                        Status: 
                        <span className="text-accent-emerald font-medium capitalize">
                          {activeDocMeta.status === "ready" ? "Ready" : activeDocMeta.status.replace('_', ' ')}
                        </span>
                      </p>
                    )}
                  </div>
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
      </section>
    </div>
  );
}
