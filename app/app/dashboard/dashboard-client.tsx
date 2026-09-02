import { OnboardingTour } from "./onboarding-tour";

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface ProjectSummary {
  id: string;
  name: string;
  industry: string | null;
  hasIntake: boolean;
  prdStatus: string | null;
  updatedAt: string;
}

interface Stats {
  projects: number;
  prds: number;
  ready: number;
}

type StatusFilter = "all" | "ready" | "draft" | "no_prd";

const STATUS_LABEL: Record<string, string> = {
  ready: "PRD ready",
  generating: "Generating",
  draft: "Draft",
};

const STATUS_COLOR: Record<string, string> = {
  ready: "bg-accent-emerald/15 text-accent-emerald",
  generating: "bg-accent-amber/15 text-accent-amber",
  draft: "bg-muted text-muted-foreground",
};

export function DashboardClient({
  stats,
  initialProjects,
}: {
  stats: Stats;
  initialProjects: ProjectSummary[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialProjects.filter((p) => {
      // search
      if (q && !p.name.toLowerCase().includes(q) && !(p.industry ?? "").toLowerCase().includes(q)) {
        return false;
      }
      // filter
      if (filter === "all") return true;
      if (filter === "no_prd") return !p.prdStatus;
      return p.prdStatus === filter;
    });
  }, [initialProjects, query, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "ready", label: "Ready" },
    { key: "draft", label: "Draft" },
    { key: "no_prd", label: "No PRD" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <OnboardingTour />
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 tour-stats-card">
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Total PRDs" value={stats.prds} />
        <StatCard label="Ready" value={stats.ready} accent />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full sm:w-72 px-3 py-2.5 border border-border rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f.key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-surface border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl bg-surface/50">
          <p className="text-muted-foreground">
            {initialProjects.length === 0
              ? "No projects yet."
              : "No projects match your search."}
          </p>
          {initialProjects.length === 0 && (
            <Link
              href="/projects/new"
              className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Create your first project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group rounded-2xl bg-surface p-5 shadow-soft border border-border/60 hover:shadow-lift hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                {p.prdStatus ? (
                  <span
                    className={`shrink-0 px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLOR[p.prdStatus] ?? STATUS_COLOR.draft}`}
                  >
                    {STATUS_LABEL[p.prdStatus] ?? p.prdStatus}
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground font-medium">
                    No PRD
                  </span>
                )}
              </div>

              {p.industry && (
                <p className="mt-1 text-sm text-muted-foreground">{p.industry}</p>
              )}

              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className={p.hasIntake ? "text-accent-emerald" : "text-muted-foreground/60"}>
                  {p.hasIntake ? "✓ Intake" : "◦ No intake"}
                </span>
                <span>{timeAgo(p.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-soft border ${
        accent ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border/60"
      }`}
    >
      <p className={`text-sm ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
