"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

interface VersionInfo {
  id: string;
  versionNo: number;
  createdAt: string;
  createdBy: string;
}

interface PrdEditorProps {
  prdId: string;
  sections: { id: string; key: string; content: string }[];
  labels: Record<string, string>;
  currentVersionNo: number;
  onVersionChange?: (no: number) => void;
}

export function PrdEditor({
  prdId,
  sections: initialSections,
  labels,
  currentVersionNo,
  onVersionChange,
}: PrdEditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [activeKey, setActiveKey] = useState(initialSections[0]?.key ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState(currentVersionNo);
  const [showVersions, setShowVersions] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKeyRef = useRef(initialSections[0]?.key ?? "");
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const active = sections.find((s) => s.key === activeKey) ?? sections[0];

  const editor = useEditor({
    extensions: [StarterKit],
    content: active?.content ?? "",
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[300px] p-4 rounded-xl border border-border bg-white focus:outline-none text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const key = activeKeyRef.current;
      const section = sectionsRef.current.find((s) => s.key === key);
      if (!section) return;
      setSections((prev) => prev.map((s) => (s.key === key ? { ...s, content: html } : s)));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveState("saving");
      saveTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/prd/sections/${section.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: html }),
          });
          if (!res.ok) throw new Error();
          setSaveState("saved");
          setTimeout(() => setSaveState("idle"), 1500);
        } catch {
          setSaveState("error");
        }
      }, 800);
    },
  });

  // Switch editor content when section changes
  useEffect(() => {
    if (editor && active) {
      editor.commands.setContent(active.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, editor]);

  const loadVersions = async () => {
    const res = await fetch(`/api/prd/${prdId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data.versions ?? []);
    }
  };

  const saveVersion = async () => {
    setSaveState("saving");
    const res = await fetch(`/api/prd/${prdId}/versions`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setCurrentVersion(data.versionNo);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
      loadVersions();
    } else {
      setSaveState("error");
    }
  };

  const rollback = async (versionNo: number) => {
    if (!confirm(`Rollback ke versi ${versionNo}? Konten saat ini akan disimpan sebagai versi baru.`)) return;
    const res = await fetch(`/api/prd/${prdId}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNo }),
    });
    if (res.ok) {
      const data = await res.json();
      setCurrentVersion(data.versionNo);
      // Reload halaman untuk ambil data terbaru
      window.location.reload();
    }
  };

  if (!active) return <p className="text-muted-foreground">No sections to edit.</p>;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold">Edit PRD</h3>
          <span className="text-xs text-muted-foreground">v{currentVersion}</span>
          {saveState === "saving" && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {saveState === "saved" && <span className="text-xs text-emerald-600">Saved</span>}
          {saveState === "error" && <span className="text-xs text-rose-600">Save failed</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = !showVersions;
              setShowVersions(next);
              if (next) loadVersions();
            }}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted"
          >
            History
          </button>
          <button
            onClick={saveVersion}
            disabled={saveState === "saving"}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
          >
            Save Version
          </button>
        </div>
      </div>

      {/* Version history panel */}
      {showVersions && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
          <h4 className="font-semibold text-sm">Version History</h4>
          {versions.length === 0 && (
            <p className="text-sm text-muted-foreground">No versions saved yet.</p>
          )}
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 border-border/50"
            >
              <div>
                <span className="font-medium">v{v.versionNo}</span>
                {v.versionNo === currentVersion && (
                  <span className="ml-2 text-xs text-emerald-600">(current)</span>
                )}
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(v.createdAt).toLocaleString()}
                </span>
              </div>
              {v.versionNo !== currentVersion && (
                <button
                  onClick={() => rollback(v.versionNo)}
                  className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                >
                  Rollback
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setActiveKey(s.key);
              activeKeyRef.current = s.key;
            }}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              s.key === activeKey
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {labels[s.key] ?? s.key}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1.5 bg-surface">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="B"
            bold
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="I"
            italic
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            label="H3"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="• List"
          />
          <ToolbarButton
            onClick={() => editor.chain().toggleOrderedList().focus().run()}
            active={editor.isActive("orderedList")}
            label="1. List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="❝"
          />
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  bold,
  italic,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted"
      }`}
      style={{ fontWeight: bold ? 700 : undefined, fontStyle: italic ? "italic" : undefined }}
    >
      {label}
    </button>
  );
}
