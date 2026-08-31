"use client";

import { useState } from "react";
import { IntakeForm } from "./intake-form";
import { IntakeViewer } from "./intake-viewer";
import { PrdGenerator } from "./prd-generator";
import type { IntakeData } from "@/lib/intake-schema";

type Tab = "overview" | "intake" | "prd";

interface InitialSection {
  key: string;
  content: string;
  done: boolean;
}

export function ProjectTabs({
  projectId,
  projectName,
  initialIntake,
  hasIntake,
  hasPrd,
  initialSections,
  meta,
  editorData,
}: {
  projectId: string;
  projectName: string;
  initialIntake: IntakeData;
  hasIntake: boolean;
  hasPrd: boolean;
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
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [intake, setIntake] = useState<IntakeData>(initialIntake);
  const [isSaved, setIsSaved] = useState(hasIntake);

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "intake", label: "Intake", badge: isSaved ? "saved" : undefined },
    { key: "prd", label: "PRD", badge: hasPrd ? "ready" : "not started" },
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
                  t.badge === "saved" || t.badge === "ready"
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
                tab — this tells our AI about your project. Then generate your
                PRD.
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

        {tab === "prd" && (
          <PrdGenerator
            projectId={projectId}
            projectName={projectName}
            hasIntake={isSaved}
            initialSections={initialSections}
            meta={meta}
            editorData={editorData}
          />
        )}
      </div>
    </div>
  );
}
