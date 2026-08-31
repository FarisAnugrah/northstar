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
  const { user, workspace, role } = await requireWorkspace();

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: workspace.id },
    include: {
      intake: true,
      prds: {
        take: 1,
        include: { _count: { select: { versions: true } } },
      },
    },
  });

  if (!project) notFound();

  const intake: IntakeData = (project.intake?.payload as IntakeData) ?? emptyIntake;
  const hasIntake = !!project.intake;
  const hasPrd = project.prds.length > 0;

  // Load existing PRD sections if PRD is ready
  let initialSections: { key: string; content: string; done: boolean }[] | undefined;
  let editorData: {
    prdId: string;
    prdStatus: string;
    canApprove: boolean;
    currentUserId: string;
    currentVersionNo: number;
    sections: { id: string; key: string; content: string }[];
  } | undefined;
  if (hasPrd) {
    const prd = project.prds[0];
    // Use currentVersionId, or fall back to the latest version
    const versionId = prd.currentVersionId;
    if (versionId) {
      const sections = await prisma.prdSection.findMany({
        where: { versionId },
        orderBy: { orderIdx: "asc" },
      });
      initialSections = sections.map((s) => ({
        key: s.key,
        content: s.content,
        done: true,
      }));
      editorData = {
        prdId: prd.id,
        prdStatus: prd.status,
        canApprove: role === "OWNER" || role === "ADMIN",
        currentUserId: user.id,
        currentVersionNo: prd._count.versions,
        sections: sections.map((s) => ({
          id: s.id,
          key: s.key,
          content: s.content,
        })),
      };
    }
  }

  const meta = {
    company: workspace.name,
    division: project.industry ?? "Product",
    team: user.name ? [user.name] : [],
  };

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
        projectName={project.name}
        initialIntake={intake}
        hasIntake={hasIntake}
        hasPrd={hasPrd}
        initialSections={initialSections}
        meta={meta}
        editorData={editorData}
      />
    </main>
  );
}
