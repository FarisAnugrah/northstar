"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "@/lib/markdown-utils";

const components: Components = {
  h1: (props) => (
    <h1 className="mt-6 mb-2 text-xl font-bold text-foreground" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-5 mb-2 text-lg font-bold text-foreground" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-4 mb-1.5 text-base font-semibold text-foreground" {...props} />
  ),
  h4: (props) => (
    <h4 className="mt-3 mb-1 text-sm font-semibold text-foreground" {...props} />
  ),
  p: (props) => (
    <p className="my-2 leading-relaxed text-foreground/90" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  ul: (props) => <ul className="my-2 space-y-1 list-disc pl-5" {...props} />,
  ol: (props) => <ol className="my-2 space-y-1 list-decimal pl-5" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-xs" {...props} />
  ),
  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm"
        style={{ borderSpacing: 0 }}
        {...props}
      />
    </div>
  ),
  thead: (props) => (
    <thead className="bg-muted text-left" {...props} />
  ),
  th: (props) => (
    <th
      className="border-b border-border px-3 py-2 font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-b border-border px-3 py-2 align-top" {...props} />
  ),
  tr: (props) => (
    <tr className="border-b border-border" {...props} />
  ),
  hr: () => <hr className="my-4 border-border" />,
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}