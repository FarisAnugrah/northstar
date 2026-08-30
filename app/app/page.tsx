import Link from "next/link";

const docTypes = ["BRD", "PRD", "SRS", "FSD", "TSD"];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-primary shadow-soft">
          <span className="h-2 w-2 rounded-full bg-primary" />
          AI spec generator for B2B SaaS teams
        </span>

        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight">
          Your north star for
          <br />
          <span className="bg-gradient-to-r from-primary via-accent-violet to-accent-rose bg-clip-text text-transparent">
            product specs
          </span>
        </h1>

        <p className="mt-6 text-xl text-muted-foreground">
          From a short description to a stakeholder-ready document in minutes.
          No more re-prompting ChatGPT.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {docTypes.map((doc) => (
            <span
              key={doc}
              className="rounded-lg bg-surface px-3 py-1.5 text-sm font-semibold text-primary shadow-soft"
            >
              {doc}
            </span>
          ))}
        </div>

        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-7 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lift hover:bg-primary-hover transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="px-7 py-3 bg-surface border border-border rounded-2xl font-semibold shadow-soft hover:bg-muted transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
