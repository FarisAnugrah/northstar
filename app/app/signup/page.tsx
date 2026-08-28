import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-medium text-gray-500">Northstar</p>
        <h1 className="mt-2 text-2xl font-bold text-center">Create account</h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Start with 3 free specs. No credit card required.
        </p>
        <SignupForm />
      </div>
    </main>
  );
}
