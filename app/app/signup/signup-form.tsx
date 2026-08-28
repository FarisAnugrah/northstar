"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/onboarding");
    } else {
      router.push("/login?check_email=1");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
