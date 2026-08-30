import Link from "next/link";
import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to projects
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">New project</h1>
        <p className="mt-2 text-muted-foreground">
          Give your project a name. You can add industry and details after.
        </p>
      </div>

      <div className="mt-8 rounded-3xl bg-surface p-8 shadow-soft">
        <NewProjectForm />
      </div>
    </main>
  );
}
