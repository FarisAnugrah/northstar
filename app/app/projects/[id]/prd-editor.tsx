"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface VersionInfo {
  id: string;
  versionNo: number;
  createdAt: string;
  createdBy: string;
}

interface CommentInfo {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

interface PrdEditorProps {
  prdId: string;
  prdStatus: string;
  canApprove: boolean;
  sections: { id: string; key: string; content: string }[];
  labels: Record<string, string>;
  currentVersionNo: number;
  currentUserId: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  ready: "Ready",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-accent-amber/15 text-accent-amber",
  approved: "bg-accent-emerald/15 text-accent-emerald",
  ready: "bg-accent-emerald/15 text-accent-emerald",
};

export function PrdEditor({
  prdId,
  prdStatus,
  canApprove,
  sections: initialSections,
  labels,
  currentVersionNo,
  currentUserId,
}: PrdEditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [activeKey, setActiveKey] = useState(initialSections[0]?.key ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [currentVersion, setCurrentVersion] = useState(currentVersionNo);
  const [showVersions, setShowVersions] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState(prdStatus);
  const [comments, setComments] = useState<CommentInfo[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
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

  const loadComments = async () => {
    if (!active) return;
    const res = await fetch(`/api/prd/sections/${active.id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments ?? []);
    }
  };

  // Load comments when section changes
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

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
    if (res.ok) window.location.reload();
  };

  const reviewAction = async (action: "submit" | "approve" | "reject") => {
    const res = await fetch(`/api/prd/${prdId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatus(data.status);
    }
  };

  const submitComment = async () => {
    if (!active || !commentText.trim()) return;
    const res = await fetch(`/api/prd/sections/${active.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentText.trim() }),
    });
    if (res.ok) {
      setCommentText("");
      loadComments();
    }
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    loadComments();
  };

  if (!active) return <p className="text-muted-foreground">No sections to edit.</p>;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold">Edit PRD</h3>
          <span className="text-xs text-muted-foreground">v{currentVersion}</span>
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLOR[status] ?? STATUS_COLOR.draft}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
          {saveState === "saving" && <span className="text-xs text-muted-foreground">Saving...</span>}
          {saveState === "saved" && <span className="text-xs text-accent-emerald">Saved</span>}
          {saveState === "error" && <span className="text-xs text-accent-rose">Save failed</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Approval actions */}
          {status === "draft" && (
            <button
              onClick={() => reviewAction("submit")}
              className="px-3 py-1.5 text-sm rounded-lg bg-accent-violet text-white font-medium hover:opacity-90"
            >
              Submit for review
            </button>
          )}
          {status === "in_review" && canApprove && (
            <>
              <button
                onClick={() => reviewAction("approve")}
                className="px-3 py-1.5 text-sm rounded-lg bg-accent-emerald text-white font-medium hover:opacity-90"
              >
                Approve
              </button>
              <button
                onClick={() => reviewAction("reject")}
                className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted"
              >
                Reject
              </button>
            </>
          )}
          {status === "in_review" && !canApprove && (
            <span className="text-xs text-muted-foreground self-center">Waiting for admin</span>
          )}
          {status === "approved" && (
            <span className="text-xs text-accent-emerald font-medium self-center">✓ Approved</span>
          )}

          <button
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) loadComments();
            }}
            className={`px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted ${
              comments.length > 0 ? "ring-1 ring-primary/30" : ""
            }`}
          >
            Comments{comments.length > 0 ? ` (${comments.length})` : ""}
          </button>
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

      {/* Comments panel */}
      {showComments && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <h4 className="font-semibold text-sm">
            Comments for {labels[activeKey] ?? activeKey}
          </h4>
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          )}
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-xs">
                    {c.user.name ?? c.user.email}
                    <span className="ml-2 text-muted-foreground font-normal">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </p>
                  {c.user.id === currentUserId && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-xs text-muted-foreground hover:text-accent-rose"
                    >
                      delete
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitComment())}
              placeholder="Write a comment..."
              maxLength={2000}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}

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
                  <span className="ml-2 text-xs text-accent-emerald">(current)</span>
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1.5 bg-surface">
          {editor && (
            <>
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" bold />
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" italic />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="• List" />
              <ToolbarButton onClick={() => editor.chain().toggleOrderedList().focus().run()} active={editor.isActive("orderedList")} label="1. List" />
              <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="❝" />
            </>
          )}
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted"
        >
          {previewMode ? "Edit" : "Preview"}
        </button>
      </div>

      {previewMode ? (
        isHtml(active.content) ? (
          <div
            className="min-h-[300px] p-4 rounded-xl border border-border bg-white text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: active.content }}
          />
        ) : (
          <div className="min-h-[300px] p-4 rounded-xl border border-border bg-white text-sm leading-relaxed">
            <MarkdownRenderer content={active.content} />
          </div>
        )
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
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
        active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
      }`}
      style={{ fontWeight: bold ? 700 : undefined, fontStyle: italic ? "italic" : undefined }}
    >
      {label}
    </button>
  );
}
