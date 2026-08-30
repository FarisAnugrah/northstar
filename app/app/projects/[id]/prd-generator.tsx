"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_LABELS, PRD_SECTIONS } from "@/lib/prompts";
import type { PrdSectionKey } from "@/lib/prompts";

interface SectionState {
  key: PrdSectionKey;
  content: string;
  done: boolean;
}

interface PrdGeneratorProps {
  projectId: string;
  hasIntake: boolean;
  initialSections?: { key: string; content: string; done: boolean }[];
}

export function PrdGenerator({
  projectId,
  hasIntake,
  initialSections,
}: PrdGeneratorProps) {
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

      {!anyDone && !generating ? (
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

function MarkdownRenderer({ content }: { content: string }) {
  // Minimal Markdown renderer for PRD sections (headings, bullets, bold, tables)
  const lines = content.split("\n");
  const out: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let key = 0;

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return;
    out.push(
      <div key={`table-${key}`} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className="border-b border-border">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2 align-top ${ri === 0 ? "font-semibold bg-muted" : ""}`}
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    key++;
    tableRows = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("|")) {
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return; // separator row
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(cells);
      return;
    }
    flushTable();
    inTable = false;

    const k = key++;
    if (trimmed === "") return;
    else if (trimmed.startsWith("### "))
      out.push(<h4 key={k} className="mt-4 font-semibold">{trimmed.slice(4)}</h4>);
    else if (trimmed.startsWith("## "))
      out.push(<h3 key={k} className="mt-5 text-lg font-semibold">{trimmed.slice(3)}</h3>);
    else if (trimmed.startsWith("# "))
      out.push(<h2 key={k} className="mt-6 text-xl font-bold">{trimmed.slice(2)}</h2>);
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* "))
      out.push(
        <div key={k} className="flex gap-2 my-1">
          <span className="text-primary">•</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </div>,
      );
    else if (/^\d+\.\s/.test(trimmed))
      out.push(
        <div key={k} className="flex gap-2 my-1">
          <span className="text-muted-foreground">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</span>
        </div>,
      );
    else out.push(<p key={k} className="my-2 leading-relaxed">{renderInline(trimmed)}</p>);
  });
  flushTable();

  return <div className="text-sm text-foreground/90">{out}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**"))
      parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`"))
      parts.push(
        <code key={k++} className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {token.slice(1, -1)}
        </code>,
      );
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
