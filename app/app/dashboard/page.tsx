import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const { user, workspace } = await requireWorkspace();
  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{workspace.name}</p>
          <h1 className="text-3xl font-bold">Projects</h1>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="mt-12 text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No projects yet.</p>
          <Link
            href="/projects/new"
            className="mt-2 inline-block text-sm font-medium underline"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y border rounded-lg">
          {projects.map((p) => (
            <li key={p.id} className="p-4 hover:bg-gray-50">
              <Link href={`/projects/${p.id}`} className="block">
                <p className="font-medium">{p.name}</p>
                {p.industry && (
                  <p className="text-sm text-gray-500">{p.industry}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
