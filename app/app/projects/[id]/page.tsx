import { notFound } from "next/navigation";
import Link from "next/link";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { emptyIntake, type IntakeData } from "@/lib/intake-schema";
import { ProjectTabs } from "./project-tabs";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { intake: true, prds: { take: 1 } },
  });

  if (!project) notFound();

  const intake: IntakeData = (project.intake?.payload as IntakeData) ?? emptyIntake;
  const hasIntake = !!project.intake;
  const hasPrd = project.prds.length > 0;

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to projects
      </Link>

      <header className="mt-6">
        <p className="text-sm font-medium text-primary">Project</p>
        <h1 className="mt-1 text-3xl font-bold">{project.name}</h1>
        {project.industry && (
          <p className="mt-1 text-muted-foreground">{project.industry}</p>
        )}
      </header>

      <ProjectTabs
        projectId={project.id}
        initialIntake={intake}
        hasIntake={hasIntake}
        hasPrd={hasPrd}
      />
    </main>
  );
}
