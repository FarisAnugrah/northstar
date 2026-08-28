import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-sm font-medium text-gray-500">Northstar</p>
        <h1 className="mt-2 text-2xl font-bold text-center">Log in</h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Welcome back. Enter your email to receive a magic link.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
