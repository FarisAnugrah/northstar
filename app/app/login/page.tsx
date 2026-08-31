import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-lift">
        <p className="text-center text-sm font-bold text-primary">Northstar</p>
        <h1 className="mt-3 text-2xl font-bold text-center">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Welcome back. Log in to continue.
        </p>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
