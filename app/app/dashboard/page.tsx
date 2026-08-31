import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const { user, workspace } = await requireWorkspace();

  // Stats
  const [projectCount, prdCount, readyPrdCount] = await Promise.all([
    prisma.project.count({ where: { workspaceId: workspace.id } }),
    prisma.prd.count({
      where: { project: { workspaceId: workspace.id } },
    }),
    prisma.prd.count({
      where: { project: { workspaceId: workspace.id }, status: "ready" },
    }),
  ]);

  // Projects with latest PRD status
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    include: {
      prds: { orderBy: { updatedAt: "desc" }, take: 1 },
      intake: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const stats = {
    projects: projectCount,
    prds: prdCount,
    ready: readyPrdCount,
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{workspace.name}</p>
          <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold shadow-soft hover:bg-primary-hover transition-colors"
        >
          + New project
        </Link>
      </header>

      <DashboardClient
        stats={stats}
        initialProjects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          industry: p.industry,
          hasIntake: !!p.intake,
          prdStatus: p.prds[0]?.status ?? null,
          updatedAt: p.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
