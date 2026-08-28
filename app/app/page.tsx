import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">Northstar</h1>
        <p className="mt-6 text-xl text-gray-600">
          AI-powered spec generator for B2B SaaS teams.
        </p>
        <p className="mt-3 text-lg text-gray-500">
          Your north star for product specs. BRD to TSD, all in one workflow.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
