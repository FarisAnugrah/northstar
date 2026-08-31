"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_LABELS, PRD_SECTIONS } from "@/lib/prompts";
import type { PrdSectionKey } from "@/lib/prompts";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PrdEditor } from "./prd-editor";

interface SectionState {
  key: PrdSectionKey;
  content: string;
  done: boolean;
}

interface PrdGeneratorProps {
  projectId: string;
  projectName: string;
  hasIntake: boolean;
  initialSections?: { key: string; content: string; done: boolean }[];
  meta?: {
    company: string;
    division: string;
    team: string[];
  };
  editorData?: {
    prdId: string;
    prdStatus: string;
    canApprove: boolean;
    currentUserId: string;
    currentVersionNo: number;
    sections: { id: string; key: string; content: string }[];
  };
}

type ExportFormat = "markdown" | "docx" | "pdf";

const DEFAULT_META = {
  company: "Company Name",
  division: "Product",
  team: [],
};

export function PrdGenerator({
  projectId,
  projectName,
  hasIntake,
  initialSections,
  meta = DEFAULT_META,
  editorData,
}: PrdGeneratorProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [sections, setSections] = useState<SectionState[]>(
    initialSections?.map((s) => ({
      key: s.key as PrdSectionKey,
      content: s.content,
      done: s.done,
    })) ??
      PRD_SECTIONS.map((key) => ({ key, content: "", done: false })),
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    setSections(PRD_SECTIONS.map((key) => ({ key, content: "", done: false })));
    setProgress(0);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(
        `/api/prd/generate?projectId=${projectId}`,
        { signal: abort.signal },
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Generation failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          const event = JSON.parse(raw);
          if (event.type === "section") {
            setSections((prev) => {
              const next = prev.map((s) =>
                s.key === event.key ? { ...s, content: event.content, done: true } : s,
              );
              return next;
            });
            setProgress(event.index / event.total);
          } else if (event.type === "error") {
            throw new Error(event.message);
          } else if (event.type === "done") {
            setProgress(1);
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    setError(null);
    try {
      const doneSections = sections
        .filter((s) => s.done)
        .map((s) => ({ key: s.key, content: s.content }));

      const res = await fetch("/api/prd/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectName,
          format,
          sections: doneSections,
          meta: {
            docType: "PRODUCT REQUIREMENT DOCUMENT",
            version: "1.0",
            company: meta.company,
            team: meta.team,
            productName: projectName,
            division: meta.division,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Export failed");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `prd.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  if (!hasIntake) {
    return (
      <div className="text-muted-foreground">
        Fill in the Intake tab first to enable PRD generation.
      </div>
    );
  }

  const anyDone = sections.some((s) => s.done);
  const allDone = sections.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">PRD</h2>
        <div className="flex items-center gap-2">
          {allDone && anyDone && (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-soft">
              <span className="px-2 text-xs text-muted-foreground">Export:</span>
              <ExportButton
                label="MD"
                format="markdown"
                exporting={exporting}
                onExport={handleExport}
              />
              <ExportButton
                label="Word"
                format="docx"
                exporting={exporting}
                onExport={handleExport}
              />
              <ExportButton
                label="PDF"
                format="pdf"
                exporting={exporting}
                onExport={handleExport}
              />
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-soft hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {generating
              ? `Generating... ${Math.round(progress * 100)}%`
              : allDone && anyDone
                ? "Regenerate"
                : "Generate PRD"}
          </button>
          {editorData && allDone && anyDone && (
            <button
              onClick={() => setMode(mode === "edit" ? "view" : "edit")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                mode === "edit"
                  ? "bg-surface border border-border text-foreground hover:bg-muted"
                  : "bg-accent-violet text-white hover:bg-accent-violet/90"
              }`}
            >
              {mode === "edit" ? "View PRD" : "Edit PRD"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-accent-rose bg-accent-rose/5 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {generating && (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {mode === "edit" && editorData && allDone && anyDone ? (
        <PrdEditor
          prdId={editorData.prdId}
          prdStatus={editorData.prdStatus}
          canApprove={editorData.canApprove}
          currentUserId={editorData.currentUserId}
          sections={editorData.sections}
          labels={SECTION_LABELS}
          currentVersionNo={editorData.currentVersionNo}
        />
      ) : !anyDone && !generating ? (
        <div className="text-muted-foreground">
          Click <span className="font-semibold text-foreground">Generate PRD</span>{" "}
          to create your document from the intake.
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((s, i) =>
            s.done ? (
              <section
                key={s.key}
                className="rounded-3xl bg-surface p-8 shadow-soft"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-emerald/15 text-xs font-bold text-accent-emerald">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold">{SECTION_LABELS[s.key]}</h3>
                </div>
                <MarkdownRenderer content={s.content} />
              </section>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

function ExportButton({
  label,
  format,
  exporting,
  onExport,
}: {
  label: string;
  format: ExportFormat;
  exporting: ExportFormat | null;
  onExport: (f: ExportFormat) => void;
}) {
  return (
    <button
      onClick={() => onExport(format)}
      disabled={exporting === format}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
    >
      {exporting === format ? "..." : label}
    </button>
  );
}
