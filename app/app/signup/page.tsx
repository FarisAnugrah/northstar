import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-lift">
        <p className="text-center text-sm font-bold text-primary">Northstar</p>
        <h1 className="mt-3 text-2xl font-bold text-center">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Start with 3 free specs. No credit card required.
        </p>
        <SignupForm />
      </div>
    </main>
  );
}
