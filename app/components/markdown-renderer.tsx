"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "@/lib/markdown-utils";

const components: Components = {
  h1: (props) => (
    <h1 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-foreground border-b pb-2" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-6 mb-3 text-xl font-bold tracking-tight text-foreground" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-5 mb-2 text-lg font-semibold tracking-tight text-foreground" {...props} />
  ),
  h4: (props) => (
    <h4 className="mt-4 mb-2 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props) => (
    <p className="my-4 leading-7 text-foreground/90" {...props} />
  ),
  strong: (props) => <strong className="font-bold text-foreground" {...props} />,
  ul: (props) => <ul className="my-4 space-y-2 list-disc pl-6 marker:text-muted-foreground" {...props} />,
  ol: (props) => <ol className="my-4 space-y-2 list-decimal pl-6 marker:text-muted-foreground font-medium" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  code: (props) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground" {...props} />
  ),
  pre: (props) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-50" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground" {...props} />
  ),
  table: (props) => (
    <div className="my-6 w-full overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm text-left"
          style={{ borderSpacing: 0 }}
          {...props}
        />
      </div>
    </div>
  ),
  thead: (props) => (
    <thead className="bg-muted/50 border-b border-border" {...props} />
  ),
  th: (props) => (
    <th
      className="px-4 py-3 font-semibold text-foreground border-r border-border last:border-r-0"
      {...props}
    />
  ),
  tbody: (props) => (
    <tbody className="divide-y divide-border" {...props} />
  ),
  td: (props) => (
    <td className="px-4 py-3 align-top border-r border-border last:border-r-0 text-foreground/90" {...props} />
  ),
  tr: (props) => (
    <tr className="hover:bg-muted/30 transition-colors" {...props} />
  ),
  hr: () => <hr className="my-8 border-border" />,
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="text-base font-sans prose-styles">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}